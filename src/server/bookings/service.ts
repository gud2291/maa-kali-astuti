import "server-only";
import { after } from "next/server";
import { and, eq, gt, inArray, lt, ne, or, sql } from "drizzle-orm";
import { isUniqueViolation } from "@/server/db/errors";
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

/** Postgres advisory-lock key that serialises slot claims (booking insert / reschedule). */
const SLOT_LOCK_KEY = 7_265_001;

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

        // Atomic slot-claim: serialise on an advisory lock, check for overlap, then insert.
        const claimedId = await db.transaction(async (tx) => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(${SLOT_LOCK_KEY})`);
          const [clash] = await tx
            .select({ id: bookings.id })
            .from(bookings)
            .where(
              and(
                lt(bookings.startAt, endAt),
                gt(bookings.endAt, startAt),
                or(
                  eq(bookings.status, "confirmed"),
                  and(eq(bookings.status, "pending_payment"), gt(bookings.holdExpiresAt, now)),
                ),
              ),
            )
            .limit(1);
          if (clash) return null;
          const [row] = await tx
            .insert(bookings)
            .values({
              ref,
              accessHash,
              userId: ctx.userId,
              locale: input.locale,
              serviceKey: input.serviceKey,
              tierKey: input.tierKey,
              mode: input.mode,
              startAt,
              endAt,
              priceInr: tier.priceInr,
              payPref: input.payPref,
              status: "pending_payment",
              holdExpiresAt: holdExpiresAt!,
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
          return row?.id ?? null;
        });

        if (!claimedId) {
          throw new AppError("SLOT_TAKEN", "The selected slot is no longer available");
        }

        bookingId = claimedId;
        chosenRef = ref;
        chosenAccessKey = accessKey;
        break;
      }
    } catch (err) {
      if (err instanceof AppError && err.code === "SLOT_TAKEN") {
        throw err;
      }
      if (isUniqueViolation(err)) {
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
  const nowDate = new Date(now);
  const updated = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(${SLOT_LOCK_KEY})`);
    const [clash] = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        and(
          ne(bookings.id, opts.bookingId),
          lt(bookings.startAt, newEnd),
          gt(bookings.endAt, newStart),
          or(
            eq(bookings.status, "confirmed"),
            and(eq(bookings.status, "pending_payment"), gt(bookings.holdExpiresAt, nowDate)),
          ),
        ),
      )
      .limit(1);
    if (clash) return [];
    return tx
      .update(bookings)
      .set({
        startAt: newStart,
        endAt: newEnd,
        rescheduleCount: sql`${bookings.rescheduleCount} + 1`,
        reminderDayAt: null,
        reminderHourAt: null,
        updatedAt: nowDate,
      })
      .where(eq(bookings.id, opts.bookingId))
      .returning({ id: bookings.id });
  });

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

