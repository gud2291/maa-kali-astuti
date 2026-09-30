"use client";
import { useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { EYEBROW } from "@/components/sections/consult/ui";
import { PERIODS, periodDate, predict } from "@/lib/astro/predict";
import { RASHI } from "@/lib/astro/rashi";
import { rashiHref } from "@/lib/routes";
import { rovingTarget } from "@/lib/utils/roving";
import { cn } from "@/lib/utils/cn";
import { Dots, useRashifal } from "./period";
import { brass, H2 } from "./ui";

/* §2 "Twelve rashis" #rashis (Rashifal.dc.html 111–137, renderVals 271–272). Ivory. The five
   period tabs (a pick rewrites `?p=` in place) over the 12-card grid: 2 cols, 3 from 768 (with
   the short line), 4 from 1180. The remembered rashi gets the "Yours" chip and a brass ring. */

export function RashifalGrid() {
  const t = useTranslations("rashifal");
  const { per, setPer, day, mine } = useRashifal();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const keys = PERIODS.map(([k]) => k);

  const onTabsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const to = rovingTarget(e.key, keys.indexOf(per), keys.length);
    if (to < 0) return;
    e.preventDefault();
    tabRefs.current[to]?.focus();
    setPer(keys[to]);
  };

  return (
    <section id="rashis" data-screen-label="Twelve rashis" className="scroll-mt-[60px] bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(48px,7vw,104px)]">
        <div className="mb-[clamp(20px,3vw,32px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("grid.eyebrow", { period: t(`periods.${per}`) })}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("grid.title", { em: brass })}
            </h2>
          </div>
          <span
            data-reveal="1"
            className="font-sans text-[13.5px] leading-[1.5] font-semibold text-ink6 tabular-nums"
          >
            {periodDate(per, day)}
          </span>
        </div>

        <div
          role="tablist"
          aria-label={t("grid.tabsAria")}
          onKeyDown={onTabsKey}
          className="no-scrollbar mb-[clamp(20px,3vw,32px)] flex gap-1.5 py-1 max-sm:overflow-x-auto"
        >
          {PERIODS.map(([k, , hi], i) => {
            const sel = k === per;
            return (
              <button
                key={k}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-controls="rf-grid"
                tabIndex={sel ? 0 : -1}
                onClick={() => setPer(k)}
                className={cn(
                  "flex min-h-12 flex-none cursor-pointer flex-col items-center justify-center gap-[3px] rounded-btn border-0 px-[18px] py-1.5 transition-[background-color,color] duration-200",
                  sel ? "bg-em9 text-iv" : "bg-transparent text-ink shadow-[inset_0_0_0_1px_#EAE0CA]",
                )}
              >
                <span className="font-sans text-[14px] leading-none font-semibold">{t(`periods.${k}`)}</span>
                <span lang="hi" className={cn("font-hi text-[12.5px] leading-[1.2]", sel ? "text-g3" : "text-g7")}>
                  {hi}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id="rf-grid"
          role="tabpanel"
          aria-label={t(`periods.${per}`)}
          className="grid grid-cols-2 gap-[clamp(10px,1.6vw,18px)] md:grid-cols-3 nav:grid-cols-4"
        >
          {RASHI.map((x, i) => {
            const p = predict(x, per, day);
            const me = mine === x.key;
            return (
              <Link
                key={x.key}
                data-reveal={String(i % 4)}
                href={rashiHref(x.key, per)}
                className={cn(
                  "relative flex flex-col gap-3 rounded-btn p-[clamp(14px,2vw,22px)] text-ink no-underline transition-[box-shadow,transform] duration-[250ms] hover:-translate-y-[3px] hover:text-ink hover:shadow-[inset_0_0_0_1px_#B8923A,0_18px_36px_-24px_rgba(14,59,48,.4)]",
                  me
                    ? "bg-cream shadow-[inset_0_0_0_1.5px_#B8923A,0_18px_36px_-24px_rgba(14,59,48,.4)]"
                    : "bg-iv shadow-[inset_0_0_0_1px_#EAE0CA]",
                )}
              >
                {me && (
                  <span className="absolute top-3 right-3 inline-flex h-[22px] items-center rounded-pill bg-em9 px-[9px] font-sans text-[10px] leading-none font-bold tracking-[.1em] text-g3 uppercase hi:tracking-normal">
                    {t("grid.yours")}
                  </span>
                )}
                <span className="grid size-12 place-items-center rounded-pill bg-s1 shadow-[inset_0_0_0_1px_rgba(184,146,58,.45)]">
                  <span className="block size-[26px]">
                    <RashiGlyph k={x.key} col="#B8923A" sw={1.3} />
                  </span>
                </span>
                <span className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span lang="en" className="font-display text-[clamp(19px,1.8vw,23px)] leading-[1.1] text-em9">
                      {x.en}
                    </span>
                    <span lang="hi" className="font-deva text-[17px] leading-[1.3] text-g7">
                      {x.hi}
                    </span>
                  </span>
                  <span className="font-sans text-[12px] leading-[1.3] font-semibold text-ink6">
                    {x.west} · {x.dates}
                  </span>
                </span>
                <span lang="en" className="font-sans text-[14px] leading-[1.6] text-pretty text-ink max-md:hidden">
                  {p.short}
                </span>
                <span className="mt-auto flex items-center justify-between gap-2 border-t border-s2 pt-2.5">
                  <Dots n={p.overall} label={t("overall", { n: p.overall })} on="#B8923A" ring="#B8923A" />
                  <span className="block size-4 text-g5">
                    <Icon name="arrowR" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
