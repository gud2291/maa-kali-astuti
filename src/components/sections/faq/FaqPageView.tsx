"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FaqList } from "@/components/ui/FaqList";
import { Icon } from "@/components/icons/Icon";
import { cn } from "@/lib/utils/cn";
import { waLink } from "@/lib/site";
import type { FaqRow } from "@/server/faqs/queries";

export type FaqPageViewProps = {
  faqsBySet: Record<string, FaqRow[]>;
};

const FAQ_SET_KEYS = [
  "general",
  "shop",
  "consult",
  "kundali99",
  "courses",
  "rituals",
] as const;

export function FaqPageView({ faqsBySet }: FaqPageViewProps): React.JSX.Element {
  const t = useTranslations("faqPage");
  const locale = useLocale();
  const isHi = locale === "hi";

  const [activeSet, setActiveSet] = useState<string>("general");
  const [search, setSearch] = useState<string>("");

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;

    const matched: [string, string][] = [];
    for (const key of FAQ_SET_KEYS) {
      const rows = faqsBySet[key] || [];
      for (const row of rows) {
        const qText = isHi && row.qHi ? row.qHi : row.qEn;
        const aText = isHi && row.aHi ? row.aHi : row.aEn;

        if (
          qText.toLowerCase().includes(q) ||
          aText.toLowerCase().includes(q) ||
          row.qEn.toLowerCase().includes(q) ||
          row.aEn.toLowerCase().includes(q) ||
          row.qHi.toLowerCase().includes(q) ||
          row.aHi.toLowerCase().includes(q)
        ) {
          matched.push([qText, aText]);
        }
      }
    }
    return matched;
  }, [search, faqsBySet, isHi]);

  const activeItems: [string, string][] = useMemo(() => {
    const rows = faqsBySet[activeSet] || [];
    return rows.map((r) => [
      isHi && r.qHi ? r.qHi : r.qEn,
      isHi && r.aHi ? r.aHi : r.aEn,
    ]);
  }, [faqsBySet, activeSet, isHi]);

  return (
    <div className="space-y-10">
      {/* Search Input */}
      <div className="max-w-xl mx-auto relative">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-13 pl-12 pr-10 rounded-pill border border-s2 bg-cream font-sans text-[15px] text-ink placeholder:text-ink6/60 focus:border-em5 focus:outline-none shadow-xs"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-g7">
            <Icon name="search" className="size-5" />
          </div>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink6 hover:text-ink p-1 rounded-pill"
              aria-label="Clear search"
            >
              <Icon name="close" className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* When Search is Active */}
      {searchResults !== null ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-s2 pb-3">
            <p className="font-sans text-[14px] text-ink6">
              {t("searchResults", { count: searchResults.length })}
            </p>
            <button
              type="button"
              onClick={() => setSearch("")}
              className="font-sans text-[13px] text-em5 hover:underline font-medium"
            >
              {t("clearSearch")}
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-btn border border-s2 bg-cream/40 space-y-2">
              <p className="font-display text-[20px] text-em9">{t("noResults")}</p>
              <p className="font-sans text-[14px] text-ink6">
                {t("noResultsDesc")}
              </p>
            </div>
          ) : (
            <FaqList items={searchResults} openFirst={true} />
          )}
        </div>
      ) : (
        /* Tabs & Category Accordions */
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Tabs bar */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FAQ_SET_KEYS.map((key) => {
              const isSelected = activeSet === key;
              const count = faqsBySet[key]?.length || 0;
              const label = t(`tabs.${key}`);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSet(key)}
                  className={cn(
                    "rounded-pill px-4 py-2 font-sans text-[13.5px] font-medium transition-all cursor-pointer flex items-center gap-1.5",
                    isSelected
                      ? "bg-em9 text-cream shadow-xs"
                      : "bg-cream/60 border border-s2 text-ink6 hover:text-ink hover:border-em5/50",
                  )}
                >
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[11px] px-1.5 py-0.2 rounded-pill font-mono",
                        isSelected ? "bg-em7/40 text-cream" : "bg-s2/70 text-ink6",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Set Accordion */}
          {activeItems.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-btn border border-s2 bg-cream/40">
              <p className="font-sans text-[14px] text-ink6">{t("emptySet")}</p>
            </div>
          ) : (
            <FaqList items={activeItems} openFirst={false} />
          )}
        </div>
      )}

      {/* Still Have Questions Callout */}
      <div className="max-w-2xl mx-auto text-center pt-8 border-t border-s2 space-y-3">
        <h4 className="font-display text-[22px] font-normal text-em9 font-soft">
          {t("stillQuestions")}
        </h4>
        <p className="font-sans text-[15px] text-ink6 leading-relaxed">
          {t("stillQuestionsDesc")}
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/contact"
            className="h-10 px-5 rounded-btn bg-em9 text-cream hover:bg-em7 font-sans text-[13.5px] font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="mail" className="size-4" />
            {t("contactUs")}
          </Link>
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-btn border border-s2 bg-cream text-ink hover:text-em5 hover:border-em5 font-sans text-[13.5px] font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="whatsapp" className="size-4 text-[#25D366]" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
