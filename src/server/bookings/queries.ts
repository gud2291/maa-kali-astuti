import "server-only";
import { and, eq, desc, asc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { sha256Hex, safeEqualHex } from "@/server/ids";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import type { BookingStatus, Locale, ModeKey, ServiceKey, TierKey } from "@/lib/domain/enums";

export type BookingView = {
  ref: string;
  serviceName: string;
  tierTitle: string;
  mode: ModeKey;
  startMs: number | null;
  endMs: number | null;
  status: BookingStatus;
  meetingLink: string | null;
  hasReport: boolean;
  reportMediaId: number | null;
  canReschedule: boolean;
  rescheduleReason: string | null;
  priceInr: number;
  locale: Locale;
  serviceKey: ServiceKey;
  tierKey: TierKey;
};

async function assembleBookingView(row: {
  id: number;
  ref: string;
  locale: string;
  serviceKey: string;
  tierKey: string;
  mode: string;
  startAt: Date | null;
  endAt: Date | null;
  status: string;
  meetingLink: string | null;
  reportMediaId: number | null;
  rescheduleCount: number;
  priceInr: number;
}): Promise<BookingView> {
  const [consultSettings, consultData] = await Promise.all([
    getSetting("consult"),
    getConsultRows(),
  ]);

  const isHi = row.locale === "hi";
  const service = consultData.services.find((s) => s.key === row.serviceKey);
  const tier = consultData.tiers.find(
    (t) => t.serviceKey === row.serviceKey && t.tierKey === row.tierKey,
  );

  const serviceName = service
    ? isHi
      ? service.nameHi
      : service.nameEn
    : row.serviceKey;
  const tierTitle = tier
    ? isHi
      ? tier.titleHi || tier.titleEn
      : tier.titleEn
    : row.tierKey;

  const maxReschedules = consultSettings.maxReschedules ?? 1;
  const rescheduleMinHours = consultSettings.rescheduleMinHours ?? 12;
  const now = Date.now();

  let canReschedule = false;
  let rescheduleReason: string | null = null;

  if (row.status !== "confirmed") {
    rescheduleReason = "not_confirmed";
  } else if (row.mode === "report") {
    rescheduleReason = "written_report";
  } else if (row.rescheduleCount >= maxReschedules) {
    rescheduleReason = "max_reached";
  } else if (row.startAt && row.startAt.getTime() - now < rescheduleMinHours * 3600_000) {
    rescheduleReason = "too_close";
  } else {
    canReschedule = true;
  }

  return {
    ref: row.ref,
    serviceName,
    tierTitle,
    mode: row.mode as ModeKey,
    startMs: row.startAt ? row.startAt.getTime() : null,
    endMs: row.endAt ? row.endAt.getTime() : null,
    status: row.status as BookingStatus,
    meetingLink: row.status === "confirmed" ? row.meetingLink : null,
    hasReport: row.reportMediaId !== null,
    reportMediaId: row.reportMediaId,
    canReschedule,
    rescheduleReason,
    priceInr: row.priceInr,
    locale: row.locale as Locale,
    serviceKey: row.serviceKey as ServiceKey,
    tierKey: row.tierKey as TierKey,
  };
}

const VIEW_COLS = {
  id: bookings.id,
  ref: bookings.ref,
  locale: bookings.locale,
  serviceKey: bookings.serviceKey,
  tierKey: bookings.tierKey,
  mode: bookings.mode,
  startAt: bookings.startAt,
  endAt: bookings.endAt,
  status: bookings.status,
  meetingLink: bookings.meetingLink,
  reportMediaId: bookings.reportMediaId,
  rescheduleCount: bookings.rescheduleCount,
  priceInr: bookings.priceInr,
  accessHash: bookings.accessHash,
  userId: bookings.userId,
} as const;

export async function getBookingView(
  ref: string,
  accessKey: string,
): Promise<BookingView | null> {
  const [row] = await db
    .select(VIEW_COLS)
    .from(bookings)
    .where(eq(bookings.ref, ref))
    .limit(1);

  if (!row) return null;

  const keyHash = sha256Hex(accessKey);
  if (!safeEqualHex(keyHash, row.accessHash)) {
    return null;
  }

  return assembleBookingView(row);
}

export async function getBookingViewForUser(
  userId: number,
  ref: string,
): Promise<BookingView | null> {
  const [row] = await db
    .select(VIEW_COLS)
    .from(bookings)
    .where(and(eq(bookings.ref, ref), eq(bookings.userId, userId)))
    .limit(1);

  if (!row) return null;

  return assembleBookingView(row);
}

export type BookingListItem = {
  ref: string;
  serviceName: string;
  tierTitle: string;
  mode: ModeKey;
  startMs: number | null;
  status: BookingStatus;
  priceInr: number;
  locale: Locale;
};

export async function listMyBookings(userId: number): Promise<BookingListItem[]> {
  const rows = await db
    .select({
      ref: bookings.ref,
      locale: bookings.locale,
      serviceKey: bookings.serviceKey,
      tierKey: bookings.tierKey,
      mode: bookings.mode,
      startAt: bookings.startAt,
      status: bookings.status,
      priceInr: bookings.priceInr,
    })
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(
      sql`CASE WHEN ${bookings.status} IN ('confirmed', 'pending_payment') THEN 0 ELSE 1 END`,
      desc(bookings.createdAt),
    );

  const consultData = await getConsultRows();

  return rows.map((row) => {
    const isHi = row.locale === "hi";
    const service = consultData.services.find((s) => s.key === row.serviceKey);
    const tier = consultData.tiers.find(
      (t) => t.serviceKey === row.serviceKey && t.tierKey === row.tierKey,
    );

    return {
      ref: row.ref,
      serviceName: service
        ? isHi
          ? service.nameHi
          : service.nameEn
        : row.serviceKey,
      tierTitle: tier
        ? isHi
          ? tier.titleHi || tier.titleEn
          : tier.titleEn
        : row.tierKey,
      mode: row.mode as ModeKey,
      startMs: row.startAt ? row.startAt.getTime() : null,
      status: row.status as BookingStatus,
      priceInr: row.priceInr,
      locale: row.locale as Locale,
    };
  });
}
