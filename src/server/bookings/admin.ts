import "server-only";
import { after } from "next/server";
import { and, asc, desc, eq, gte, ilike, lt, lte, or, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { payments, refunds } from "@/server/db/schema/commerce";
import { requireAdmin } from "@/server/auth/guards";
import { audit } from "@/server/audit";
import { AppError } from "@/server/result";
import { BOOKING_FLOW, canMove } from "@/lib/domain/flows";
import { signedPrivateUrl, attachMedia } from "@/server/media/service";
import { refundPayment } from "@/server/payments/razorpay";
import { rescheduleBooking } from "@/server/bookings/service";
import { getDaySlots } from "@/server/bookings/availability";
import {
  sendBookingMeetingLink,
  sendBookingReportReady,
  sendBookingCancelled,
} from "@/server/bookings/emails";
import { istWallToUtc, addDaysKey, formatIst } from "@/lib/core/ist";
import {
  bookingListFilterSchema,
  meetingLinkSchema,
  bookingNoteSchema,
  bookingCancelSchema,
  adminRescheduleSchema,
  bookingStatusUpdateSchema,
  type BookingListFilters,
  type BookingStatusUpdateInput,
  type MeetingLinkInput,
  type BookingNoteInput,
  type BookingCancelInput,
  type AdminRescheduleInput,
} from "@/lib/validation/consult-admin";
import type { BookingStatus, ServiceKey, TierKey } from "@/lib/domain/enums";

export type BookingAdminListItem = {
  id: number;
  ref: string;
  name: string;
  phone: string;
  email: string | null;
  serviceKey: ServiceKey;
  tierKey: TierKey;
  mode: string;
  startAt: Date | null;
  endAt: Date | null;
  priceInr: number;
  status: BookingStatus;
  meetingLink: string | null;
  reportMediaId: number | null;
  createdAt: Date;
};

export type BookingListResult = {
  items: BookingAdminListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listBookings(
  filters: BookingListFilters,
): Promise<BookingListResult> {
  await requireAdmin("bookings.view");
  const parsed = bookingListFilterSchema.parse(filters);

  const pageSize = 20;
  const page = parsed.page;
  const offset = (page - 1) * pageSize;
  const now = new Date();

  const conditions = [];

  // View filter
  if (parsed.view === "upcoming") {
    conditions.push(
      and(
        eq(bookings.status, "confirmed"),
        or(gte(bookings.startAt, now), sql`${bookings.startAt} IS NULL`),
      ),
    );
  } else if (parsed.view === "pending") {
    conditions.push(eq(bookings.status, "pending_payment"));
  } else if (parsed.view === "past") {
    conditions.push(
      or(
        eq(bookings.status, "completed"),
        eq(bookings.status, "no_show"),
        eq(bookings.status, "cancelled"),
        eq(bookings.status, "expired"),
        and(eq(bookings.status, "confirmed"), lt(bookings.startAt, now)),
      ),
    );
  }

  // Search filter
  if (parsed.search && parsed.search.trim().length > 0) {
    const q = `%${parsed.search.trim()}%`;
    conditions.push(
      or(
        ilike(bookings.ref, q),
        ilike(bookings.name, q),
        ilike(bookings.phone, q),
        ilike(bookings.email, q),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(bookings)
    .where(whereClause);

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const items = await db
    .select({
      id: bookings.id,
      ref: bookings.ref,
      name: bookings.name,
      phone: bookings.phone,
      email: bookings.email,
      serviceKey: bookings.serviceKey,
      tierKey: bookings.tierKey,
      mode: bookings.mode,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      priceInr: bookings.priceInr,
      status: bookings.status,
      meetingLink: bookings.meetingLink,
      reportMediaId: bookings.reportMediaId,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(whereClause)
    .orderBy(
      parsed.view === "upcoming"
        ? asc(bookings.startAt)
        : desc(bookings.createdAt),
    )
    .limit(pageSize)
    .offset(offset);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export type WeekCalendarBooking = {
  id: number;
  ref: string;
  name: string;
  phone: string;
  serviceKey: ServiceKey;
  tierKey: TierKey;
  mode: string;
  startAt: Date | null;
  endAt: Date | null;
  status: BookingStatus;
  priceInr: number;
  meetingLink: string | null;
};

export type WeekCalendarResult = {
  weekStart: string; // YYYY-MM-DD (Monday)
  days: string[]; // 7 days (Mon-Sun)
  bookings: WeekCalendarBooking[];
};

export async function getWeek(
  weekStartDayKey: string,
): Promise<WeekCalendarResult> {
  await requireAdmin("bookings.view");

  const days = Array.from({ length: 7 }, (_, i) =>
    addDaysKey(weekStartDayKey, i),
  );
  const sundayKey = days[6]!;

  const startUtc = istWallToUtc(weekStartDayKey, "00:00");
  const endUtc = new Date(
    istWallToUtc(sundayKey, "23:59").getTime() + 60_000,
  );

  const rows = await db
    .select({
      id: bookings.id,
      ref: bookings.ref,
      name: bookings.name,
      phone: bookings.phone,
      serviceKey: bookings.serviceKey,
      tierKey: bookings.tierKey,
      mode: bookings.mode,
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      status: bookings.status,
      priceInr: bookings.priceInr,
      meetingLink: bookings.meetingLink,
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.startAt, startUtc),
        lte(bookings.startAt, endUtc),
      ),
    )
    .orderBy(asc(bookings.startAt));

  return {
    weekStart: weekStartDayKey,
    days,
    bookings: rows,
  };
}

export type PalmPhotoSigned = {
  mediaId: number;
  url: string;
};

export type BookingAdminDetail = typeof bookings.$inferSelect & {
  palmUrls: PalmPhotoSigned[];
  reportUrl: string | null;
  payment: typeof payments.$inferSelect | null;
  refund: typeof refunds.$inferSelect | null;
};

export async function getBookingAdmin(
  id: number,
): Promise<BookingAdminDetail> {
  await requireAdmin("bookings.view");

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  // Signed palm photos
  const palmUrls: PalmPhotoSigned[] = [];
  if (booking.palmMediaIds && booking.palmMediaIds.length > 0) {
    for (const mid of booking.palmMediaIds) {
      try {
        const url = await signedPrivateUrl(mid);
        palmUrls.push({ mediaId: mid, url });
      } catch {
        // ignore missing/invalid media
      }
    }
  }

  // Report signed URL
  let reportUrl: string | null = null;
  if (booking.reportMediaId) {
    try {
      reportUrl = await signedPrivateUrl(
        booking.reportMediaId,
        `report-${booking.ref}.pdf`,
      );
    } catch {
      // ignore missing report
    }
  }

  // Payment record
  const [payment] = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.entity, "booking"),
        eq(payments.entityId, id),
      ),
    )
    .orderBy(desc(payments.id))
    .limit(1);

  // Refund record
  const [refund] = await db
    .select()
    .from(refunds)
    .where(
      and(
        eq(refunds.entity, "booking"),
        eq(refunds.entityId, id),
      ),
    )
    .orderBy(desc(refunds.id))
    .limit(1);

  return {
    ...booking,
    palmUrls,
    reportUrl,
    payment: payment ?? null,
    refund: refund ?? null,
  };
}

export async function updateBookingStatus(
  id: number,
  to: BookingStatus,
  note?: string,
): Promise<void> {
  const admin = await requireAdmin("bookings.update");
  const parsed = bookingStatusUpdateSchema.parse({ to, note });

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  if (!canMove(BOOKING_FLOW, booking.status, parsed.to)) {
    throw new AppError(
      "VALIDATION",
      `Cannot change booking status from "${booking.status}" to "${parsed.to}"`,
    );
  }

  const now = new Date();
  let updatedNote = booking.adminNote;
  if (parsed.note && parsed.note.trim().length > 0) {
    const timestamp = formatIst(now, { date: true, time: true });
    const noteEntry = `[${timestamp}] (Status -> ${parsed.to}): ${parsed.note.trim()}`;
    updatedNote = updatedNote ? `${updatedNote}\n${noteEntry}` : noteEntry;
  }

  await db
    .update(bookings)
    .set({
      status: parsed.to,
      ...(parsed.to === "cancelled" ? { cancelledAt: now } : {}),
      adminNote: updatedNote,
      updatedAt: now,
    })
    .where(eq(bookings.id, id));

  await audit({
    actorId: admin.id,
    action: "booking.status",
    entity: "booking",
    entityId: String(id),
    summary: `Changed booking ${booking.ref} status from ${booking.status} to ${parsed.to}`,
    diff: {
      status: [booking.status, parsed.to],
    },
  });
}

export async function setMeetingLink(
  id: number,
  url: string,
): Promise<void> {
  const admin = await requireAdmin("bookings.update");
  const parsed = meetingLinkSchema.parse({ meetingLink: url });

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  const now = new Date();
  await db
    .update(bookings)
    .set({
      meetingLink: parsed.meetingLink,
      updatedAt: now,
    })
    .where(eq(bookings.id, id));

  await audit({
    actorId: admin.id,
    action: "booking.meeting_link",
    entity: "booking",
    entityId: String(id),
    summary: `Set meeting link for booking ${booking.ref}`,
    diff: {
      meetingLink: [booking.meetingLink, parsed.meetingLink],
    },
  });

  after(async () => {
    await sendBookingMeetingLink(id);
  });
}

export async function attachReport(
  id: number,
  mediaId: number,
): Promise<void> {
  const admin = await requireAdmin("bookings.update");

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  const now = new Date();
  await db
    .update(bookings)
    .set({
      reportMediaId: mediaId,
      updatedAt: now,
    })
    .where(eq(bookings.id, id));

  await attachMedia([mediaId], { type: "booking", id: String(id) });

  await audit({
    actorId: admin.id,
    action: "booking.report_attached",
    entity: "booking",
    entityId: String(id),
    summary: `Attached report (Media #${mediaId}) to booking ${booking.ref}`,
    diff: {
      reportMediaId: [booking.reportMediaId, mediaId],
    },
  });

  after(async () => {
    await sendBookingReportReady(id);
  });
}

export async function rescheduleByAdmin(
  id: number,
  start: number,
): Promise<void> {
  const admin = await requireAdmin("bookings.update");
  const parsed = adminRescheduleSchema.parse({ start });

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  await rescheduleBooking({
    bookingId: id,
    start: parsed.start,
    by: "admin",
  });

  await audit({
    actorId: admin.id,
    action: "booking.reschedule",
    entity: "booking",
    entityId: String(id),
    summary: `Admin rescheduled booking ${booking.ref} to ${formatIst(parsed.start, { date: true, time: true })}`,
  });
}

export async function cancelBooking(
  id: number,
  opts: BookingCancelInput,
): Promise<void> {
  const admin = await requireAdmin("bookings.update");
  const parsed = bookingCancelSchema.parse(opts);

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  if (!canMove(BOOKING_FLOW, booking.status, "cancelled")) {
    throw new AppError(
      "VALIDATION",
      `Cannot cancel booking with status "${booking.status}"`,
    );
  }

  let refundInitiated = false;
  let refundId: number | null = null;
  const now = new Date();

  if (parsed.refund) {
    const [payment] = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.entity, "booking"),
          eq(payments.entityId, id),
          eq(payments.status, "captured"),
        ),
      )
      .orderBy(desc(payments.id))
      .limit(1);

    if (payment && payment.rzpPaymentId) {
      const rzpRefund = await refundPayment({
        paymentId: payment.rzpPaymentId,
        amountInr: payment.amountInr,
        notes: {
          bookingId: String(id),
          ref: booking.ref,
          reason: parsed.reason || "",
        },
      });

      const [rRow] = await db
        .insert(refunds)
        .values({
          paymentId: payment.id,
          entity: "booking",
          entityId: id,
          rzpRefundId: rzpRefund.id,
          amountInr: payment.amountInr,
          reason: parsed.reason ?? null,
          status: "pending",
          actorId: admin.id,
        })
        .returning({ id: refunds.id });

      refundInitiated = true;
      refundId = rRow?.id ?? null;
    }
  }

  const timestamp = formatIst(now, { date: true, time: true });
  const reasonText = parsed.reason ? ` - ${parsed.reason}` : "";
  const refundText = refundInitiated ? " (Refund initiated)" : "";
  const noteEntry = `[${timestamp}] Cancelled${refundText}${reasonText}`;
  const updatedAdminNote = booking.adminNote
    ? `${booking.adminNote}\n${noteEntry}`
    : noteEntry;

  await db
    .update(bookings)
    .set({
      status: "cancelled",
      cancelledAt: now,
      adminNote: updatedAdminNote,
      updatedAt: now,
    })
    .where(eq(bookings.id, id));

  await audit({
    actorId: admin.id,
    action: "booking.cancelled",
    entity: "booking",
    entityId: String(id),
    summary: `Cancelled booking ${booking.ref}${refundInitiated ? ` with refund #${refundId}` : ""}`,
    diff: {
      status: [booking.status, "cancelled"],
    },
  });

  after(async () => {
    await sendBookingCancelled(id, {
      refundNote: refundInitiated
        ? `Refund of ₹${booking.priceInr} has been initiated.`
        : undefined,
      reason: parsed.reason,
    });
  });
}

export async function addBookingNote(
  id: number,
  note: string,
): Promise<void> {
  const admin = await requireAdmin("bookings.update");
  const parsed = bookingNoteSchema.parse({ note });

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) {
    throw new AppError("NOT_FOUND", "Booking not found");
  }

  const now = new Date();
  const timestamp = formatIst(now, { date: true, time: true });
  const noteEntry = `[${timestamp} · ${admin.role}]: ${parsed.note.trim()}`;
  const updatedNote = booking.adminNote
    ? `${booking.adminNote}\n${noteEntry}`
    : noteEntry;

  await db
    .update(bookings)
    .set({
      adminNote: updatedNote,
      updatedAt: now,
    })
    .where(eq(bookings.id, id));

  await audit({
    actorId: admin.id,
    action: "booking.note",
    entity: "booking",
    entityId: String(id),
    summary: `Added note to booking ${booking.ref}`,
  });
}

export async function adminSlots(
  serviceKey: ServiceKey,
  tierKey: TierKey,
  day: string,
): Promise<{ t: string; free: boolean }[]> {
  await requireAdmin("bookings.view");
  return getDaySlots({ serviceKey, tierKey, day });
}
