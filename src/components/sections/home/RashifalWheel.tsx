"use client";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { MaskLine, MaskText } from "@/components/motion/MaskText";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { WheelLayers } from "@/components/signature/RashiWheel";
import { useRashiCycle } from "@/components/signature/useRashiCycle";
import { AREAS, predict, type Area } from "@/lib/astro/predict";
import { RASHI, todayRashi } from "@/lib/astro/rashi";
import { dlong } from "@/lib/core/dates";
import { useIsMobile } from "@/lib/hooks/useMedia";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { rashiHref, routes } from "@/lib/routes";
import { rovingTarget } from "@/lib/utils/roving";
import { cn } from "@/lib/utils/cn";

/* §6 interactive part (Home.dc.html 350–434, vRashi 1163–1187, S8).
   ≥768: the wheel (click a rashi, prev / pause / next, ←/→ on the controls) beside the reading
   panel (Today / Week / Month tabs, 4 meters, lucky trio, gemstone, remedy, CTAs). The panel
   fades .15 → 1 over 300 ms whenever the rashi or the period changes.
   <768: a half-dial peeking over a snap rail of 12 cards; swiping the rail turns the dial.
   Both layouts are in the DOM (CSS picks one); useRashiCycle drives whichever is visible.
   Dates: the HTML carries the build date; after hydration the viewer's today takes over. */

export type RashiStone = { name: string; href: string } | null;
type Per = "today" | "week" | "month";
const PERS: Per[] = ["today", "week", "month"];

const noop = () => () => {};
const dayStart = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);

function Dots({ n, label }: { n: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "size-[7px] rounded-pill shadow-[inset_0_0_0_1px_rgba(217,185,106,.6)]",
            i <= n ? "bg-g3" : "bg-transparent",
          )}
        />
      ))}
    </span>
  );
}

const ctrlCls =
  "grid size-11 cursor-pointer place-items-center rounded-pill border-0 bg-transparent text-g3 shadow-[inset_0_0_0_1px_rgba(217,185,106,.45)] hover:bg-[rgba(217,185,106,.1)]";

export function RashifalWheel({ buildNow, stones }: { buildNow: number; stones: Record<string, RashiStone> }) {
  const t = useTranslations("home.rashi");
  const mobile = useIsMobile();
  const day = useSyncExternalStore(
    noop,
    () => dayStart(Date.now()),
    () => dayStart(buildNow),
  );
  const cyc = useRashiCycle(todayRashi(day).i, mobile);
  const { refs } = cyc;
  const [per, setPer] = useState<Per>("today");
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const first = useRef(true);

  const r = RASHI[cyc.idx];
  const pr = predict(r, per, day);
  const stone = stones[r.key];

  // Panel fade .15 → 1 (300 ms, ease-out) on rashi / period change.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!panelRef.current || isReduced()) return;
    panelRef.current.animate([{ opacity: 0.15 }, { opacity: 1 }], { duration: 300, easing: "ease-out" });
  }, [cyc.idx, per]);

  const pickPer = (k: Per) => {
    cyc.hold();
    setPer(k);
  };

  const onTabsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const to = rovingTarget(e.key, PERS.indexOf(per), PERS.length);
    if (to < 0) return;
    e.preventDefault();
    tabRefs.current[to]?.focus();
    pickPer(PERS[to]);
  };

  const onCtrlKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      cyc.prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      cyc.next();
    }
  };

  const em = (c: ReactNode) => <em className="text-g3 italic">{c}</em>;
  const areaLabel = (k: Area) => t(`areas.${k}`);

  return (
    <>
      <div className="mb-[clamp(24px,4vw,56px)] flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <MaskText className="flex max-w-[720px] flex-col gap-3">
          <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase">
            {t.rich("eyebrow", {
              d: (c) => (
                <span lang="hi" className="font-hi text-[1.12em] font-medium tracking-normal normal-case">
                  {c}
                </span>
              ),
            })}
          </span>
          <h2 className="m-0 font-display text-[clamp(34px,4.4vw,60px)] leading-[1.05] font-normal tracking-[-.02em] text-iv font-soft">
            <MaskLine>{t("l1")}</MaskLine>
            <MaskLine>{t.rich("l2", { em })}</MaskLine>
          </h2>
        </MaskText>
        <div className="flex max-w-[340px] flex-col gap-1.5">
          <span className="font-sans text-[15px] leading-[1.3] font-semibold text-iv">{dlong(new Date(day))}</span>
          <span className="font-sans text-[13.5px] leading-[1.55] font-medium text-sg3">{t("intro")}</span>
        </div>
      </div>

      {/* ≥768: wheel + panel */}
      <div className="grid grid-cols-1 items-center gap-[clamp(32px,5vw,88px)] max-md:hidden w900:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
        <div className="relative min-w-0">
          <div
            ref={refs.wheelEl}
            role="group"
            aria-label={t("wheelAria")}
            onMouseEnter={cyc.hold}
            onClick={cyc.onWheelClick}
            className="relative mx-auto aspect-square w-full max-w-[460px] cursor-pointer w900:max-w-[560px]"
          >
            <span
              aria-hidden="true"
              className="absolute inset-[8%] rounded-pill bg-[radial-gradient(closest-side,rgba(217,185,106,.14),rgba(217,185,106,0))]"
            />
            <WheelLayers ringRef={refs.wheelRing} uid="hm-w" />
          </div>
          <div onKeyDown={onCtrlKey} onFocus={cyc.hold} className="mt-4 flex justify-center gap-2.5">
            <button type="button" onClick={cyc.prev} aria-label={t("prev")} className={ctrlCls}>
              <Icon name="chevL" className="size-[18px]" />
            </button>
            <button
              type="button"
              onClick={cyc.toggle}
              aria-label={cyc.playing ? t("pause") : t("resume")}
              className={ctrlCls}
            >
              <Icon name={cyc.playing ? "pause" : "play"} className="size-4" />
            </button>
            <button type="button" onClick={cyc.next} aria-label={t("next")} className={ctrlCls}>
              <Icon name="chevR" className="size-[18px]" />
            </button>
          </div>
        </div>

        <div ref={panelRef} aria-live="polite" onFocus={cyc.hold} className="flex min-w-0 flex-col gap-[18px]">
          <div
            role="tablist"
            aria-label={t("periodAria")}
            onKeyDown={onTabsKey}
            className="inline-flex gap-1 self-start rounded-btn bg-n8 p-1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.25)]"
          >
            {PERS.map((k, i) => {
              const on = per === k;
              return (
                <button
                  key={k}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => pickPer(k)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-[7px] rounded-field border-0 px-4 font-sans text-[13px] leading-none font-semibold transition-[background-color,color] duration-200",
                    on ? "bg-g3 text-n9" : "bg-transparent text-em1",
                  )}
                >
                  {t(`tabs.${k}`)}
                  <span
                    lang="hi"
                    className={cn("font-hi text-[13px] leading-none font-medium", on ? "text-em9" : "text-g3")}
                  >
                    {t(`tabsDeva.${k}`)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-4">
            <span className="grid size-[68px] place-items-center rounded-pill bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]">
              <span className="block size-9">
                <RashiGlyph k={r.key} col="#F6E7BC" sw={1.3} />
              </span>
            </span>
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-[clamp(32px,3.4vw,44px)] leading-none text-iv font-soft">
                  {r.en}
                </span>
                <span lang="hi" className="font-deva text-[clamp(24px,2.4vw,30px)] leading-[1.25] text-g3">
                  {r.hi}
                </span>
              </span>
              <span className="font-sans text-[13px] leading-[1.3] font-semibold text-sg3">
                {t("meta", { west: r.west, dates: r.dates, lordHi: r.lordHi, lord: r.lord })}
              </span>
            </span>
          </div>

          <p className="m-0 max-w-[560px] font-sans text-[17px] leading-[1.7] text-pretty text-em1">{pr.text}</p>

          <div className="grid max-w-[520px] grid-cols-2 gap-x-6">
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
                <Dots n={pr.meters[k]} label={t("meterAria", { area: areaLabel(k), n: pr.meters[k] })} />
              </span>
            ))}
          </div>

          <dl className="m-0 grid max-w-[560px] grid-cols-3 gap-3 rounded-btn bg-n8 p-4 shadow-[inset_0_0_0_1px_rgba(217,185,106,.3)]">
            <div className="flex flex-col gap-1.5">
              <dt className="font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase">
                {t("lucky")}
              </dt>
              <dd className="m-0 font-display text-[26px] leading-none text-iv">{pr.luckyNum}</dd>
            </div>
            <div className="flex flex-col gap-1.5">
              <dt className="font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase">
                {t("colour")}
              </dt>
              <dd className="m-0 flex items-center gap-2 font-sans text-[13.5px] leading-[1.25] font-semibold text-iv">
                <span
                  className="size-4 flex-none rounded-pill shadow-[0_0_0_1px_rgba(217,185,106,.6)]"
                  style={{ backgroundColor: r.hex }}
                />
                {r.colour}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <dt className="font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase">
                {t("gemstone")}
              </dt>
              <dd className="m-0">
                <Link
                  href={stone ? stone.href : routes.shop}
                  className="font-sans text-[13.5px] leading-[1.25] font-semibold text-g1 underline decoration-[rgba(217,185,106,.6)] underline-offset-[3px] hover:text-iv"
                >
                  {stone ? stone.name : t("seeGems")}
                </Link>
              </dd>
            </div>
          </dl>

          <div className="grid max-w-[560px] grid-cols-[22px_minmax(0,1fr)] gap-3">
            <span className="block size-[22px] text-g3">
              <Icon name="diya" />
            </span>
            <span className="flex flex-col gap-1">
              <span className="font-sans text-[10.5px] leading-[1.2] font-semibold tracking-[.14em] text-g3 uppercase">
                {t("remedy")}
              </span>
              <span className="font-sans text-[15px] leading-[1.6] text-pretty text-em1">{r.remedy}</span>
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-2.5">
            <Link
              href={rashiHref(r.key, per)}
              className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-g3 px-[22px] font-sans text-[14.5px] leading-none font-bold text-n9 no-underline transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-g4 hover:text-n9"
            >
              {t("full")}
              <Icon name="arrowR" className="size-4" />
            </Link>
            <Link
              href={routes.kundali99}
              className="inline-flex h-[50px] items-center gap-[9px] rounded-btn px-5 font-sans text-[14.5px] leading-none font-semibold text-g1 no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.6)] hover:bg-[rgba(217,185,106,.1)] hover:text-iv"
            >
              <Icon name="kundali" className="size-[17px]" />
              {t("kundali")}
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
            <WheelLayers ringRef={refs.dialRing} uid="hm-d" />
          </div>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-11 bg-[linear-gradient(rgba(10,31,26,0),#0A1F1A)]"
          />
        </div>
        <div
          ref={refs.railEl}
          onScroll={cyc.onRail}
          onTouchStart={cyc.hold}
          role="region"
          aria-label={t("railAria")}
          className="-mx-4 no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12vw] pt-1 pb-2"
        >
          {RASHI.map((x) => {
            const p = predict(x, "today", day);
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
                      <span className="font-display text-[23px] leading-none text-iv">{x.en}</span>
                      <span lang="hi" className="font-deva text-[18px] leading-[1.25] text-g3">
                        {x.hi}
                      </span>
                    </span>
                    <span className="font-sans text-[12px] leading-[1.2] font-semibold text-sg3">
                      {x.west} · {x.dates}
                    </span>
                  </span>
                </div>
                <p className="m-0 font-sans text-[15px] leading-[1.6] text-em1">{p.short}</p>
                <div className="mt-auto flex items-center justify-between gap-2.5">
                  <Dots n={p.overall} label={t("overall", { n: p.overall })} />
                  <Link
                    href={rashiHref(x.key, "today")}
                    className="inline-flex min-h-11 items-center gap-1.5 font-sans text-[13.5px] leading-none font-bold text-g1 no-underline"
                  >
                    {t("readFull")}
                    <Icon name="arrowR" className="size-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <div aria-hidden="true" className="mt-3 flex justify-center gap-1.5">
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
        <Link
          href={routes.kundali99}
          className="mt-[22px] flex h-[52px] items-center justify-center gap-[9px] rounded-btn font-sans text-[15px] leading-none font-semibold text-g1 no-underline shadow-[inset_0_0_0_1px_rgba(217,185,106,.6)]"
        >
          <Icon name="kundali" className="size-[17px]" />
          {t("kundali")}
        </Link>
      </div>
    </>
  );
}
