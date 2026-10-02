/* [client-review] Draft text for Sadhak Ji's review. */
import "server-only";
import type { ReportContent } from "./types";
import { REPORT_EN } from "./en";
import { REPORT_HI } from "./hi";

function deepMerge<T>(base: T, override?: unknown): T {
  if (override === undefined || override === null) {
    return base;
  }
  if (typeof override === "string") {
    return (override.trim().length > 0 ? override : base) as T;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    return base.map((item, index) => {
      const overItem = override[index];
      return overItem !== undefined ? deepMerge(item, overItem) : item;
    }) as unknown as T;
  }
  if (typeof base === "object" && base !== null) {
    if (typeof override !== "object" || override === null || Array.isArray(override)) {
      return base;
    }
    const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    const overObj = override as Record<string, unknown>;
    for (const key of Object.keys(overObj)) {
      if (overObj[key] !== undefined) {
        if (key in result) {
          result[key] = deepMerge(result[key], overObj[key]);
        } else {
          result[key] = overObj[key];
        }
      }
    }
    return result as T;
  }
  return (override !== undefined ? override : base) as T;
}

let cachedHiReport: ReportContent | null = null;

/**
 * Returns the full Kundali report content for the specified language.
 * Merges English baseline with available Hindi translations.
 */
export function getReportContent(lang: "en" | "hi" = "en"): ReportContent {
  if (lang === "hi") {
    if (!cachedHiReport) {
      cachedHiReport = deepMerge(REPORT_EN, REPORT_HI);
    }
    return cachedHiReport;
  }
  return REPORT_EN;
}

export * from "./types";
export { REPORT_EN } from "./en";
export { REPORT_HI } from "./hi";
