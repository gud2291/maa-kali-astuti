import "server-only";
import { and, count, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { isUniqueViolation } from "@/server/db/errors";
import { db } from "@/server/db/client";
import {
  orders,
  orderItems,
  orderEvents,
  coupons,
  couponRedemptions,
  checkoutDrafts,
  payments,
  addresses,
} from "@/server/db/schema/commerce";
import { products } from "@/server/db/schema/catalog";
import { accessKeyFor, orderNumber, sha256Hex } from "@/server/ids";
import { getSetting } from "@/server/settings/queries";
import { quoteCheckout } from "@/server/cart/quote";
import { nextInvoiceNo } from "./numbers";
import { istDayKey } from "@/lib/core/ist";
import { muhurat } from "@/lib/core/dates";
import { AppError } from "@/server/result";
import type { CheckoutInput } from "@/lib/validation/checkout";
import type { ShipAddress } from "@/lib/domain/types";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function finalizePlacement(
  tx: Tx,
  orderId: number,
  mode: "strict" | "paid",
  draftToken?: string | null,
): Promise<void> {
  const [order] = await tx
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  const items = await tx
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  // 1. Stock decrement per item
  const oversoldIds: string[] = [];

  for (const item of items) {
    const res = await tx
      .update(products)
      .set({ stock: sql`${products.stock} - ${item.qty}` })
      .where(
        and(
          eq(products.id, item.productId),
          gte(products.stock, item.qty),
        ),
      )
      .returning({ stock: products.stock });

    if (res.length === 0) {
      if (mode === "strict") {
        throw new AppError("OUT_OF_STOCK");
      } else {
        await tx
          .update(products)
          .set({ stock: 0 })
          .where(eq(products.id, item.productId));
        oversoldIds.push(item.productId);
      }
    }
  }

  if (oversoldIds.length > 0) {
    const reason = `Oversold: ${oversoldIds.join(", ")}`;
    await tx
      .update(orders)
      .set({
        needsAttention: true,
        attentionReason: reason,
      })
      .where(eq(orders.id, orderId));

    await tx.insert(orderEvents).values({
      orderId,
      type: "attention",
      message: reason,
      public: false,
    });
  }

  // 2. Coupon usage
  if (order.couponCode) {
    const [cRow] = await tx
      .select()
      .from(coupons)
      .where(eq(coupons.code, order.couponCode))
      .limit(1);

    if (cRow) {
      if (mode === "strict" && cRow.usageLimit != null) {
        const res = await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(
            and(
              eq(coupons.id, cRow.id),
              lt(coupons.usedCount, cRow.usageLimit),
            ),
          )
          .returning({ id: coupons.id });

        if (res.length === 0) {
          throw new AppError("COUPON_USED");
        }
      } else {
        await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, cRow.id));
      }

      await tx.insert(couponRedemptions).values({
        couponId: cRow.id,
        orderId,
        email: order.email,
        discountInr: order.discountInr,
      });
    }
  }

  // 3. Invoice number via nextInvoiceNo
  if (!order.invoiceNo) {
    const invoiceSettings = await getSetting("invoice");
    const prefix = invoiceSettings.prefix || "MKA";
    const invoiceNo = await nextInvoiceNo(tx, prefix);
    await tx.update(orders).set({ invoiceNo }).where(eq(orders.id, orderId));
  }

  // 4. Link checkout draft
  if (draftToken) {
    await tx
      .update(checkoutDrafts)
      .set({ orderId })
      .where(eq(checkoutDrafts.token, draftToken));
  }
}

export async function placeOrder(
  input: CheckoutInput,
  ctx: { userId: number | null; ip: string },
): Promise<{ orderId: number; number: string; accessKey: string; totalInr: number }> {
  // Quote first
  const quote = await quoteCheckout({
    lines: input.lines,
    delivery: input.delivery,
    method: input.method,
    gift: input.gift,
    couponCode: input.couponCode,
    email: input.contact.email,
  });

  // Any OUT_OF_STOCK / UNAVAILABLE issue
  const hasUnavailOrOos = quote.issues.some(
    (i) => i.code === "OUT_OF_STOCK" || i.code === "UNAVAILABLE",
  );
  if (hasUnavailOrOos || quote.lines.length === 0) {
    throw new AppError("OUT_OF_STOCK");
  }

  // Coupon given but not ok
  if (input.couponCode) {
    if (!quote.couponResult || !quote.couponResult.ok) {
      const reason = quote.couponResult?.msg;
      if (reason === "minCart") throw new AppError("COUPON_MIN_CART");
      if (reason === "expired") throw new AppError("COUPON_EXPIRED");
      if (reason === "used") throw new AppError("COUPON_USED");
      throw new AppError("COUPON_INVALID");
    }
  }

  // COD not allowed
  if (input.method === "cod" && !quote.codAllowed) {
    throw new AppError("VALIDATION", "COD not allowed", { method: "cod" });
  }

  const store = await getSetting("store");
  const now = new Date();
  const energizationOn = store.nextMahapuja ?? istDayKey(muhurat(now));

  const shipAddress: ShipAddress = {
    name: input.contact.name,
    phone: input.contact.phone,
    line1: input.address.line1,
    line2: input.address.line2 || "",
    landmark: input.address.landmark || "",
    city: input.address.city,
    state: input.address.state,
    pincode: input.address.pincode,
  };

  const isCod = input.method === "cod";
  const orderStatus = isCod ? "placed" : "pending_payment";
  const paymentStatus = isCod ? "cod_pending" : "unpaid";
  const placedAt = isCod ? now : null;

  let orderId = 0;
  let finalNumber = "";
  let finalAccessKey = "";

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const num = orderNumber();
      const accessKey = accessKeyFor("order", num);
      const accessHash = sha256Hex(accessKey);

      const inserted = await db.transaction(async (tx) => {
        const [ord] = await tx
          .insert(orders)
          .values({
            number: num,
            accessHash,
            userId: ctx.userId,
            locale: input.locale,
            name: input.contact.name,
            email: input.contact.email,
            phone: input.contact.phone,
            shipAddress,
            status: orderStatus,
            paymentMethod: input.method,
            paymentStatus,
            payPref: input.payPref,
            delivery: input.delivery,
            itemsInr: quote.totals.items,
            mrpInr: quote.totals.mrp,
            energInr: quote.totals.energ,
            discountInr: quote.totals.disc,
            giftInr: quote.totals.gift,
            shippingInr: quote.totals.ship,
            expressInr: quote.totals.express,
            codInr: quote.totals.cod,
            totalInr: quote.totals.total,
            couponCode: quote.coupon ? quote.coupon.code : null,
            gift: input.gift,
            giftMessage: input.giftMessage,
            customerNote: input.note,
            energizationOn,
            ip: ctx.ip,
            placedAt,
          })
          .returning({ id: orders.id });

        const itemInserts = quote.lines.map((l) => ({
          orderId: ord.id,
          productId: l.pid,
          nameEn: l.name.en,
          nameHi: l.name.hi,
          slug: l.slug,
          image: l.image,
          variant: l.variant,
          qty: l.qty,
          priceInr: l.price,
          mrpInr: l.mrp,
          energInr: l.energInr,
          energName: l.energ?.name ?? null,
          energGotra: l.energ?.gotra ?? null,
          lineTotalInr: l.lineTotal,
          gstRate: l.gstRate,
          hsn: l.hsn,
        }));
        await tx.insert(orderItems).values(itemInserts);

        await tx.insert(orderEvents).values({
          orderId: ord.id,
          type: "created",
          toStatus: orderStatus,
          message: isCod ? "Order placed (COD)" : "Order created (Pending payment)",
          public: true,
        });

        if (isCod) {
          await finalizePlacement(tx, ord.id, "strict", input.draftToken);
        } else if (input.draftToken) {
          await tx
            .update(checkoutDrafts)
            .set({ orderId: ord.id })
            .where(eq(checkoutDrafts.token, input.draftToken));
        }

        if (input.saveAddress && ctx.userId) {
          const [countRow] = await tx
            .select({ count: count() })
            .from(addresses)
            .where(eq(addresses.userId, ctx.userId));

          const totalAddrs = countRow?.count ?? 0;
          if (totalAddrs < 10) {
            await tx.insert(addresses).values({
              userId: ctx.userId,
              name: input.contact.name,
              phone: input.contact.phone,
              line1: input.address.line1,
              line2: input.address.line2 || "",
              landmark: input.address.landmark || "",
              city: input.address.city,
              state: input.address.state,
              pincode: input.address.pincode,
              isDefault: totalAddrs === 0,
              updatedAt: new Date(),
            });
          }
        }

        return { id: ord.id, number: num, accessKey };
      });

      orderId = inserted.id;
      finalNumber = inserted.number;
      finalAccessKey = inserted.accessKey;
      break;
    } catch (err: unknown) {
      if (err instanceof AppError) throw err;
      if (attempt === 2) throw err;
      if (!isUniqueViolation(err)) {
        throw err;
      }
    }
  }

  return {
    orderId,
    number: finalNumber,
    accessKey: finalAccessKey,
    totalInr: quote.totals.total,
  };
}

export async function markOrderPaid({
  orderId,
  rzpOrderId,
  rzpPaymentId,
  amountInr,
  method,
}: {
  orderId: number;
  rzpOrderId?: string | null;
  rzpPaymentId: string;
  amountInr: number;
  method?: string | null;
}): Promise<{ first: boolean }> {
  const now = new Date();

  // One transaction: first-time-paid update + payments row + event + finalize (stock, coupon, invoice)
  const txAResult = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalInr: orders.totalInr,
        razorpayOrderId: orders.razorpayOrderId,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!existing) {
      return { ok: false as const };
    }

    const updated = await tx
      .update(orders)
      .set({
        paymentStatus: "paid",
        paidAt: now,
        status: sql`CASE WHEN ${orders.status} = 'pending_payment' THEN 'placed' ELSE ${orders.status} END`,
        placedAt: sql`CASE WHEN ${orders.placedAt} IS NULL THEN ${now}::timestamptz ELSE ${orders.placedAt} END`,
        razorpayOrderId: rzpOrderId ? rzpOrderId : orders.razorpayOrderId,
      })
      // Only an unpaid order can become paid: a replayed confirm or a late webhook must never
      // flip a refunded / partially refunded order back to "paid" and re-run fulfilment.
      .where(and(eq(orders.id, orderId), inArray(orders.paymentStatus, ["unpaid", "failed"])))
      .returning({ id: orders.id, totalInr: orders.totalInr, status: orders.status });

    if (updated.length === 0) {
      // Already processed. A *different* captured payment (double pay, pay after refund) must
      // still be recorded and flagged so the admin can refund it.
      const extra = await tx
        .insert(payments)
        .values({
          entity: "order",
          entityId: orderId,
          provider: "razorpay",
          rzpOrderId: rzpOrderId ?? existing.razorpayOrderId ?? null,
          rzpPaymentId,
          amountInr,
          status: "captured",
          method: method ?? null,
        })
        .onConflictDoNothing({ target: payments.rzpPaymentId })
        .returning({ id: payments.id });
      if (extra.length > 0) {
        const reason = `Extra payment received: ${rzpPaymentId} (₹${amountInr}) — refund it`;
        await tx
          .update(orders)
          .set({ needsAttention: true, attentionReason: reason })
          .where(eq(orders.id, orderId));
        await tx.insert(orderEvents).values({ orderId, type: "attention", message: reason, public: false });
      }
      return { ok: false as const };
    }

    // A payment first reported as failed can be authorised later (Razorpay "late auth"):
    // reuse its row instead of failing on the unique rzp_payment_id.
    await tx
      .insert(payments)
      .values({
        entity: "order",
        entityId: orderId,
        provider: "razorpay",
        rzpOrderId: rzpOrderId ?? existing.razorpayOrderId ?? null,
        rzpPaymentId,
        amountInr,
        status: "captured",
        method: method ?? null,
      })
      .onConflictDoUpdate({
        target: payments.rzpPaymentId,
        set: { status: "captured", amountInr, method: method ?? null, error: null, updatedAt: now },
      });

    await tx.insert(orderEvents).values({
      orderId,
      type: "paid",
      fromStatus: existing.status,
      toStatus: existing.status === "pending_payment" ? "placed" : existing.status,
      message: `Payment captured: ${rzpPaymentId} (₹${amountInr})`,
      public: true,
    });

    // Paid after the daily cron cancelled the unpaid order: keep the money visible, never fulfil
    // automatically (no stock taken) — the admin restores or refunds it.
    if (existing.status === "cancelled") {
      const reason = "Payment received after the order was cancelled — restore or refund";
      await tx
        .update(orders)
        .set({ needsAttention: true, attentionReason: reason })
        .where(eq(orders.id, orderId));
      await tx.insert(orderEvents).values({
        orderId,
        type: "attention",
        message: reason,
        public: false,
      });
      return { ok: true as const };
    }

    if (amountInr !== updated[0].totalInr) {
      const reason = `Payment amount mismatch: received ₹${amountInr}, expected ₹${updated[0].totalInr}`;
      await tx
        .update(orders)
        .set({
          needsAttention: true,
          attentionReason: reason,
        })
        .where(eq(orders.id, orderId));

      await tx.insert(orderEvents).values({
        orderId,
        type: "attention",
        message: reason,
        public: false,
      });

      return { ok: true as const };
    }

    // Same transaction as the paid flag: if finalising fails, nothing is committed and the
    // webhook / confirm retry can still process the payment.
    await finalizePlacement(tx, orderId, "paid");
    return { ok: true as const };
  });

  return { first: txAResult.ok };
}

export async function recordPaymentFailure({
  orderId,
  rzpOrderId,
  rzpPaymentId,
  error,
}: {
  orderId: number;
  rzpOrderId?: string | null;
  rzpPaymentId?: string | null;
  error?: string | null;
}): Promise<void> {
  await db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, totalInr: orders.totalInr })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return;

    await tx.insert(payments).values({
      entity: "order",
      entityId: orderId,
      provider: "razorpay",
      rzpOrderId: rzpOrderId ?? null,
      rzpPaymentId: rzpPaymentId ?? null,
      amountInr: order.totalInr,
      status: "failed",
      error: error ?? "Payment failed",
    })
    // A late or repeated failure event for a payment we already recorded must not throw
    // (the webhook would answer 500 forever).
    .onConflictDoNothing({ target: payments.rzpPaymentId });

    await tx.insert(orderEvents).values({
      orderId,
      type: "status",
      message: `Payment failed: ${error || "Unknown error"}`,
      public: false,
    });
  });
}

