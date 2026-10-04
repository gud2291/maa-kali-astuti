import "server-only";

import type { RashifalPeriod } from "@/lib/domain/enums";
import type { Period as UiPeriod } from "@/lib/astro/predict";
import { addDaysKey, periodStartKey } from "@/lib/core/ist";

/**
 * Returns the canonical start date string (YYYY-MM-DD) for a given period and date.
 * - day: itself
 * - week: Monday of that week
 * - month: yyyy-mm-01
 * - year: yyyy-01-01
 */
export function periodStart(period: RashifalPeriod, dayKey: string): string {
  return periodStartKey(period, dayKey);
}

/**
 * Maps a UI period ("today" | "tomorrow" | "week" | "month" | "year") and reference dayKey (YYYY-MM-DD)
 * to a database query period and startsOn key.
 */
export function uiPeriodToQuery(
  p: UiPeriod,
  todayKey: string,
): { period: RashifalPeriod; startsOn: string } {
  if (p === "today") {
    return { period: "day", startsOn: periodStart("day", todayKey) };
  }
  if (p === "tomorrow") {
    const tomorrowKey = addDaysKey(todayKey, 1);
    return { period: "day", startsOn: periodStart("day", tomorrowKey) };
  }
  if (p === "week") {
    return { period: "week", startsOn: periodStart("week", todayKey) };
  }
  if (p === "month") {
    return { period: "month", startsOn: periodStart("month", todayKey) };
  }
  return { period: "year", startsOn: periodStart("year", todayKey) };
}
