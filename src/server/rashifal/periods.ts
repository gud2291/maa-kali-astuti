import "server-only";

import type { RashifalPeriod } from "@/lib/domain/enums";
import type { Period as UiPeriod } from "@/lib/astro/predict";
import { addDaysKey, weekdayOfKey } from "@/lib/core/ist";

/**
 * Returns the canonical start date string (YYYY-MM-DD) for a given period and date.
 * - day: itself
 * - week: Monday of that week
 * - month: yyyy-mm-01
 * - year: yyyy-01-01
 */
export function periodStart(period: RashifalPeriod, dayKey: string): string {
  if (period === "day") {
    return dayKey;
  }
  if (period === "week") {
    const wd = weekdayOfKey(dayKey);
    const daysSinceMonday = (wd + 6) % 7;
    return addDaysKey(dayKey, -daysSinceMonday);
  }
  if (period === "month") {
    return `${dayKey.slice(0, 7)}-01`;
  }
  return `${dayKey.slice(0, 4)}-01-01`;
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
