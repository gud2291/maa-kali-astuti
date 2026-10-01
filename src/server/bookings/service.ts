import "server-only";
import { after } from "next/server";
import { and, eq, gt, lt, ne, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { payments } from "@/server/db/schema/commerce";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import { accessKeyFor, refCode, sha256Hex } from "@/server/ids";
import { claimMedia } from "@/server/media/service";
import { AppError } from "@/server/result";
import { log } from "@/server/log";
import type { BookingCreateInput } from "@/lib/validation/booking";
import type { BookingDetailsRecord } from "@/lib/domain/types";
import { sendBookingConfirmed } from "./emails";

export type CreateBookingContext = {
  userId: number | null;
  ip?: string;
};

export async function createBooking(
  input: BookingCreateInput,
  ctx: CreateBookingContext,
): Promise<{
  bookingId: number;
  ref: string;
  accessKey: string;
  priceInr: number;
  holdUntil: number;
}> {
  const consultData = await getConsultRows();
  const service = consultData.services.find((s) => s.key === input.serviceKey);
  if (!service) {
    throw new AppError("NOT_FOUND", "Service not found");
  }

  if (!service.modes.includes(input.mode)) {
    throw new AppError("VALIDATION", "Invalid mode for service");
  }

  const tier = consultData.tiers.find(
    (t) => t.serviceKey === input.serviceKey && t.tierKey === input.tierKey,
  );
  if (!tier) {
    throw new AppError("NOT_FOUND", "Tier not found");
  }

  const consultSettings = await getSetting("consult");
  const holdMinutes = consultSettings.holdMinutes ?? 10;
  const now = new Date();
  const holdExpiresAt =
    input.mode !== "report"
      ? new Date(now.getTime() + holdMinutes * 60_000)
      : null;
  const holdUntil = holdExpiresAt ? holdExpiresAt.getTime() : 0;

  const detailsRecord: BookingDetailsRecord = {
    dob: input.details.dob,
    tob: input.details.tob,
    unknown: input.details.unknown,
    place: input.details.place,
    q: input.details.q,
    lang: input.details.lang,
    mobile: input.details.mobile,
    biz: input.details.biz,
  };

  const emailVal = input.details.email ? input.details.email.trim().toLowerCase() : null;
  const palmMediaIds = input.palms.map((p) => p.mediaId);

  let bookingId: number | null = null;
  let chosenRef = "";
  let chosenAccessKey = "";

  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ref = refCode("MKA-B", 5);
    const accessKey = accessKeyFor("booking", ref);
    const accessHash = sha256Hex(accessKey);

    try {
      if (input.mode === "report") {
        const [inserted] = await db
          .insert(bookings)
          .values({
            ref,
            accessHash,
            userId: ctx.userId,
            locale: input.locale,
            serviceKey: input.serviceKey,
            tierKey: input.tierKey,
            mode: input.mode,
            startAt: null,
            endAt: null,
            priceInr: tier.priceInr,
            payPref: input.payPref,
            status: "pending_payment",
            holdExpiresAt: null,
            name: input.details.name.trim(),
            phone: input.details.phone.trim(),
            email: emailVal,
            details: detailsRecord,
            palmMediaIds,
            rescheduleCount: 0,
            createdAt: now,
            updatedAt: now,
          })
          .returning({ id: bookings.id });

        if (inserted) {
          bookingId = inserted.id;
          chosenRef = ref;
          chosenAccessKey = accessKey;
          break;
        }
      } else {
        if (!input.start) {
          throw new AppError("VALIDATION", "Start time is required for live sessions");
        }
        const startAt = new Date(input.start);
        const endAt = new Date(startAt.getTime() + tier.mins * 60_000);

        // Atomic slot-claim insert pattern (ARCHITECTURE §5)
        const rows = await db.all<{ id: number }>(sql`
          INSERT INTO bookings (
            ref, access_hash, user_id, locale, service_key, tier_key, mode,
            start_at, end_at, price_inr, pay_pref, status, hold_expires_at,
            name, phone, email, details, palm_media_ids, reschedule_count,
            created_at, updated_at
          )
          SELECT
            ${ref}, ${accessHash}, ${ctx.userId}, ${input.locale}, ${input.serviceKey}, ${input.tierKey}, ${input.mode},
            ${startAt.getTime()}, ${endAt.getTime()}, ${tier.priceInr}, ${input.payPref}, 'pending_payment', ${holdExpiresAt!.getTime()},
            ${input.details.name.trim()}, ${input.details.phone.trim()}, ${emailVal}, ${JSON.stringify(detailsRecord)}, ${JSON.stringify(palmMediaIds)}, 0,
            ${now.getTime()}, ${now.getTime()}
          WHERE NOT EXISTS (
            SELECT 1 FROM bookings
            WHERE start_at < ${endAt.getTime()}
              AND end_at > ${startAt.getTime()}
              AND (
                status = 'confirmed'
                OR (status = 'pending_payment' AND hold_expires_at > ${now.getTime()})
              )
          )
          RETURNING id
        `);

        if (rows.length === 0 || !rows[0]?.id) {
          throw new AppError("SLOT_TAKEN", "The selected slot is no longer available");
        }

        bookingId = rows[0].id;
        chosenRef = ref;
        chosenAccessKey = accessKey;
        break;
      }
    } catch (err) {
      if (err instanceof AppError && err.code === "SLOT_TAKEN") {
        throw err;
      }
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("UNIQUE") || errMsg.includes("constraint")) {
        continue;
      }
      throw err;
    }
  }

  if (!bookingId) {
    throw new AppError("INTERNAL", "Could not generate a unique booking reference");
  }

  if (input.palms.length > 0) {
    await claimMedia(input.palms, { type: "booking", id: String(bookingId) });
  }

  return {
    bookingId,
    ref: chosenRef,
    accessKey: chosenAccessKey,
    priceInr: tier.priceInr,
    holdUntil,
  };
}

export async function markBookingPaid(opts: {
  bookingId: number;
  rzpOrderId: string | null;
  rzpPaymentId: string;
  amountInr: number;
  method?: string | null;
}): Promise<{ first: boolean; bookingId: number }> {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, opts.bookingId))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  if (booking.status !== "pending_payment") {
    return { first: false, bookingId: booking.id };
  }

  const now = new Date();
  let adminNote: string | null = booking.adminNote;
  let hasSlotClash = false;
  let hasAmountMismatch = false;

  // If hold expired and another confirmed booking now overlaps
  if (booking.holdExpiresAt && booking.holdExpiresAt.getTime() < now.getTime()) {
    if (booking.startAt && booking.endAt) {
      const overlapping = await db
        .select({ id: bookings.id })
        .from(bookings)
        .where(
          and(
            ne(bookings.id, booking.id),
            eq(bookings.status, "confirmed"),
            lt(bookings.startAt, booking.endAt),
            gt(bookings.endAt, booking.startAt),
          ),
        )
        .limit(1);

      if (overlapping.length > 0) {
        hasSlotClash = true;
        const note = "Slot clash — reschedule needed";
        adminNote = adminNote ? `${adminNote}; ${note}` : note;
        log.warn("booking.slot_clash", { bookingId: booking.id, ref: booking.ref });
      }
    }
  }

  // Amount mismatch check
  if (booking.priceInr !== opts.amountInr) {
    hasAmountMismatch = true;
    const note = `Amount mismatch (expected ₹${booking.priceInr}, got ₹${opts.amountInr})`;
    adminNote = adminNote ? `${adminNote}; ${note}` : note;
    log.warn("booking.amount_mismatch", {
      bookingId: booking.id,
      expected: booking.priceInr,
      received: opts.amountInr,
    });
  }

  // First-time update pattern
  const [updated] = await db
    .update(bookings)
    .set({
      status: "confirmed",
      paidAt: now,
      adminNote,
      updatedAt: now,
    })
    .where(
      and(
        eq(bookings.id, opts.bookingId),
        eq(bookings.status, "pending_payment"),
      ),
    )
    .returning({ id: bookings.id });

  if (!updated) {
    return { first: false, bookingId: booking.id };
  }

  await db.insert(payments).values({
    entity: "booking",
    entityId: booking.id,
    provider: "razorpay",
    rzpOrderId: opts.rzpOrderId,
    rzpPaymentId: opts.rzpPaymentId,
    amountInr: opts.amountInr,
    status: "captured",
    method: opts.method ?? null,
  });

  // first time → after() emails
  after(async () => {
    try {
      await sendBookingConfirmed(booking.id, {
        slotClash: hasSlotClash,
        amountMismatch: hasAmountMismatch,
      });
    } catch (err) {
      log.error("booking.email_failed", {
        bookingId: booking.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  return { first: true, bookingId: booking.id };
}
