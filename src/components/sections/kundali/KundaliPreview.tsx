"use client";
import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/icons/Icon";
import { drawIn } from "@/components/motion/fx";
import { drawChart, onView, prime } from "@/components/motion/draw";
import { rich } from "@/components/sections/consult/ui";
import { KundaliChart } from "@/components/signature/KundaliChart";
import { RashiGlyph } from "@/components/signature/RashiGlyph";
import { InlineArt } from "@/components/ui/InlineArt";
import type { Kundali } from "@/lib/astro/kundali";
import { RASHI } from "@/lib/astro/rashi";
import { REPORT_PAGE_K99_SVG } from "@/lib/art/report-pages";
import { fmt } from "@/lib/core/format";
import { serviceHref } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { K99_MRP, K99_OFF, K99_PAGES } from "./k99-data";
import { UNDERLINE_LINK } from "./ui";

/* Kundali ₹99 free preview (Kundali-99.dc.html 166–259), shown once a chart exists.
   Heading + birth line (+ the noon note when the time is unknown); the night Lagna chart, drawn
   when 25% visible (S12: lines 1200 ms, then planets pop); Lagna / Rashi / Nakshatra cards; the
   planet table (Nakshatra column from 1024, a sub-line below); "Inside the full report": 6 pages,
   2 / 3 (600) / 6 (1024) per row, pages 2–6 blurred with a lock until paid (filter 800 ms).
   Unpaid: the emerald unlock band. Paid: the sand "ready" band (ring 900 ms +100, tick 480 ms +820). */

type Props = {
  K: Kundali;
  name: string;
  /** Report language (Devanagari chart labels for Hindi). */
  hiReport: boolean;
  unknown: boolean;
  birthLine: string;
  done: boolean;
  phoneMask: string;
  onPay: () => void;
  onDownload: () => void;
};

const EYE = "font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] uppercase hi:tracking-normal";
const COLS =
  "grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_48px_64px] gap-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_56px_72px_minmax(0,1.25fr)]";
const TH = "font-sans text-[10.5px] leading-[1.2] font-bold tracking-[.14em] text-g7 uppercase hi:tracking-normal";

export function KundaliPreview({ K, name, hiReport, unknown, birthLine, done, phoneMask, onPay, onDownload }: Props) {
  const t = useTranslations("k99.preview");
  const chartRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLSpanElement>(null);
  const first = name.trim().split(/\s+/)[0] || "";
  const kkey = `${K.lagna}|${K.planets.map((p) => `${p.sign}:${p.house}`).join(",")}|${hiReport}`;

  // S12: prime before paint, draw once a quarter of the chart is visible; again for a new chart.
  useLayoutEffect(() => {
    const el = chartRef.current;
    prime(el);
    return onView(el, () => drawChart(el, { dur: 1200 }), 0.25);
  }, [kkey]);

  useLayoutEffect(() => {
    if (!done) return;
    const ps = okRef.current?.querySelectorAll<SVGElement>("[data-draw]");
    if (!ps) return;
    drawIn(ps[0] ?? null, 900, 100);
    drawIn(ps[1] ?? null, 480, 820);
  }, [done]);

  const trio = [
    { k: t("lagna"), r: RASHI[K.lagna], sub: t("rising", { deg: K.lagnaDeg }) },
    { k: t("rashi"), r: RASHI[K.rashi], sub: t("lord", { lord: RASHI[K.rashi].lordHi }) },
    { k: t("nak"), r: null, v: K.nak, sub: t("pada", { n: K.pada }) },
  ];
  const unlock = [
    t("unlock.pdf", { lang: t(hiReport ? "unlock.hindi" : "unlock.english") }),
    ...(t.raw("unlock.items") as string[]),
  ];
  const pages = REPORT_PAGE_K99_SVG as Record<string, string>;

  return (
    <section id="preview" data-screen-label="Kundali preview" className="scroll-mt-[60px] bg-iv">
      <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(64px,8vw,112px)]">
        <div className="mb-[clamp(24px,3vw,36px)] flex flex-col gap-2.5">
          <span className={cn(EYE, "text-g7")}>{t.rich("eyebrow", rich())}</span>
          <h2
            lang="en"
            className="m-0 font-display text-[clamp(32px,4vw,52px)] leading-[1.06] font-normal tracking-[-.018em] text-balance text-em9 font-soft"
          >
            {first ? t("title", { name: first }) : t("titleAnon")}
          </h2>
          <span className="font-sans text-[13.5px] leading-[1.4] font-semibold text-ink6 tabular">{birthLine}</span>
        </div>

        {unknown && (
          <div
            role="note"
            className="mb-6 grid grid-cols-[22px_minmax(0,1fr)] gap-3 rounded-btn bg-s1 px-4 py-3.5 font-sans text-[14px] leading-[1.55] font-medium text-ink shadow-[inset_0_0_0_1px_rgba(184,146,58,.45)]"
          >
            <span className="block size-5 text-g7">
              <Icon name="info" />
            </span>
            {t("noon")}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-[clamp(24px,4vw,56px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <figure className="m-0 flex flex-col gap-3">
            <div
              ref={chartRef}
              className="relative aspect-square rounded-btn bg-n9 p-[7%] shadow-[0_36px_60px_-36px_rgba(10,31,26,.7),inset_0_0_0_1px_rgba(217,185,106,.4)]"
            >
              <KundaliChart key={kkey} K={K} fs={15} hi={hiReport} label={t("chartAria")} />
            </div>
            <figcaption className="flex justify-between gap-3 font-sans text-[12.5px] leading-[1.4] font-semibold text-ink6">
              <span>{t("cap1")}</span>
              <span>{t("cap2")}</span>
            </figcaption>
          </figure>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="grid grid-cols-1 gap-2.5 min-[560px]:grid-cols-3">
              {trio.map((x) => (
                <div
                  key={x.k}
                  data-reveal="0"
                  className="flex flex-col gap-2 rounded-btn bg-cream p-4 shadow-[inset_0_0_0_1px_#EAE0CA]"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-sans text-[10.5px] leading-[1.3] font-bold tracking-[.14em] text-g7 uppercase hi:tracking-normal">
                      {x.k}
                    </span>
                    <span className="block size-[26px]">
                      {x.r ? <RashiGlyph k={x.r.key} col="#B8923A" sw={1.3} /> : <Icon name="star" sw={1.3} />}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span lang="en" className="font-display text-[23px] leading-[1.15] text-em9">
                      {x.r ? x.r.en : x.v}
                    </span>
                    {x.r && (
                      <span lang="hi" className="font-deva text-[17px] leading-[1.3] text-g7">
                        {x.r.hi}
                      </span>
                    )}
                  </span>
                  <span className="font-sans text-[12.5px] leading-[1.3] font-semibold text-ink6 tabular">{x.sub}</span>
                </div>
              ))}
            </div>

            <div
              role="table"
              aria-label={t("tableAria")}
              className="overflow-hidden rounded-btn bg-cream shadow-[inset_0_0_0_1px_#EAE0CA] tabular"
            >
              <div role="row" className={cn(COLS, "bg-s1 px-3.5 py-3")}>
                <span role="columnheader" className={TH}>
                  {t("th.graha")}
                </span>
                <span role="columnheader" className={TH}>
                  {t("th.sign")}
                </span>
                <span role="columnheader" className={TH}>
                  {t("th.house")}
                </span>
                <span role="columnheader" className={TH}>
                  {t("th.degree")}
                </span>
                <span role="columnheader" className={cn(TH, "hidden lg:block")}>
                  {t("th.nak")}
                </span>
              </div>
              {K.planets.map((p, i) => (
                <div
                  key={p.k}
                  role="row"
                  className={cn(COLS, "items-center border-t border-s2 px-3.5 py-2.5")}
                  style={{ backgroundColor: i % 2 ? "transparent" : "rgba(244,237,221,.55)" }}
                >
                  <span role="rowheader" className="flex min-w-0 flex-col gap-[3px]">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span lang="en" className="font-sans text-[14.5px] leading-[1.2] font-bold text-em9">
                        {p.en}
                      </span>
                      <span lang="hi" className="font-deva text-[14px] leading-[1.2] text-g7">
                        {p.dev}
                      </span>
                      {p.retro && (
                        <span
                          title={t("retro")}
                          className="inline-flex h-[18px] items-center rounded-pill bg-em1 px-1.5 font-sans text-[10px] leading-none font-bold text-em9"
                        >
                          R<span className="sr-only"> ({t("retro")})</span>
                        </span>
                      )}
                    </span>
                    <span className="font-sans text-[12px] leading-[1.2] font-medium text-ink6 lg:hidden">{p.nak}</span>
                  </span>
                  <span role="cell" className="flex min-w-0 flex-col gap-0.5">
                    <span lang="en" className="font-sans text-[14px] leading-[1.2] font-semibold text-ink">
                      {RASHI[p.sign].en}
                    </span>
                    <span lang="hi" className="font-deva text-[13px] leading-[1.2] text-ink6">
                      {RASHI[p.sign].hi}
                    </span>
                  </span>
                  <span role="cell" className="font-sans text-[14px] leading-none font-bold text-em9">
                    {p.house}
                  </span>
                  <span role="cell" className="font-sans text-[13.5px] leading-none font-semibold text-ink">
                    {p.degS}
                  </span>
                  <span role="cell" className="hidden font-sans text-[13.5px] leading-[1.3] font-medium text-ink lg:block">
                    {p.nak}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[clamp(40px,6vw,72px)] mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2.5">
          <span lang="en" className="font-display text-[clamp(24px,2.6vw,32px)] leading-[1.15] text-em9">
            {t("insideTitle")}
          </span>
          <span className="font-sans text-[13px] leading-[1.4] font-semibold text-ink6">{t("insideNote")}</span>
        </div>
        <div className="grid grid-cols-2 gap-[clamp(12px,2vw,20px)] min-[600px]:grid-cols-3 lg:grid-cols-6">
          {K99_PAGES.map((p, i) => {
            const locked = !done && i > 0;
            return (
              <figure key={p.n} className="m-0 flex flex-col gap-2.5">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-3 bg-[#FFFDF7] shadow-[0_20px_40px_-26px_rgba(14,59,48,.5),0_0_0_1px_#EAE0CA]">
                  <span
                    className="absolute inset-0 block scale-[1.04] transition-[filter] duration-800 ease-mka"
                    style={{ filter: locked ? "blur(4.5px) saturate(.8)" : "none" }}
                  >
                    <InlineArt svg={pages[`lk${i}`]} uid={`lk${i}`} />
                    {i === 0 && (
                      <svg
                        viewBox="0 0 300 400"
                        width="100%"
                        height="100%"
                        aria-hidden="true"
                        className="absolute inset-0 block"
                      >
                        <text
                          x="150"
                          y="262"
                          textAnchor="middle"
                          fontFamily="Manrope,sans-serif"
                          fontSize="11"
                          fontWeight="700"
                          letterSpacing="1.6"
                          fill="#1F2A24"
                        >
                          {name.trim().toUpperCase().slice(0, 22)}
                        </text>
                      </svg>
                    )}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 grid place-items-center transition-opacity duration-500"
                    style={{ opacity: locked ? 1 : 0 }}
                  >
                    <span className="grid size-11 place-items-center rounded-pill bg-em9 text-g3 shadow-[0_10px_24px_-10px_rgba(10,31,26,.6),inset_0_0_0_1px_rgba(217,185,106,.5)]">
                      <span className="block size-5">
                        <Icon name="lock" />
                      </span>
                    </span>
                  </span>
                </span>
                <figcaption
                  lang="en"
                  className="flex items-baseline gap-2 font-sans text-[13px] leading-[1.35] font-semibold text-ink"
                >
                  <span className="font-display text-[13.5px] leading-none font-normal text-g7 italic">{p.n}</span>
                  {p.cap}
                  {locked && <span className="sr-only"> ({t("locked")})</span>}
                </figcaption>
              </figure>
            );
          })}
        </div>

        {!done ? (
          <div className="relative mt-[clamp(28px,4vw,44px)] grid grid-cols-1 items-center gap-x-12 gap-y-6 overflow-hidden rounded-btn bg-em9 p-[clamp(22px,3.5vw,40px)] text-em1 shadow-[inset_0_0_0_1px_rgba(217,185,106,.5)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)]">
            <div className="flex min-w-0 flex-col gap-3.5">
              <span className={cn(EYE, "text-g3")}>{t("unlock.eyebrow")}</span>
              <span
                lang="en"
                className="font-display text-[clamp(26px,3vw,38px)] leading-[1.1] tracking-[-.015em] text-iv font-soft"
              >
                {t.rich("unlock.title", rich("text-g3"))}
              </span>
              <ul className="m-0 mt-1 grid list-none grid-cols-1 gap-x-6 gap-y-2.5 p-0 min-[420px]:grid-cols-2">
                {unlock.map((u, i) => (
                  <li
                    key={i}
                    className="grid grid-cols-[18px_minmax(0,1fr)] gap-2.5 font-sans text-[14.5px] leading-[1.5] font-medium text-em1"
                  >
                    <span className="mt-0.5 block size-[18px] text-g3">
                      <Icon name="check" />
                    </span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                <span className="font-sans text-[40px] leading-none font-bold text-iv tabular">₹99</span>
                <span className="font-sans text-[16px] leading-none font-medium text-sg5 line-through">
                  {fmt(K99_MRP)}
                </span>
                <span className="font-sans text-[12px] leading-none font-bold tracking-[.06em] text-g3">
                  {t("unlock.save", { n: K99_OFF })}
                </span>
              </span>
              <button
                type="button"
                onClick={onPay}
                className="flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-g3 px-6 font-sans text-[15.5px] leading-none font-bold tracking-[.02em] text-n9 transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-g4"
              >
                <span className="block size-[18px]">
                  <Icon name="lock" />
                </span>
                {t("unlock.cta")}
              </button>
              <span className="font-sans text-[12.5px] leading-[1.5] font-medium text-sg3">{t("unlock.note")}</span>
            </div>
          </div>
        ) : (
          <div className="mt-[clamp(28px,4vw,44px)] grid grid-cols-1 items-center gap-x-12 gap-y-6 rounded-btn bg-s1 p-[clamp(22px,3.5vw,40px)] shadow-[inset_0_0_0_1px_rgba(184,146,58,.55)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,.7fr)]">
            <div className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] items-center gap-[18px]">
              <span ref={okRef} className="block size-[72px]">
                <svg viewBox="0 0 72 72" width="100%" height="100%" fill="none" aria-hidden="true">
                  <circle
                    cx="36"
                    cy="36"
                    r="33"
                    stroke="#B8923A"
                    strokeWidth="1.5"
                    pathLength={1}
                    data-draw=""
                    transform="rotate(-90 36 36)"
                    style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                  />
                  <path
                    d="M23 37l9 9 17-20"
                    stroke="#164E3F"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    data-draw=""
                    style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                  />
                </svg>
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className={cn(EYE, "text-g7")}>{t("done.eyebrow")}</span>
                <span lang="en" className="font-display text-[clamp(26px,3vw,36px)] leading-[1.1] text-em9">
                  {t.rich("done.title", rich())}
                </span>
                <span className="font-sans text-[14.5px] leading-[1.55] font-medium text-ink6">
                  {t("done.line", { phone: phoneMask })}
                </span>
              </span>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              <button
                type="button"
                onClick={onDownload}
                className="flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-btn border-none bg-em7 px-6 font-sans text-[15.5px] leading-none font-semibold text-iv shadow-[inset_0_0_0_1px_rgba(217,185,106,.55)] hover:bg-em5"
              >
                <span className="block size-[18px]">
                  <Icon name="download" />
                </span>
                {t("done.download")}
              </button>
              <Link href={serviceHref("kundali")} className={UNDERLINE_LINK}>
                {t("done.reading")}
                <span className="block size-[15px] flex-none">
                  <Icon name="arrowR" />
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
