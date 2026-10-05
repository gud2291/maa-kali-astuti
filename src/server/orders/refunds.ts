import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { orders, orderEvents, payments, refunds } from "@/server/db/schema/commerce";
import { refundPayment } from "@/server/payments/razorpay";
import { requireAdmin, type AdminUser } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { log } from "@/server/log";
import { AppError } from "@/server/result";
import { sendOrderStatusEmail } from "./emails";
import { sendBookingCancelled } from "@/server/bookings/emails";
import { bookings } from "@/server/db/schema/consult";
import { after } from "next/server";
import type { PaymentStatus } from "@/lib/domain/enums";

export async function refundOrder(
  id: number,
  input: { amountInr: number; reason?: string },
  actor: AdminUser,
): Promise<{ ok: boolean; refundId: number; status: "pending" | "processed" }> {
  await requireAdmin("orders.refund");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    throw new AppError("NOT_FOUND", "Order not found");
  }

  if (input.amountInr <= 0) {
    throw new AppError("VALIDATION", "Refund amount must be at least ₹1");
  }

  const isOnline = order.paymentMethod !== "cod";

  // Money must have been received: online = paid, COD = cash collected (or already part-refunded).
  const refundable: PaymentStatus[] = isOnline
    ? ["paid", "partially_refunded"]
    : ["cod_collected", "partially_refunded"];
  if (!refundable.includes(order.paymentStatus)) {
    throw new AppError(
      "VALIDATION",
      `Cannot refund an order with payment status "${order.paymentStatus}"`,
    );
  }

  if (isOnline) {
    // Find captured payment
    const [payment] = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.entity, "order"),
          eq(payments.entityId, id),
          eq(payments.status, "captured"),
        ),
      )
      .orderBy(desc(payments.id))
      .limit(1);

    if (!payment || !payment.rzpPaymentId) {
      throw new AppError(
        "CONFLICT",
        "No captured online payment record found for this order",
      );
    }

    // Refunds still waiting for their webhook are not in refundedInr yet: count them too, so a
    // second click cannot refund the same money twice.
    const [pending] = await db
      .select({ total: sql<number>`coalesce(sum(${refunds.amountInr}), 0)` })
      .from(refunds)
      .where(
        and(eq(refunds.entity, "order"), eq(refunds.entityId, id), eq(refunds.status, "pending")),
      );
    const maxRefundable = payment.amountInr - (order.refundedInr || 0) - Number(pending?.total ?? 0);
    if (input.amountInr > maxRefundable) {
      throw new AppError(
        "VALIDATION",
        `Refund amount ₹${input.amountInr} exceeds max refundable ₹${maxRefundable}`,
      );
    }

    // Call Razorpay
    const rzpRefund = await refundPayment({
      paymentId: payment.rzpPaymentId,
      amountInr: input.amountInr,
      notes: {
        orderId: String(id),
        orderNumber: order.number,
        reason: input.reason || "",
      },
    });

    const [refundRow] = await db
      .insert(refunds)
      .values({
        paymentId: payment.id,
        entity: "order",
        entityId: id,
        rzpRefundId: rzpRefund.id,
        amountInr: input.amountInr,
        reason: input.reason ?? null,
        status: "pending",
        actorId: actor.id,
      })
      .returning();

    await db.insert(orderEvents).values({
      orderId: id,
      type: "refund",
      message: `Refund initiated via Razorpay: ₹${input.amountInr} (ID: ${rzpRefund.id})${input.reason ? ` - ${input.reason}` : ""}`,
      public: true,
      actorId: actor.id,
    });

    await audit({
      actorId: actor.id,
      action: "order.refund_initiated",
      entity: "order",
      entityId: id,
      summary: `Initiated ₹${input.amountInr} Razorpay refund (${rzpRefund.id}) for order ${order.number}`,
    });

    return { ok: true, refundId: refundRow.id, status: "pending" };
  } else {
    // COD / Manual refund
    const maxRefundable = order.totalInr - (order.refundedInr || 0);
    if (input.amountInr > maxRefundable) {
      throw new AppError(
        "VALIDATION",
        `Refund amount ₹${input.amountInr} exceeds max refundable ₹${maxRefundable}`,
      );
    }

    let [payment] = await db
      .select()
      .from(payments)
      .where(and(eq(payments.entity, "order"), eq(payments.entityId, id)))
      .orderBy(desc(payments.id))
      .limit(1);

    if (!payment) {
      const [newPay] = await db
        .insert(payments)
        .values({
          entity: "order",
          entityId: id,
          provider: "cod",
          amountInr: order.totalInr,
          status: "captured",
          method: "cash",
        })
        .returning();
      payment = newPay;
    }

    const newRefundedTotal = (order.refundedInr || 0) + input.amountInr;
    const newPaymentStatus: PaymentStatus =
      newRefundedTotal >= order.totalInr ? "refunded" : "partially_refunded";

    let refundRowId = 0;
    const now = new Date();

    await db.transaction(async (tx) => {
      const [r] = await tx
        .insert(refunds)
        .values({
          paymentId: payment.id,
          entity: "order",
          entityId: id,
          rzpRefundId: null,
          amountInr: input.amountInr,
          reason: input.reason ?? null,
          status: "processed",
          actorId: actor.id,
        })
        .returning();
      refundRowId = r.id;

      await tx
        .update(orders)
        .set({
          refundedInr: newRefundedTotal,
          paymentStatus: newPaymentStatus,
          updatedAt: now,
        })
        .where(eq(orders.id, id));

      await tx.insert(orderEvents).values({
        orderId: id,
        type: "refund",
        message: `Refund processed: ₹${input.amountInr}${input.reason ? ` - ${input.reason}` : ""}`,
        public: true,
        actorId: actor.id,
      });
    });

    await audit({
      actorId: actor.id,
      action: "order.refund_processed",
      entity: "order",
      entityId: id,
      summary: `Manual/COD refund of ₹${input.amountInr} processed for order ${order.number}`,
      diff: {
        refundedInr: [order.refundedInr, newRefundedTotal],
        paymentStatus: [order.paymentStatus, newPaymentStatus],
      },
    });

    after(() => {
      sendOrderStatusEmail(id, "refund_processed", {
        refundAmountInr: input.amountInr,
      }).catch((e) =>
        log.error("email.refund_processed_failed", {
          orderId: id,
          error: e instanceof Error ? e.message : String(e),
        }),
      );
    });

    return { ok: true, refundId: refundRowId, status: "processed" };
  }
}

export async function applyRefundWebhook(
  rzpRefundId: string,
  status: "processed" | "failed",
): Promise<void> {
  const [refRow] = await db
    .select()
    .from(refunds)
    .where(eq(refunds.rzpRefundId, rzpRefundId))
    .limit(1);

  if (!refRow) {
    log.warn("refund.webhook_unknown_refund", { rzpRefundId });
    return;
  }

  if (refRow.status === status) {
    return;
  }

  const now = new Date();

  if (refRow.entity === "booking") {
    if (status === "failed") {
      await db
        .update(refunds)
        .set({ status: "failed", updatedAt: now })
        .where(eq(refunds.id, refRow.id));
      return;
    }

    if (status === "processed") {
      await db.transaction(async (tx) => {
        await tx
          .update(refunds)
          .set({ status: "processed", updatedAt: now })
          .where(eq(refunds.id, refRow.id));

        if (refRow.paymentId) {
          await tx
            .update(payments)
            .set({ status: "refunded", updatedAt: now })
            .where(eq(payments.id, refRow.paymentId));
        }

        const [booking] = await tx
          .select()
          .from(bookings)
          .where(eq(bookings.id, refRow.entityId))
          .limit(1);

        if (booking) {
          const note = `Refund of ₹${refRow.amountInr} processed via Razorpay (${rzpRefundId})`;
          const adminNote = booking.adminNote
            ? `${booking.adminNote}; ${note}`
            : note;
          await tx
            .update(bookings)
            .set({ adminNote, updatedAt: now })
            .where(eq(bookings.id, booking.id));
        }
      });

      after(() => {
        sendBookingCancelled(refRow.entityId, {
          refundNote: `Refund of ₹${refRow.amountInr} has been processed via Razorpay (${rzpRefundId}).`,
        }).catch((e) =>
          log.error("email.booking_refund_webhook_email_failed", {
            bookingId: refRow.entityId,
            error: e instanceof Error ? e.message : String(e),
          }),
        );
      });
      return;
    }
  }

  if (refRow.entity !== "order") {
    log.warn("refund.webhook_unhandled_entity", { rzpRefundId, entity: refRow.entity });
    return;
  }

  if (status === "failed") {
    await db.transaction(async (tx) => {
      await tx
        .update(refunds)
        .set({ status: "failed", updatedAt: now })
        .where(eq(refunds.id, refRow.id));

      await tx.insert(orderEvents).values({
        orderId: refRow.entityId,
        type: "refund",
        message: `Razorpay refund failed: ${rzpRefundId} (₹${refRow.amountInr})`,
        public: false,
      });
    });
    return;
  }

  if (status === "processed") {
    await db.transaction(async (tx) => {
      await tx
        .update(refunds)
        .set({ status: "processed", updatedAt: now })
        .where(eq(refunds.id, refRow.id));

      const [order] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, refRow.entityId))
        .limit(1);

      if (order) {
        const newRefunded = (order.refundedInr || 0) + refRow.amountInr;
        const newPaymentStatus: PaymentStatus =
          newRefunded >= order.totalInr ? "refunded" : "partially_refunded";

        await tx
          .update(orders)
          .set({
            refundedInr: newRefunded,
            paymentStatus: newPaymentStatus,
            updatedAt: now,
          })
          .where(eq(orders.id, order.id));

        await tx.insert(orderEvents).values({
          orderId: order.id,
          type: "refund",
          message: `Refund processed via Razorpay: ₹${refRow.amountInr} (${rzpRefundId})`,
          public: true,
        });
      }
    });

    after(() => {
      sendOrderStatusEmail(refRow.entityId, "refund_processed", {
        refundAmountInr: refRow.amountInr,
      }).catch((e) =>
        log.error("email.refund_processed_webhook_email_failed", {
          orderId: refRow.entityId,
          error: e instanceof Error ? e.message : String(e),
        }),
      );
    });
  }
}
