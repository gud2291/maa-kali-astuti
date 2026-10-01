"use server";

import { z } from "zod";
import { runAction, type ActionResult, AppError } from "@/server/result";
import { db } from "@/server/db/client";
import { orders } from "@/server/db/schema/commerce";
import { bookings } from "@/server/db/schema/consult";
import { eq } from "drizzle-orm";
import { env } from "@/server/env";
import { safeEqualHex, sha256Hex } from "@/server/ids";
import { fetchPayment, verifyCheckoutSignature } from "./razorpay";
import { dispatchPaid } from "./dispatch";

export type RazorpayCheckoutData = {
  key: string;
  orderId: string;
  amountPaise: number;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
    method?: string;
  };
};

const confirmPaymentSchema = z.object({
  entity: z.enum(["order", "booking"]),
  ref: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function confirmPaymentAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const data = confirmPaymentSchema.parse(input);

    const valid = verifyCheckoutSignature({
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      signature: data.razorpay_signature,
    });

    if (!valid) {
      throw new AppError("PAYMENT_FAILED", "Invalid payment signature");
    }

    if (data.entity === "order") {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.number, data.ref))
        .limit(1);

      if (!order) {
        throw new AppError("NOT_FOUND", "Order not found");
      }

      if (order.razorpayOrderId !== data.razorpay_order_id) {
        throw new AppError("VALIDATION", "Razorpay order ID mismatch");
      }

      const payment = await fetchPayment(data.razorpay_payment_id);
      const amountInr = Math.round(payment.amount / 100);

      await dispatchPaid({
        entity: "order",
        entityId: order.id,
        rzpOrderId: data.razorpay_order_id,
        rzpPaymentId: data.razorpay_payment_id,
        amountInr,
        method: payment.method,
      });
    } else if (data.entity === "booking") {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.ref, data.ref))
        .limit(1);

      if (!booking) {
        throw new AppError("NOT_FOUND", "Booking not found");
      }

      if (booking.razorpayOrderId !== data.razorpay_order_id) {
        throw new AppError("VALIDATION", "Razorpay order ID mismatch");
      }

      const payment = await fetchPayment(data.razorpay_payment_id);
      const amountInr = Math.round(payment.amount / 100);

      await dispatchPaid({
        entity: "booking",
        entityId: booking.id,
        rzpOrderId: data.razorpay_order_id,
        rzpPaymentId: data.razorpay_payment_id,
        amountInr,
        method: payment.method,
      });
    }

    return { ok: true };
  });
}

const retryPaymentSchema = z.object({
  entity: z.literal("order"),
  ref: z.string().min(1),
  accessKey: z.string().min(1),
});

export async function retryPaymentAction(
  input: unknown,
): Promise<
  ActionResult<{
    number: string;
    accessKey: string;
    rzp: RazorpayCheckoutData;
  }>
> {
  return runAction(async () => {
    const data = retryPaymentSchema.parse(input);

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.number, data.ref))
      .limit(1);

    if (!order) {
      throw new AppError("NOT_FOUND", "Order not found");
    }

    const keyHash = sha256Hex(data.accessKey);
    if (!safeEqualHex(keyHash, order.accessHash)) {
      throw new AppError("UNAUTHENTICATED", "Invalid access key");
    }

    if (order.status !== "pending_payment" || order.paymentStatus === "paid") {
      throw new AppError("ALREADY_PAID", "Order is already paid or processed");
    }

    if (!order.razorpayOrderId) {
      throw new AppError("VALIDATION", "No online payment order found");
    }

    if (!env.RAZORPAY_KEY_ID) {
      throw new AppError("NOT_CONFIGURED", "Razorpay is not configured");
    }

    return {
      number: order.number,
      accessKey: data.accessKey,
      rzp: {
        key: env.RAZORPAY_KEY_ID,
        orderId: order.razorpayOrderId,
        amountPaise: Math.round(order.totalInr * 100),
        name: "Maa Kali Astuti",
        description: `Order ${order.number}`,
        prefill: {
          name: order.name,
          email: order.email,
          contact: order.phone,
          method: order.payPref ?? undefined,
        },
      },
    };
  });
}
