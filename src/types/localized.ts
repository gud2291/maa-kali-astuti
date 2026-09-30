import type { Locale } from "@/i18n/routing";

export type { Locale };

/** Content that exists in both languages. */
export type LocalizedString = { en: string; hi: string };

/** Pick the right side of a `{ en, hi }` pair. */
export const tr = (s: LocalizedString, locale: Locale | string): string => (locale === "hi" ? s.hi : s.en);
