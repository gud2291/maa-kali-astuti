import "server-only";
import { and, eq, gte, gt, lte, or } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import { addDaysKey, istDayKey, istWallToUtc, weekdayOfKey } from "@/lib/core/ist";
import type { ServiceKey, TierKey } from "@/lib/domain/enums";

export type SlotLen = "30" | "45" | "60" | "90";

export function slotLen(mins: number): SlotLen {
  return mins <= 30 ? "30" : mins <= 45 ? "45" : mins <= 60 ? "60" : "90";
}

export type ConsultRules = {
  openDays: number[];
  bookingWindowDays: number;
  minLeadHours: number;
  blocked: { from: string; to: string; note: string }[];
};

export async function getDaySlots({
  serviceKey,
  tierKey,
  day,
}: {
  serviceKey: ServiceKey;
  tierKey: TierKey;
  day: string;
}): Promise<{ t: string; free: boolean }[]> {
  const consultSettings = await getSetting("consult");
  const consultData = await getConsultRows();

  const tier = consultData.tiers.find(
    (t) => t.serviceKey === serviceKey && t.tierKey === tierKey,
  );
  if (!tier) {
    return [];
  }

  const now = new Date();
  const todayKey = istDayKey(now);

  // Empty if day is before today
  if (day < todayKey) {
    return [];
  }

  // Empty if weekday is closed
  const dow = weekdayOfKey(day);
  if (!consultSettings.openDays.includes(dow)) {
    return [];
  }

  // Empty if day is beyond booking window
  const maxDayKey = addDaysKey(todayKey, consultSettings.bookingWindowDays);
  if (day > maxDayKey) {
    return [];
  }

  const len = slotLen(tier.mins);
  const times = consultSettings.startTimes[len] ?? [];
  if (times.length === 0) {
    return [];
  }

  // Check if day falls inside any blocked range
  const isDayBlocked = consultSettings.blocked.some(
    (b) => day >= b.from && day <= b.to,
  );

  // Query existing bookings that may overlap with this day's slots (day ± 2h)
  const dayStartUtc = istWallToUtc(day, "00:00");
  const dayEndUtc = istWallToUtc(day, "23:59");
  const queryStart = new Date(dayStartUtc.getTime() - 2 * 3600_000);
  const queryEnd = new Date(dayEndUtc.getTime() + 2 * 3600_000);

  const existingBookings = await db
    .select({
      startAt: bookings.startAt,
      endAt: bookings.endAt,
      status: bookings.status,
      holdExpiresAt: bookings.holdExpiresAt,
    })
    .from(bookings)
    .where(
      and(
        gte(bookings.startAt, queryStart),
        lte(bookings.startAt, queryEnd),
        or(
          eq(bookings.status, "confirmed"),
          and(
            eq(bookings.status, "pending_payment"),
            gt(bookings.holdExpiresAt, now),
          ),
        ),
      ),
    );

  const minLeadMs = consultSettings.minLeadHours * 3600_000;

  return times.map((t) => {
    const start = istWallToUtc(day, t);
    const end = new Date(start.getTime() + tier.mins * 60_000);

    if (isDayBlocked) {
      return { t, free: false };
    }

    if (start.getTime() < now.getTime() + minLeadMs) {
      return { t, free: false };
    }

    const overlaps = existingBookings.some((b) => {
      if (!b.startAt || !b.endAt) return false;
      return (
        b.startAt.getTime() < end.getTime() &&
        b.endAt.getTime() > start.getTime()
      );
    });

    if (overlaps) {
      return { t, free: false };
    }

    return { t, free: true };
  });
}
