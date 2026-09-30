"use client";
import { useCallback } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

/**
 * EN | हिं toggle (design `M.store.setLang`). Same page in the other locale, keeping the query
 * and hash. The query is read at click time (not `useSearchParams`) so static pages stay static.
 */
export function useSwitchLocale() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      router.replace(`${pathname}${window.location.search}${window.location.hash}`, { locale: next, scroll: false });
    },
    [locale, pathname, router],
  );
  return { locale, hi: locale === "hi", setLocale };
}
