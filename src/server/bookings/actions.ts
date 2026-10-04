"use server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { payments } from "@/server/db/schema/commerce";
import { env } from "@/server/env";
import { clientIp } from "@/server/request";
import { rateLimit } from "@/server/rate-limit";
import { getCustomer } from "@/server/auth/guards";
import { createRzpOrder } from "@/server/payments/razorpay";
import { runAction, type ActionResult, AppError } from "@/server/result";
import { sha256Hex, safeEqualHex, accessKeyFor } from "@/server/ids";
import { signedPrivateUrl } from "@/server/media/service";
import { bookingCreateSchema } from "@/lib/validation/booking";
import { createBooking, rescheduleBooking } from "./service";

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

    // Check before creating the row, so an unconfigured store never holds a slot.
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("NOT_CONFIGURED", "Razorpay is not configured");
    }

    const customer = await getCustomer();
    const { bookingId, ref, accessKey, priceInr } = await createBooking(data, {
      userId: customer?.id ?? null,
      ip,
    });

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

const rescheduleSchema = z.object({
  ref: z.string().min(1).max(20),
  accessKey: z.string().max(64).optional(),
  start: z.number(),
});

export async function rescheduleBookingAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  return runAction(async () => {
    const data = rescheduleSchema.parse(input);

    const ip = await clientIp();
    await rateLimit("reschedule:ip", ip, 10, 3600);

    const [row] = await db
      .select({
        id: bookings.id,
        accessHash: bookings.accessHash,
        userId: bookings.userId,
      })
      .from(bookings)
      .where(eq(bookings.ref, data.ref))
      .limit(1);

    if (!row) {
      throw new AppError("NOT_FOUND");
    }

    // Auth: owner session or valid access key
    const customer = await getCustomer();
    let authorized = false;

    if (customer && row.userId === customer.id) {
      authorized = true;
    } else if (data.accessKey) {
      const keyHash = sha256Hex(data.accessKey);
      if (safeEqualHex(keyHash, row.accessHash)) {
        authorized = true;
      }
    }

    if (!authorized) {
      throw new AppError("FORBIDDEN");
    }

    await rescheduleBooking({
      bookingId: row.id,
      start: data.start,
      by: "customer",
    });

    return { ok: true as const };
  });
}

const reportLinkSchema = z.object({
  ref: z.string().min(1).max(20),
  accessKey: z.string().max(64).optional(),
});

export async function bookingReportLinkAction(
  input: unknown,
): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const data = reportLinkSchema.parse(input);

    const [row] = await db
      .select({
        id: bookings.id,
        accessHash: bookings.accessHash,
        userId: bookings.userId,
        reportMediaId: bookings.reportMediaId,
        ref: bookings.ref,
      })
      .from(bookings)
      .where(eq(bookings.ref, data.ref))
      .limit(1);

    if (!row) {
      throw new AppError("NOT_FOUND");
    }

    // Auth: owner session or valid access key
    const customer = await getCustomer();
    let authorized = false;

    if (customer && row.userId === customer.id) {
      authorized = true;
    } else if (data.accessKey) {
      const keyHash = sha256Hex(data.accessKey);
      if (safeEqualHex(keyHash, row.accessHash)) {
        authorized = true;
      }
    }

    if (!authorized) {
      throw new AppError("FORBIDDEN");
    }

    if (!row.reportMediaId) {
      throw new AppError("NOT_FOUND", "Report not available yet");
    }

    const url = await signedPrivateUrl(
      row.reportMediaId,
      `report-${row.ref}.pdf`,
    );

    return { url };
  });
}

