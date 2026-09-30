"use client";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { WheelLayers } from "@/components/signature/RashiWheel";
import { Starfield } from "@/components/signature/Starfield";
import { useRashiCycle } from "@/components/signature/useRashiCycle";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { AREAS, periodDate, predict, type Area } from "@/lib/astro/predict";
import { RASHI, todayRashi } from "@/lib/astro/rashi";
import { dlong } from "@/lib/core/dates";
import { useIsMobile } from "@/lib/hooks/useMedia";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { rashiHref, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { Dots, useRashifal } from "./period";
import { NightCrumbs } from "./ui";

/* Rashifal hero (Rashifal.dc.html 32–110, script 205–296, S8). Night band with a seeded star sky.
   ≥768: the wheel (click a rashi, prev / pause / next, ←/→ on the controls) beside the reading
   panel for the current period (meters, lucky trio, gemstone, CTAs). The panel fades 0 → 1 over
   300 ms when the rashi changes (didUpdate 217–225).
   <768: the half-dial (width min(128vw, 620px), height half + 6px) over a snap rail of 12 cards;
   swiping turns the dial. Both layouts are in the DOM (CSS picks one); useRashiCycle drives the
   visible one. The wheel starts on today's sun rashi. */

export type RashiStone = { name: string; href: string } | null;

const ctrlCls =
  "grid size-11 cursor-pointer place-items-center rounded-pill border-0 bg-transparent text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)] hover:bg-[rgba(217,185,106,.1)]";

const DT = "font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal";

export function RashifalHero({ stones }: { stones: Record<string, RashiStone> }) {
  const t = useTranslations("rashifal");
  const { per, day } = useRashifal();
  const mobile = useIsMobile();
  const cyc = useRashiCycle(todayRashi(day).i, mobile);
  const { refs } = cyc;
  const panelRef = useRef<HTMLDivElement>(null);
  const lastIdx = useRef(cyc.idx);

  const r = RASHI[cyc.idx];
  const pr = predict(r, per, day);
  const stone = stones[r.key];
  const perLabel = t(`periods.${per}`);

  // Panel fade 0 → 1 (300 ms, ease-out) on rashi change.
  useEffect(() => {
    if (lastIdx.current === cyc.idx) return;
    lastIdx.current = cyc.idx;
    if (!panelRef.current || isReduced()) return;
    panelRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
  }, [cyc.idx]);

  const onCtrlKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      cyc.prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      cyc.next();
    }
  };

  const areaLabel = (k: Area) => t(`panelAreas.${k}`);
  const gold = (c: ReactNode) => <em className="text-g3 italic">{c}</em>;

  return (
    <section data-screen-label="Rashifal wheel" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="rf-sky" n={28} nMob={16} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,48px)] pb-[clamp(40px,7vw,104px)]">
        <div className="mb-[clamp(20px,4vw,48px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-3.5">
          <div className="flex max-w-[720px] flex-col gap-3.5">
            <NightCrumbs label={t("crumbsAria")} items={[{ href: routes.home, t: t("home") }, { t: t("here") }]} />
            <span className={cn(EYEBROW, "text-g3")}>{t.rich("hero.eyebrow", rich("text-g3"))}</span>
            <h1
              lang="en"
              className="m-0 font-display text-[clamp(40px,5.4vw,74px)] leading-[1.02] font-normal tracking-[-.022em] text-balance text-iv font-soft"
            >
              {t.rich("hero.title", { em: gold })}
            </h1>
          </div>
          <span className="flex max-w-[320px] flex-col gap-1.5 font-sans text-[13.5px] leading-[1.5] font-medium text-sg3">
            <span className="font-sans text-[15px] leading-[1.3] font-semibold text-iv">{dlong(new Date(day))}</span>
            {t("hero.intro")}
          </span>
        </div>

        {/* ≥768: wheel + panel */}
        <div className="grid grid-cols-1 items-center gap-[clamp(28px,5vw,80px)] max-md:hidden w900:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
          <div className="relative min-w-0">
            <div
              ref={refs.wheelEl}
              role="group"
              aria-label={t("hero.wheelAria")}
              onMouseEnter={cyc.hold}
              onFocus={cyc.hold}
              onClick={cyc.onWheelClick}
              className="relative mx-auto aspect-square w-full max-w-[460px] cursor-pointer w900:max-w-[560px]"
            >
              <WheelLayers ringRef={refs.wheelRing} uid="rf-w" />
            </div>
            <div onKeyDown={onCtrlKey} onFocus={cyc.hold} className="mt-3.5 flex justify-center gap-2.5">
              <button type="button" onClick={cyc.prev} aria-label={t("hero.prev")} className={ctrlCls}>
                <Icon name="chevL" className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={cyc.toggle}
                aria-label={cyc.playing ? t("hero.pause") : t("hero.resume")}
                className={ctrlCls}
              >
                <Icon name={cyc.playing ? "pause" : "play"} className="size-4" />
              </button>
              <button type="button" onClick={cyc.next} aria-label={t("hero.next")} className={ctrlCls}>
                <Icon name="chevR" className="size-[18px]" />
              </button>
            </div>
          </div>

          <div ref={panelRef} aria-live="polite" className="flex min-w-0 flex-col gap-[18px]">
            <span className={cn(EYEBROW, "text-g3")}>
              {perLabel} · {periodDate(per, day)}
            </span>
            <div className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-4">
              <span className="grid size-[68px] place-items-center rounded-pill bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]">
                <span className="block size-9">
                  <RashiGlyph k={r.key} col="#F6E7BC" sw={1.3} />
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span lang="en" className="font-display text-[clamp(34px,3.6vw,46px)] leading-none text-iv font-soft">
                    {r.en}
                  </span>
                  <span lang="hi" className="font-deva text-[clamp(24px,2.4vw,30px)] leading-[1.2] text-g3">
                    {r.hi}
                  </span>
                </span>
                <span className="font-sans text-[13px] leading-[1.3] font-semibold text-sg3">
                  {t("line", { west: r.west, dates: r.dates, lordHi: r.lordHi, lord: r.lord })}
                </span>
              </span>
            </div>
            <p lang="en" className="m-0 max-w-[560px] font-sans text-[17px] leading-[1.7] text-pretty text-em1">
              {pr.text}
            </p>
            <div className="grid max-w-[520px] grid-cols-2 gap-x-6 gap-y-2.5">
              {AREAS.map(([k, , , icn]) => (
                <span
                  key={k}
                  className="flex items-center justify-between gap-2.5 border-t border-[rgba(217,185,106,.2)] py-2.5"
                >
                  <span className="flex items-center gap-2 font-sans text-[13px] leading-none font-semibold text-em1">
                    <span className="block size-4 text-g3">
                      <Icon name={icn as IconName} />
                    </span>
                    {areaLabel(k)}
                  </span>
                  <Dots
                    n={pr.meters[k]}
                    label={t("meterAria", { area: areaLabel(k), n: pr.meters[k] })}
                    on="#D9B96A"
                    ring="rgba(217,185,106,.6)"
                  />
                </span>
              ))}
            </div>
            <dl className="m-0 grid max-w-[560px] grid-cols-3 gap-3 rounded-btn bg-n8 p-4 shadow-[inset_0_0_0_1px_rgba(217,185,106,.3)]">
              <div className="flex flex-col gap-1.5">
                <dt className={DT}>{t("lucky")}</dt>
                <dd className="m-0 font-display text-[26px] leading-none text-iv">{pr.luckyNum}</dd>
              </div>
              <div className="flex flex-col gap-1.5">
                <dt className={DT}>{t("colour")}</dt>
                <dd className="m-0 flex items-center gap-2 font-sans text-[13.5px] leading-[1.25] font-semibold text-iv">
                  <span
                    className="size-4 flex-none rounded-pill shadow-[0_0_0_1px_rgba(217,185,106,.6)]"
                    style={{ backgroundColor: r.hex }}
                  />
                  {r.colour}
                </dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <dt className={DT}>{t("gemstone")}</dt>
                <dd className="m-0 min-w-0">
                  <Link
                    href={stone ? stone.href : routes.shop}
                    className="font-sans text-[13.5px] leading-[1.25] font-semibold text-g1 underline decoration-[rgba(217,185,106,.6)] underline-offset-[3px] hover:text-iv"
                  >
                    {stone ? stone.name : t("seeGems")}
                  </Link>
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2.5">
              <Link
                href={rashiHref(r.key, per)}
                className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-g3 px-[22px] font-sans text-[14.5px] leading-none font-bold text-n9 no-underline transition-transform duration-200 hover:-translate-y-px hover:text-n9"
              >
                {t("hero.full", { name: r.en })}
                <Icon name="arrowR" className="size-4" />
              </Link>
              <Link
                href={routes.kundali99}
                className="inline-flex h-[50px] items-center gap-[9px] rounded-btn px-5 font-sans text-[14.5px] leading-none font-semibold text-g1 no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.6)] hover:bg-[rgba(217,185,106,.1)] hover:text-iv"
              >
                <Icon name="kundali" className="size-[17px]" />
                {t("hero.kundali")}
              </Link>
            </div>
          </div>
        </div>

        {/* <768: half-dial + swipe rail */}
        <div className="md:hidden">
          <div className="relative -mx-4 h-[calc(min(128vw,620px)*.5+6px)] overflow-hidden">
            <div
              ref={refs.dialEl}
              aria-hidden="true"
              className="absolute top-0 left-1/2 aspect-square w-[min(128vw,620px)] -translate-x-1/2"
            >
              <WheelLayers ringRef={refs.dialRing} uid="rf-d" />
            </div>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(rgba(10,31,26,0),#0A1F1A)]"
            />
          </div>
          <div
            ref={refs.railEl}
            onScroll={cyc.onRail}
            onTouchStart={cyc.hold}
            role="region"
            aria-label={t("hero.railAria")}
            className="-mx-4 no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12vw] pt-1 pb-2"
          >
            {RASHI.map((x) => {
              const p = predict(x, per, day);
              const on = x.i === cyc.idx;
              return (
                <article
                  key={x.key}
                  data-card=""
                  className={cn(
                    "flex flex-[0_0_76vw] snap-center flex-col gap-3 rounded-btn bg-n8 p-[18px] transition-shadow duration-300",
                    on
                      ? "shadow-[inset_0_0_0_1px_#D9B96A,0_18px_36px_-20px_rgba(0,0,0,.6)]"
                      : "shadow-[inset_0_0_0_1px_rgba(217,185,106,.22)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 flex-none place-items-center rounded-pill bg-n9 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)]">
                      <span className="block size-6">
                        <RashiGlyph k={x.key} col="#D9B96A" sw={1.4} />
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="flex items-baseline gap-2">
                        <span lang="en" className="font-display text-[23px] leading-none text-iv">
                          {x.en}
                        </span>
                        <span lang="hi" className="font-deva text-[18px] leading-[1.2] text-g3">
                          {x.hi}
                        </span>
                      </span>
                      <span className="font-sans text-[12px] leading-[1.2] font-semibold text-sg3">
                        {x.west} · {x.dates}
                      </span>
                    </span>
                  </div>
                  <p lang="en" className="m-0 font-sans text-[14.5px] leading-[1.6] text-em1">
                    {p.short}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2.5">
                    <Dots
                      n={p.overall}
                      label={t("overall", { n: p.overall })}
                      on="#D9B96A"
                      ring="rgba(217,185,106,.6)"
                    />
                    <Link
                      href={rashiHref(x.key, per)}
                      className="inline-flex min-h-11 items-center gap-1.5 font-sans text-[13.5px] leading-none font-bold text-g1 no-underline"
                    >
                      {t("hero.readFull")}
                      <Icon name="arrowR" className="size-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div aria-hidden="true" className="mt-2.5 flex justify-center gap-1.5">
            {RASHI.map((x) => {
              const on = x.i === cyc.idx;
              return (
                <span
                  key={x.key}
                  className={cn(
                    "h-[5px] rounded-pill transition-[width,background-color] duration-300",
                    on ? "w-[18px] bg-g3" : "w-[5px] bg-[rgba(217,185,106,.35)]",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
