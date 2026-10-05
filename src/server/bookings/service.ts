import "server-only";
import { after } from "next/server";
import { and, eq, gt, inArray, lt, ne, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { payments } from "@/server/db/schema/commerce";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import { accessKeyFor, refCode, sha256Hex } from "@/server/ids";
import { claimMedia } from "@/server/media/service";
import { AppError } from "@/server/result";
import { log } from "@/server/log";
import { istDayKey, istWallToUtc, addDaysKey, weekdayOfKey } from "@/lib/core/ist";
import { getDaySlots } from "./availability";
import type { BookingCreateInput } from "@/lib/validation/booking";
import type { BookingDetailsRecord } from "@/lib/domain/types";
import { sendBookingConfirmed, sendBookingRescheduled } from "./emails";

/** The start must be one of the day's offered, free start times (open day, window, lead time, not blocked). */
async function assertOfferedSlot(
  serviceKey: BookingCreateInput["serviceKey"],
  tierKey: BookingCreateInput["tierKey"],
  start: Date,
): Promise<void> {
  if (Number.isNaN(start.getTime())) throw new AppError("SLOT_TAKEN");
  const day = istDayKey(start);
  const slots = await getDaySlots({ serviceKey, tierKey, day });
  const offered = slots.some((s) => s.free && istWallToUtc(day, s.t).getTime() === start.getTime());
  if (!offered) throw new AppError("SLOT_TAKEN");
}

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

  if (input.mode !== "report") {
    if (!input.start) {
      throw new AppError("VALIDATION", "Start time is required for live sessions");
    }
    await assertOfferedSlot(input.serviceKey, input.tierKey, new Date(input.start));
  }

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

  // A payment can arrive after the cron expired the hold: the money is taken, so still confirm
  // (the clash check below flags an overlap for the admin).
  if (booking.status !== "pending_payment" && booking.status !== "expired") {
    // Cancelled before the money arrived (or a second payment): keep it visible for a refund.
    const extra = await db
      .insert(payments)
      .values({
        entity: "booking",
        entityId: booking.id,
        provider: "razorpay",
        rzpOrderId: opts.rzpOrderId,
        rzpPaymentId: opts.rzpPaymentId,
        amountInr: opts.amountInr,
        status: "captured",
        method: opts.method ?? null,
      })
      .onConflictDoNothing({ target: payments.rzpPaymentId })
      .returning({ id: payments.id });
    if (extra.length > 0) {
      const note = booking.paidAt === null
        ? `Payment received while ${booking.status} — refund it`
        : `Extra payment received: ${opts.rzpPaymentId} (₹${opts.amountInr}) — refund it`;
      await db
        .update(bookings)
        .set({ adminNote: booking.adminNote ? `${booking.adminNote}; ${note}` : note, updatedAt: new Date() })
        .where(eq(bookings.id, booking.id));
      log.warn("booking.unexpected_payment", { bookingId: booking.id, status: booking.status });
    }
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
        inArray(bookings.status, ["pending_payment", "expired"]),
      ),
    )
    .returning({ id: bookings.id });

  if (!updated) {
    return { first: false, bookingId: booking.id };
  }

  await db
    .insert(payments)
    .values({
      entity: "booking",
      entityId: booking.id,
      provider: "razorpay",
      rzpOrderId: opts.rzpOrderId,
      rzpPaymentId: opts.rzpPaymentId,
      amountInr: opts.amountInr,
      status: "captured",
      method: opts.method ?? null,
    })
    .onConflictDoUpdate({
      target: payments.rzpPaymentId,
      set: { status: "captured", amountInr: opts.amountInr, error: null, updatedAt: now },
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

export async function rescheduleBooking(opts: {
  bookingId: number;
  start: number;
  by: "customer" | "admin";
}): Promise<void> {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, opts.bookingId))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  if (booking.status !== "confirmed") {
    throw new AppError("VALIDATION", "Only confirmed bookings can be rescheduled");
  }

  if (booking.mode === "report") {
    throw new AppError("VALIDATION", "Written reports cannot be rescheduled");
  }

  const consultSettings = await getSetting("consult");
  const consultData = await getConsultRows();
  const tier = consultData.tiers.find(
    (t) => t.serviceKey === booking.serviceKey && t.tierKey === booking.tierKey,
  );
  const mins = tier ? tier.mins : 30;

  const now = Date.now();
  const newStart = new Date(opts.start);
  const newEnd = new Date(opts.start + mins * 60_000);

  if (opts.by === "customer") {
    const maxReschedules = consultSettings.maxReschedules ?? 1;
    if (booking.rescheduleCount >= maxReschedules) {
      throw new AppError("VALIDATION", "Maximum reschedules reached");
    }

    const rescheduleMinHours = consultSettings.rescheduleMinHours ?? 12;
    if (booking.startAt && booking.startAt.getTime() - now < rescheduleMinHours * 3600_000) {
      throw new AppError("VALIDATION", "Too close to the session to reschedule");
    }

    // Validate new day is open and in window
    const todayKey = istDayKey(now);
    const newDayKey = istDayKey(opts.start);
    const maxDayKey = addDaysKey(todayKey, consultSettings.bookingWindowDays);
    const dow = weekdayOfKey(newDayKey);

    if (!consultSettings.openDays.includes(dow)) {
      throw new AppError("VALIDATION", "Selected day is not available");
    }
    if (newDayKey > maxDayKey) {
      throw new AppError("VALIDATION", "Selected day is beyond the booking window");
    }
    if (newDayKey < todayKey) {
      throw new AppError("VALIDATION", "Cannot reschedule to a past date");
    }
    const isDayBlocked = consultSettings.blocked.some(
      (b) => newDayKey >= b.from && newDayKey <= b.to,
    );
    if (isDayBlocked) {
      throw new AppError("VALIDATION", "Selected day is blocked");
    }
    await assertOfferedSlot(booking.serviceKey, booking.tierKey, newStart);
  }

  // Atomic update: reschedule only if no overlapping confirmed/held booking
  const updated = await db.all<{ id: number }>(sql`
    UPDATE bookings
    SET start_at = ${newStart.getTime()},
        end_at = ${newEnd.getTime()},
        reschedule_count = reschedule_count + 1,
        reminder_day_at = NULL,
        reminder_hour_at = NULL,
        updated_at = ${now}
    WHERE id = ${opts.bookingId}
      AND NOT EXISTS (
        SELECT 1 FROM bookings b2
        WHERE b2.id != ${opts.bookingId}
          AND b2.start_at < ${newEnd.getTime()}
          AND b2.end_at > ${newStart.getTime()}
          AND (
            b2.status = 'confirmed'
            OR (b2.status = 'pending_payment' AND b2.hold_expires_at > ${now})
          )
      )
    RETURNING id
  `);

  if (updated.length === 0) {
    throw new AppError("SLOT_TAKEN", "The selected slot is no longer available");
  }

  after(async () => {
    try {
      await sendBookingRescheduled(booking.id);
    } catch (err) {
      log.error("booking.reschedule_email_failed", {
        bookingId: booking.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

