import { defineRouting } from "next-intl/routing";

/* `/` = English (default, no prefix), `/hi` = Hindi. */
export const routing = defineRouting({
  locales: ["en", "hi"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // `/` always serves English; Hindi only via `/hi` or the EN|हिं toggle (predictable for SEO + demo).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
