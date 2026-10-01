"use server";

import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { payments } from "@/server/db/schema/commerce";
import { env } from "@/server/env";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { getCustomer } from "@/server/auth/guards";
import { createRzpOrder } from "@/server/payments/razorpay";
import { runAction, type ActionResult, AppError } from "@/server/result";
import { bookingCreateSchema } from "@/lib/validation/booking";
import { createBooking } from "./service";

export type BookingCheckoutData = {
  ref: string;
  accessKey: string;
  rzp: {
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
};

export async function createBookingAction(
  input: unknown,
): Promise<ActionResult<BookingCheckoutData>> {
  return runAction(async () => {
    const data = bookingCreateSchema.parse(input);

    const ip = await clientIp();
    await rateLimit("booking:ip", ip, 10, 600);

    const customer = await getCustomer();
    const { bookingId, ref, accessKey, priceInr } = await createBooking(data, {
      userId: customer?.id ?? null,
      ip,
    });

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("NOT_CONFIGURED", "Razorpay is not configured");
    }

    const rzpOrder = await createRzpOrder({
      amountInr: priceInr,
      receipt: ref,
      notes: { entity: "booking", id: String(bookingId) },
    });

    await db.batch([
      db
        .update(bookings)
        .set({ razorpayOrderId: rzpOrder.id })
        .where(eq(bookings.id, bookingId)),
      db.insert(payments).values({
        entity: "booking",
        entityId: bookingId,
        provider: "razorpay",
        rzpOrderId: rzpOrder.id,
        amountInr: priceInr,
        status: "created",
        method: data.payPref ?? null,
      }),
    ]);

    return {
      ref,
      accessKey,
      rzp: {
        key: env.RAZORPAY_KEY_ID,
        orderId: rzpOrder.id,
        amountPaise: Math.round(priceInr * 100),
        name: "Maa Kali Astuti",
        description: `Booking ${ref}`,
        prefill: {
          name: data.details.name,
          email: data.details.email || "",
          contact: data.details.phone,
          method: data.payPref,
        },
      },
    };
  });
}
