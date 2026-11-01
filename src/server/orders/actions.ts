"use server";
import { after } from "next/server";
import { runAction, type ActionResult, AppError } from "@/server/result";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { verifyTurnstile } from "@/server/auth/turnstile";
import { getCustomer } from "@/server/auth/guards";
import { checkoutSchema } from "@/lib/validation/checkout";
import { getSetting } from "@/server/settings/queries";
import { isConfigured, env } from "@/server/env";
import { db } from "@/server/db/client";
import { orders, payments } from "@/server/db/schema/commerce";
import { eq } from "drizzle-orm";
import { createRzpOrder } from "@/server/payments/razorpay";
import type { RazorpayCheckoutData } from "@/server/payments/actions";
import { z } from "zod";
import { placeOrder } from "./service";
import { lookupOrderForTracking, type OrderTrackingView } from "./queries";
import { sendOrderPlacedEmails } from "./emails";
import { autoCreateShipment } from "@/server/shipping/service";
import { invalidateLater, TAG } from "@/server/cache";
import { log } from "@/server/log";

export async function placeOrderAction(
  input: unknown,
): Promise<
  ActionResult<{
    number: string;
    accessKey: string;
    rzp?: RazorpayCheckoutData;
  }>
> {
  return runAction(async () => {
    const data = checkoutSchema.parse(input);

    const store = await getSetting("store");
    if (data.method === "online") {
      if (!isConfigured("razorpay") || !store.onlinePayments) {
        throw new AppError("NOT_CONFIGURED", "Online payments are currently unavailable");
      }
    }

    const ip = await clientIp();
    await verifyTurnstile(data.turnstileToken, ip);
    await rateLimit("order:ip", ip, 10, 600);
    if (data.method === "cod") {
      await rateLimit("cod:phone", data.contact.phone, 3, 86400);
    }

    const customer = await getCustomer();
    const { orderId, number, accessKey, totalInr } = await placeOrder(data, {
      userId: customer?.id ?? null,
      ip,
    });

    if (data.method === "online") {
      const rzpOrder = await createRzpOrder({
        amountInr: totalInr,
        receipt: number,
        notes: { entity: "order", id: String(orderId) },
      });

      await db.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({ razorpayOrderId: rzpOrder.id })
          .where(eq(orders.id, orderId));
        await tx.insert(payments).values({
          entity: "order",
          entityId: orderId,
          provider: "razorpay",
          rzpOrderId: rzpOrder.id,
          amountInr: totalInr,
          status: "created",
          method: data.payPref ?? null,
        });
      });

      return {
        number,
        accessKey,
        rzp: {
          key: env.RAZORPAY_KEY_ID!,
          orderId: rzpOrder.id,
          amountPaise: Math.round(totalInr * 100),
          name: "Maa Kali Astuti",
          description: `Order ${number}`,
          prefill: {
            name: data.contact.name,
            email: data.contact.email,
            contact: data.contact.phone,
            method: data.payPref ?? undefined,
          },
        },
      };
    }

    after(async () => {
      try {
        await sendOrderPlacedEmails(orderId);
      } catch (err) {
        log.error("order.email_after_failed", {
          orderId,
          error: err instanceof Error ? err.message : String(err),
        });
      }

      await autoCreateShipment(orderId);

      try {
        const itemIds = Array.from(new Set(data.lines.map((l) => l.pid)));
        invalidateLater(TAG.catalog, ...itemIds.map(TAG.product));
      } catch (err) {
        log.error("order.invalidate_after_failed", {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    });

    return { number, accessKey };
  });
}

const trackOrderSchema = z.object({
  number: z.string().trim().min(3).max(40),
  contact: z.string().trim().min(3).max(120),
  turnstileToken: z.string().trim().optional(),
});

export async function trackOrderAction(
  input: unknown,
): Promise<ActionResult<OrderTrackingView>> {
  return runAction(async () => {
    const data = trackOrderSchema.parse(input);
    const ip = await clientIp();
    await verifyTurnstile(data.turnstileToken, ip);
    await rateLimit("track:ip", ip, 10, 600);

    const order = await lookupOrderForTracking({
      number: data.number,
      contact: data.contact,
    });

    if (!order) {
      throw new AppError("NOT_FOUND", "Order not found with the provided details");
    }

    return order;
  });
}


