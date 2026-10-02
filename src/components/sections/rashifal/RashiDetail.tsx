"use client";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Icon, type IconName } from "@/components/icons/Icon";
import { EASE } from "@/components/motion/easing";
import { drawChart, onView, prime } from "@/components/motion/draw";
import { KundaliChart } from "@/components/signature/KundaliChart";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { Starfield } from "@/components/signature/Starfield";
import { EYEBROW, rich } from "@/components/sections/consult/ui";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { DEMO_K } from "@/lib/astro/kundali";
import { AREAS, PERIODS, periodDate, predict } from "@/lib/astro/predict";
import { compatible, RASHI, type Rashi } from "@/lib/astro/rashi";
import { isReduced } from "@/lib/hooks/useReducedMotion";
import { rashiHref, routes } from "@/lib/routes";
import { rovingTarget } from "@/lib/utils/roving";
import { cn } from "@/lib/utils/cn";
import { loc } from "@/lib/domain/loc";
import { useRashifal as useRashifalData } from "@/lib/hooks/useRashifal";
import type { Product } from "@/types/product";
import { useRashifal } from "./period";
import { brass, H2, NightCrumbs } from "./ui";

/* Period-dependent parts of the rashi page (Rashi-Detail.dc.html 31–152, renderVals 189–218):
   the hero (tabs rewrite `?p=` in place; the reading fades up 6px over 320 ms on a change),
   area meters, lucky trio + gemstone card, and the compatible rashis (links keep the period).
   All read `useRashifal()`, so they must sit inside <RashifalProvider>. */

const DT = "font-sans text-[10px] leading-[1.2] font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal";

/** §1 Hero (31–62). Night; the arch (mandala spin 180 s, big glyph, Devanagari name) beside the copy. */
export function RashiHero({ r }: { r: Rashi }) {
  const t = useTranslations("rashifal");
  const locale = useLocale();
  const { per, setPer, day } = useRashifal();
  const { entries } = useRashifalData(per);
  const pr = predict(r, per, day);
  const entry = entries.get(r.key);
  const entryText = entry ? loc(entry.text, locale) : "";
  const readingText = entryText || pr.text;
  const overall = entry?.scores
    ? Math.round(
        (entry.scores.love +
          entry.scores.career +
          entry.scores.health +
          entry.scores.finance) /
          4,
      )
    : pr.overall;
  const textRef = useRef<HTMLParagraphElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastPer = useRef(per);
  const keys = PERIODS.map(([k]) => k);
  const prevR = RASHI[(r.i + 11) % 12];
  const nextR = RASHI[(r.i + 1) % 12];

  useEffect(() => {
    if (lastPer.current === per) return;
    lastPer.current = per;
    if (!textRef.current || isReduced()) return;
    textRef.current.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 320, easing: EASE },
    );
  }, [per]);

  const onTabsKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const to = rovingTarget(e.key, keys.indexOf(per), keys.length);
    if (to < 0) return;
    e.preventDefault();
    tabRefs.current[to]?.focus();
    setPer(keys[to]);
  };

  const facts: { k: string; v: ReactNode }[] = [
    { k: t("detail.lord"), v: `${r.lordHi} · ${r.lord}` },
    { k: t("detail.element"), v: `${r.el} · ${r.elHi}` },
    { k: t("detail.day"), v: r.day },
    { k: t("detail.overall"), v: t("detail.ofFive", { n: overall }) },
  ];

  return (
    <section data-screen-label="Rashi hero" className="relative overflow-hidden bg-n9 text-em1">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Starfield seed="rd-sky" n={28} nMob={16} h={800} />
      </div>
      <div className="relative mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(20px,4vw,48px)] pb-[clamp(48px,7vw,96px)]">
        <NightCrumbs
          label={t("crumbsAria")}
          className="mb-[clamp(20px,3vw,36px)]"
          items={[{ href: routes.home, t: t("home") }, { href: routes.rashifal, t: t("here") }, { t: r.en }]}
        />
        <div className="grid grid-cols-1 items-center gap-[clamp(28px,5vw,80px)] w900:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
          <div className="relative w-full max-w-[260px] justify-self-center md:max-w-[400px]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-2.5 rounded-[50%_50%_6px_6px/38%_38%_6px_6px] shadow-[inset_0_0_0_1px_rgba(217,185,106,.4)]"
            />
            <div className="relative aspect-[5/6] overflow-hidden rounded-[50%_50%_4px_4px/38%_38%_4px_4px] bg-n8 shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)]">
              <span
                aria-hidden="true"
                data-amb="spin:180"
                className="absolute top-[4%] right-[-10%] left-[-10%] block aspect-square opacity-[.16]"
              >
                <svg viewBox="-300 -300 600 600" width="100%" height="100%" className="block">
                  <MandalaG R={296} col="#D9B96A" sw={1} />
                </svg>
              </span>
              <span className="absolute top-[24%] right-[24%] left-[24%] block aspect-square">
                <RashiGlyph k={r.key} col="#D9B96A" sw={0.6} />
              </span>
              <span className="absolute inset-x-0 bottom-[9%] flex flex-col items-center gap-1.5 text-center">
                <span lang="hi" className="font-deva text-[32px] leading-[1.2] text-g3">
                  {r.hi}
                </span>
                <span className="font-sans text-[10.5px] leading-none font-semibold tracking-[.16em] text-sg3 uppercase">
                  {r.west} · {r.dates}
                </span>
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-[18px]">
            <span className={cn(EYEBROW, "text-g3")}>
              {t.rich("detail.eyebrow", { ...rich("text-g3"), name: r.en, hiName: r.hi })}
            </span>
            <h1
              lang="en"
              className="m-0 font-display text-[clamp(44px,6vw,84px)] leading-none font-normal tracking-[-.024em] text-iv font-soft"
            >
              {r.en}, <em className="text-g3 italic">{t(`detail.span.${per}`)}</em>
            </h1>
            <div
              role="tablist"
              aria-label={t("detail.tabsAria")}
              onKeyDown={onTabsKey}
              className="no-scrollbar flex gap-1.5 overflow-x-auto py-0.5"
            >
              {PERIODS.map(([k], i) => {
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
                    aria-controls="rd-reading"
                    tabIndex={sel ? 0 : -1}
                    onClick={() => setPer(k)}
                    className={cn(
                      "h-11 flex-none cursor-pointer rounded-pill border-0 px-4 font-sans text-[13.5px] leading-none font-semibold transition-[background-color,color] duration-200",
                      sel ? "bg-g3 text-n9" : "bg-transparent text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.4)]",
                    )}
                  >
                    {t(`periods.${k}`)}
                  </button>
                );
              })}
            </div>
            <div id="rd-reading" role="tabpanel" aria-label={t(`periods.${per}`)} className="flex flex-col gap-[18px]">
              <span className="font-sans text-[13px] leading-[1.4] font-semibold text-sg3 tabular-nums">
                {t(`periods.${per}`)} · {periodDate(per, day)}
              </span>
              <p
                ref={textRef}
                lang="en"
                className="m-0 max-w-[600px] font-sans text-[clamp(17px,1.5vw,19px)] leading-[1.7] text-pretty text-em1"
              >
                {readingText}
              </p>
            </div>
            <dl className="m-0 flex flex-wrap gap-x-7 gap-y-2.5 border-t border-[rgba(217,185,106,.25)] pt-4">
              {facts.map((x) => (
                <div key={x.k} className="flex flex-col gap-1.5">
                  <dt className={DT}>{x.k}</dt>
                  <dd className="m-0 font-sans text-[14.5px] leading-[1.3] font-semibold text-iv">{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <Link
                href={rashiHref(prevR.key, per)}
                aria-label={t("detail.prevAria", { name: prevR.en })}
                className="inline-flex min-h-11 items-center gap-2 font-sans text-[14px] leading-none font-semibold text-g1 no-underline hover:text-iv"
              >
                <Icon name="arrowL" className="size-4" />
                {prevR.en}
              </Link>
              <Link
                href={rashiHref(nextR.key, per)}
                aria-label={t("detail.nextAria", { name: nextR.en })}
                className="inline-flex min-h-11 items-center gap-2 font-sans text-[14px] leading-none font-semibold text-g1 no-underline hover:text-iv"
              >
                {nextR.en}
                <Icon name="arrowR" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** §2 By area (64–86). Ivory; 4 meters (1 col, 2 from 900; the number column from 560). */
export function RashiAreas({ r }: { r: Rashi }) {
  const t = useTranslations("rashifal.areas");
  const tp = useTranslations("rashifal.periods");
  const { per, day } = useRashifal();
  const { entries } = useRashifalData(per);
  const pr = predict(r, per, day);
  const entry = entries.get(r.key);
  return (
    <section data-screen-label="By area" className="bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
        <div className="mb-[clamp(28px,4vw,48px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
          <div data-reveal="0" className="flex flex-col gap-3">
            <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow", { period: tp(per) })}</span>
            <h2 lang="en" className={cn(H2, "text-[clamp(32px,3.8vw,50px)]")}>
              {t.rich("title", { em: brass })}
            </h2>
          </div>
          <span data-reveal="1" className="max-w-[420px] font-sans text-[14px] leading-[1.6] font-medium text-ink6">
            {t("note")}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-x-[clamp(24px,4vw,64px)] border-t border-s2 w900:grid-cols-2">
          {AREAS.map(([k, en, hi, icn], i) => {
            const n = entry?.scores ? entry.scores[k] : pr.meters[k];
            return (
              <article
                key={k}
                data-reveal={String(i % 2)}
                className="grid grid-cols-1 gap-x-5 gap-y-3.5 border-b border-s2 py-[clamp(20px,3vw,32px)] min-[560px]:grid-cols-[190px_minmax(0,1fr)]"
              >
                <div className="flex flex-col gap-3">
                  <span className="flex items-center gap-2.5">
                    <span className="grid size-10 place-items-center rounded-pill bg-s1 text-em7">
                      <span className="block size-5">
                        <Icon name={icn as IconName} />
                      </span>
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span lang="en" className="font-display text-[22px] leading-[1.1] text-em9">
                        {en}
                      </span>
                      <span lang="hi" className="font-deva text-[14px] leading-[1.3] text-g7">
                        {hi}
                      </span>
                    </span>
                  </span>
                  <span role="img" className="flex items-baseline gap-1.5" aria-label={t("aria", { area: en, n })}>
                    <span aria-hidden="true" className="font-display text-[44px] leading-none text-em9 tabular-nums">
                      {n}
                    </span>
                    <span aria-hidden="true" className="font-sans text-[13px] leading-none font-semibold text-ink6">
                      / 5
                    </span>
                  </span>
                  <span aria-hidden="true" className="grid max-w-[180px] grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <span key={j} className={cn("h-1.5 rounded-pill", j <= n ? "bg-g5" : "bg-s2")} />
                    ))}
                  </span>
                </div>
                <p lang="en" className="m-0 self-center font-sans text-[16px] leading-[1.7] text-pretty text-ink">
                  {pr[k]}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** §3 Lucky trio + gemstone (87–110). Sand. 2 cols, 3 from 600, 3 + the gem card (1.6fr) from 1024;
 *  below 1024 the gem card spans the row. */
export function RashiLucky({ r, gem }: { r: Rashi; gem: Product | null }) {
  const t = useTranslations("rashifal.lucky");
  const locale = useLocale();
  const { per, day } = useRashifal();
  const { entries } = useRashifalData(per);
  const pr = predict(r, per, day);
  const entry = entries.get(r.key);
  const luckyNum = entry?.lucky?.number ?? pr.luckyNum;
  const luckyColour = entry?.lucky?.colour ? loc(entry.lucky.colour, locale) : r.colour;
  const card =
    "flex min-h-[170px] flex-col justify-between gap-[18px] rounded-btn bg-iv p-5 shadow-[inset_0_0_0_1px_rgba(184,146,58,.45)]";
  const head = (k: string, kh: string) => (
    <span className="flex flex-col gap-[3px]">
      <span className="font-sans text-[10.5px] leading-[1.2] font-bold tracking-[.14em] text-g7 uppercase hi:tracking-normal">
        {k}
      </span>
      <span lang="hi" className="font-deva text-[14px] leading-[1.3] text-ink6">
        {kh}
      </span>
    </span>
  );
  return (
    <section
      data-screen-label="Lucky and gemstone"
      className="bg-s1 shadow-[inset_0_1px_0_rgba(184,146,58,.35),inset_0_-1px_0_rgba(184,146,58,.35)]"
    >
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,104px)]">
        <div data-reveal="0" className="mb-[clamp(24px,3vw,40px)] flex flex-col gap-3">
          <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow", { name: r.en })}</span>
          <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.6vw,46px)]")}>
            {t.rich("title", { em: brass })}
          </h2>
        </div>
        <div className="grid grid-cols-2 items-stretch gap-[clamp(10px,1.6vw,16px)] min-[600px]:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.6fr)]">
          <div data-reveal="1" className={card}>
            {head(t("num"), "शुभ अंक")}
            <span className="font-display text-[64px] leading-none text-em9 tabular-nums">{luckyNum}</span>
          </div>
          <div data-reveal="1" className={card}>
            {head(t("colour"), "शुभ रंग")}
            <span className="flex items-center gap-3">
              <span
                className="size-11 flex-none rounded-pill shadow-[0_0_0_1px_#B8923A,inset_0_0_0_3px_#FBF7EE]"
                style={{ backgroundColor: r.hex }}
              />
              <span lang="en" className="font-display text-[21px] leading-[1.2] text-em9">
                {luckyColour}
              </span>
            </span>
          </div>
          <div data-reveal="1" className={card}>
            {head(t("day"), "शुभ दिन")}
            <span className="flex flex-col gap-1">
              <span lang="en" className="font-display text-[28px] leading-[1.1] text-em9">
                {r.day}
              </span>
              <span lang="hi" className="font-deva text-[18px] leading-[1.3] text-g7">
                {r.dayHi}
              </span>
            </span>
          </div>
          {gem && (
            <div
              data-reveal="2"
              className="col-span-full flex flex-col gap-3 rounded-btn bg-em9 p-4 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)] lg:col-auto"
            >
              <span className="flex items-center justify-between gap-2.5 px-1 pt-1">
                <span className="flex flex-col gap-[3px]">
                  <span className="font-sans text-[10.5px] leading-[1.2] font-bold tracking-[.14em] text-g3 uppercase hi:tracking-normal">
                    {t("gem")}
                  </span>
                  <span lang="hi" className="font-deva text-[14px] leading-[1.3] text-sg3">
                    शुभ रत्न
                  </span>
                </span>
                <span className="block size-[22px] text-g3">
                  <Icon name="gem" />
                </span>
              </span>
              <ProductCard product={gem} size="row" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** §5a Compatible rashis (129–138): 2 cols, 4 from 768; links keep the period. */
export function RashiCompat({ r }: { r: Rashi }) {
  const t = useTranslations("rashifal.compat");
  const { per } = useRashifal();
  return (
    <>
      <div data-reveal="0" className="mb-[clamp(20px,3vw,32px)] flex flex-col gap-3">
        <span className={cn(EYEBROW, "text-g7")}>{t("eyebrow")}</span>
        <h2 lang="en" className={cn(H2, "text-[clamp(30px,3.6vw,46px)]")}>
          Who {r.en} <em className="text-g5 italic">moves well</em> with.
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-[clamp(10px,1.6vw,16px)] md:grid-cols-4">
        {compatible(r).map((x) => (
          <Link
            key={x.key}
            data-reveal="1"
            href={rashiHref(x.key, per)}
            className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3.5 rounded-btn bg-cream p-4 no-underline shadow-[inset_0_0_0_1px_#EAE0CA] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_#B8923A]"
          >
            <span className="grid size-12 place-items-center rounded-pill bg-s1">
              <span className="block size-[26px]">
                <RashiGlyph k={x.key} col="#B8923A" sw={1.3} />
              </span>
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span lang="en" className="font-display text-[20px] leading-[1.1] text-em9">
                  {x.en}
                </span>
                <span lang="hi" className="font-deva text-[16px] leading-[1.3] text-g7">
                  {x.hi}
                </span>
              </span>
              <span lang="en" className="font-sans text-[12.5px] leading-[1.4] font-medium text-ink6">
                {x.el === r.el
                  ? `Same element (${x.el.toLowerCase()}), so a shared pace`
                  : `${x.el} steadies ${r.el.toLowerCase()} rashis`}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

/** §6 Kundali CTA chart (165): the demo chart draws once 30% in view (S12, 1200 ms). */
export function RashiChart({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    prime(el);
    return onView(el, () => drawChart(el, { dur: 1200 }), 0.3);
  }, []);
  return (
    <div
      ref={ref}
      data-reveal="1"
      className="aspect-square w-full max-w-[400px] justify-self-center rounded-btn bg-n9 p-[7%] shadow-[0_36px_60px_-36px_rgba(10,31,26,.7),inset_0_0_0_1px_rgba(217,185,106,.4)]"
    >
      <KundaliChart K={DEMO_K} fs={15} label={label} />
    </div>
  );
}
