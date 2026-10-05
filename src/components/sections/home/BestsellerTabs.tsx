"use client";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { ProductCard } from "@/components/commerce/ProductCard";
import { InlineArt } from "@/components/ui/InlineArt";
import { EASE } from "@/components/motion/easing";
import { YANTRA_GOLD } from "@/lib/art/yantras";
import { categoryHref, routes } from "@/lib/routes";
import { waLinkTo } from "@/lib/site";
import { useSiteSettings } from "@/components/layout/SiteSettingsProvider";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/types/product";
import { BEST_TAB_CAT, BEST_TABS, type BestTab } from "./home-data";

/* Bestsellers tabs + grid (Home.dc.html 249–270, switchTab 1052–1058).
   Tab swap: the cards fade out (170 ms); at 180 ms the list changes and the new cards rise 14px
   and fade in (520 ms, 55 ms apart). Reduced motion swaps instantly. When a list has fewer than
   eight products (Amulets has seven) the dark "Not sure which one?" WhatsApp tile fills the gap. */

const allHref = (k: BestTab) => {
  const cat = BEST_TAB_CAT[k];
  return cat ? categoryHref(cat) : routes.shop;
};

export function BestsellerTabs({ lists, children }: { lists: Record<BestTab, Product[]>; children: ReactNode }) {
  const t = useTranslations("home.best");
  const { contact } = useSiteSettings();
  const [tab, setTab] = useState<BestTab>("best");
  const gridRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<BestTab, HTMLButtonElement | null>>>({});
  const pending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // New list committed: stagger the cards in before the browser paints them.
  useLayoutEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    gridRef.current?.querySelectorAll("[data-card]").forEach((c, i) => {
      c.getAnimations().forEach((a) => a.cancel());
      c.animate(
        [
          { opacity: 0, transform: "translateY(14px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 520, delay: i * 55, easing: EASE, fill: "backwards" },
      );
    });
  }, [tab]);

  const pick = (k: BestTab) => {
    if (k === tab) return;
    const g = gridRef.current;
    if (!g || isReduced()) {
      setTab(k);
      return;
    }
    g.querySelectorAll("[data-card]").forEach((c) =>
      c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, fill: "forwards" }),
    );
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pending.current = true;
      setTab(k);
    }, 180);
  };

  // Roving focus across the tabs (←/→, Home/End); selection follows focus.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = BEST_TABS.indexOf(tab);
    const n = BEST_TABS.length;
    const to =
      e.key === "ArrowRight"
        ? (i + 1) % n
        : e.key === "ArrowLeft"
          ? (i - 1 + n) % n
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? n - 1
              : -1;
    if (to < 0) return;
    e.preventDefault();
    const k = BEST_TABS[to];
    tabRefs.current[k]?.focus();
    pick(k);
  };

  const list = lists[tab];

  return (
    <>
      <div className="mb-[clamp(24px,3vw,40px)] flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
        {children}
        <div
          role="tablist"
          aria-label={t("tablist")}
          onKeyDown={onKey}
          className="no-scrollbar flex max-w-full gap-6 overflow-x-auto shadow-[inset_0_-1px_0_#EAE0CA]"
        >
          {BEST_TABS.map((k) => {
            const on = tab === k;
            return (
              <button
                key={k}
                ref={(el) => {
                  tabRefs.current[k] = el;
                }}
                type="button"
                role="tab"
                id={`best-tab-${k}`}
                aria-selected={on}
                aria-controls="best-panel"
                tabIndex={on ? 0 : -1}
                onClick={() => pick(k)}
                className={cn(
                  "min-h-11 flex-none cursor-pointer border-0 bg-transparent py-3 font-sans text-[14px] leading-none font-semibold whitespace-nowrap transition-[color,box-shadow] duration-[150ms,250ms]",
                  on ? "text-em9 shadow-[inset_0_-2px_0_#B8923A]" : "text-ink6",
                )}
              >
                {t(`tabs.${k}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={gridRef}
        id="best-panel"
        role="tabpanel"
        aria-labelledby={`best-tab-${tab}`}
        className="grid grid-cols-2 gap-x-[clamp(12px,1.6vw,24px)] gap-y-[clamp(28px,3vw,44px)] min-[700px]:grid-cols-3 lg:grid-cols-4"
      >
        {list.map((p) => (
          <div key={p.id} data-card="" className="min-w-0">
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, (min-width: 700px) 33vw, 50vw" />
          </div>
        ))}
        {list.length < 8 && (
          <a
            data-card=""
            href={waLinkTo(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            lang="en"
            className="relative flex flex-col justify-between gap-6 overflow-hidden rounded-btn bg-em9 p-[clamp(18px,2vw,28px)] text-em1 no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)] hover:text-em1"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-[60px] -bottom-[60px] size-[220px] opacity-[.14]"
            >
              <InlineArt svg={YANTRA_GOLD.baglamukhi} uid="hm-ty" />
            </span>
            <span className="relative font-sans text-[10.5px] leading-[1.3] font-semibold tracking-[.14em] text-g3 uppercase">
              {t("tile.eyebrow")}
            </span>
            <span className="relative flex flex-col gap-2.5">
              <span className="font-display text-[clamp(21px,2vw,26px)] leading-[1.2] text-iv">{t("tile.title")}</span>
              <span className="font-sans text-[14.5px] leading-[1.6] text-sg3">{t("tile.body")}</span>
            </span>
            <span className="relative inline-flex items-center gap-2 font-sans text-[14px] leading-none font-semibold text-g1">
              <span className="block size-[17px]">
                <Icon name="whatsapp" />
              </span>
              {t("tile.cta")}
            </span>
          </a>
        )}
      </div>

      <div className="mt-[clamp(36px,4vw,56px)] flex justify-center">
        <Link
          href={allHref(tab)}
          className="inline-flex h-[52px] items-center gap-2.5 rounded-btn bg-iv px-[26px] font-sans text-[15px] leading-none font-semibold text-em7 no-underline shadow-ring-em transition-colors duration-150 hover:bg-em1 hover:text-em7"
        >
          {t(`all.${tab}`)}
          <span className="block size-4">
            <Icon name="arrowR" />
          </span>
        </Link>
      </div>
    </>
  );
}
