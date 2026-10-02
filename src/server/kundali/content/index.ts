/* [client-review] Draft text for Sadhak Ji's review. */
import "server-only";
import type { ReportContent } from "./types";
import { REPORT_EN } from "./en";

/**
 * Returns the full Kundali report content for the specified language.
 * Currently returns English content for both locales; B27/B28 implement the Hindi content layer.
 */
export function getReportContent(lang: "en" | "hi" = "en"): ReportContent {
  if (lang === "hi") {
    // English fallback until B27 and B28 introduce Hindi translations
    return REPORT_EN;
  }
  return REPORT_EN;
}

export * from "./types";
export { REPORT_EN } from "./en";
