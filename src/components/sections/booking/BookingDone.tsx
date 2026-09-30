"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/icons/Icon";
import { drawIn } from "@/components/motion/fx";
import { Starfield } from "@/components/signature/Starfield";
import { MandalaG } from "@/components/ui/ornaments/Mandala";
import { downloadIcs, gcal, type CalEvent } from "@/lib/astro/calendar";
import { routes } from "@/lib/routes";
import { waLink } from "@/lib/site";
import { rich } from "@/components/sections/consult/ui";

/* Confirmation (Booking.dc.html 395–447). Night band: the gold check draws in (ring 1000 ms
   +150, tick 520 ms +950), "Booking MKA-B…", "Your session is booked.", the Devanagari line,
   the confirmation line, calendar buttons (Google Calendar link + .ics download, live sessions
   only) and "Message the office"; the details card on the right (≥1024). Then "What happens
   next" on ivory: the four process steps (reveal-staggered; the first is marked Done), and the
   two exits. The site footer appears below (chrome `flowFooter`). */

export function BookingDone({
  id,
  line,
  rows,
  evt,
  steps,
}: {
  id: string;
  line: string;
  rows: { k: string; v: string }[];
  /** Live sessions only; reports have no calendar event. */
  evt: CalEvent | null;
  /** Process step icons (A.STEPS). */
  steps: IconName[];
}) {
  const t = useTranslations("booking.done");
  const tc = useTranslations("consult.how");
  const texts = tc.raw("steps") as { t: string; d: string }[];

  const okRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const ps = okRef.current?.querySelectorAll<SVGElement>("[data-draw]");
    if (!ps) return;
    drawIn(ps[0] ?? null, 1000, 150);
    drawIn(ps[1] ?? null, 520, 950);
  }, []);

  return (
    <>
      <section data-screen-label="Booking confirmed" className="relative overflow-hidden bg-n9 text-em1">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute inset-0 block">
            <Starfield seed="bk-done" n={28} nMob={16} w={1440} h={640} />
          </span>
          <svg
            viewBox="0 0 1440 640"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 block"
          >
            <g transform="translate(1260 120)" opacity=".1">
              <MandalaG R={300} col="#D9B96A" sw={0.8} />
            </g>
          </svg>
        </div>
        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-[clamp(36px,5vw,80px)] px-[clamp(16px,4vw,32px)] py-[clamp(40px,7vw,104px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <span ref={okRef} className="block size-[92px]">
              <svg viewBox="0 0 92 92" width="100%" height="100%" fill="none" aria-hidden="true" className="block">
                <circle
                  cx="46"
                  cy="46"
                  r="43"
                  stroke="#D9B96A"
                  strokeWidth="1.5"
                  pathLength={1}
                  data-draw=""
                  transform="rotate(-90 46 46)"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                />
                <circle cx="46" cy="46" r="36" stroke="#D9B96A" strokeWidth=".6" opacity=".45" />
                <path
                  d="M30 47l11 11 22-25"
                  stroke="#D9B96A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  data-draw=""
                  style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                />
              </svg>
            </span>
            <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g3 uppercase tabular hi:tracking-normal">
              {t("eyebrow", { id })}
            </span>
            <h1
              lang="en"
              className="m-0 font-display text-[clamp(40px,5.4vw,72px)] leading-[1.03] font-normal tracking-[-.022em] text-balance text-iv font-soft"
            >
              {t.rich("title", rich("text-g3"))}
            </h1>
            <span lang="hi" className="font-deva text-[clamp(18px,2vw,22px)] leading-[1.35] text-g3">
              {t("deva")}
            </span>
            <p className="m-0 max-w-[520px] font-sans text-[16px] leading-[1.65] text-pretty text-sg3">{line}</p>
            <div className="mt-1.5 flex flex-wrap gap-2.5">
              {evt && (
                <>
                  <a
                    href={gcal(evt)}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-g3 px-5 font-sans text-[14.5px] leading-none font-bold text-n9 no-underline transition-transform duration-200 hover:-translate-y-px hover:text-n9"
                  >
                    <Icon name="calendar" className="size-[17px]" />
                    {t("gcal")}
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadIcs(evt, `maa-kali-astuti-${id}.ics`)}
                    className="inline-flex h-[50px] items-center gap-[9px] rounded-btn border-0 bg-transparent px-5 font-sans text-[14.5px] leading-none font-semibold text-g1 shadow-ring-g3 transition-colors duration-200 hover:bg-[rgba(217,185,106,.12)]"
                  >
                    <Icon name="download" className="size-[17px]" />
                    {t("ics")}
                  </button>
                </>
              )}
              <a
                href={waLink()}
                target="_blank"
                rel="noopener"
                className="inline-flex h-[50px] items-center gap-[9px] rounded-btn px-5 font-sans text-[14.5px] leading-none font-semibold text-em1 no-underline shadow-ring-gold-45 hover:bg-[rgba(217,185,106,.08)] hover:text-iv"
              >
                <Icon name="whatsapp" className="size-[17px]" />
                {t("wa")}
              </a>
            </div>
          </div>
          <dl className="m-0 flex flex-col rounded-btn bg-n8 p-[clamp(20px,3vw,32px)] shadow-[inset_0_0_0_1px_rgba(217,185,106,.4)]">
            {rows.map((r) => (
              <div
                key={r.k}
                className="grid grid-cols-1 gap-x-5 gap-y-1 border-b border-[rgba(217,185,106,.18)] py-3.5 min-[560px]:grid-cols-[130px_minmax(0,1fr)]"
              >
                <dt className="font-sans text-[10.5px] leading-[1.6] font-semibold tracking-[.14em] text-sg5 uppercase hi:tracking-normal">
                  {r.k}
                </dt>
                <dd className="m-0 font-sans text-[15px] leading-[1.5] font-semibold text-iv">{r.v}</dd>
              </div>
            ))}
            <span className="pt-4 font-sans text-[13px] leading-[1.55] font-medium text-sg3">{t("change")}</span>
          </dl>
        </div>
      </section>

      <section data-screen-label="What happens next" className="bg-iv">
        <div className="mx-auto max-w-[1320px] px-[clamp(16px,4vw,32px)] py-[clamp(56px,8vw,112px)]">
          <div className="mb-[clamp(32px,4vw,52px)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-x-14 gap-y-4">
            <div data-reveal="0" className="flex flex-col gap-3">
              <span className="font-sans text-[11px] leading-[1.2] font-semibold tracking-[.16em] text-g7 uppercase hi:tracking-normal">
                {t("next.eyebrow")}
              </span>
              <h2
                lang="en"
                className="m-0 font-display text-[clamp(30px,3.6vw,46px)] leading-[1.08] font-normal tracking-[-.018em] text-em9 font-soft"
              >
                {t.rich("next.title", rich())}
              </h2>
            </div>
            <p
              data-reveal="1"
              className="m-0 max-w-[460px] font-sans text-[15.5px] leading-[1.65] text-pretty text-ink6"
            >
              {t("next.body")}
            </p>
          </div>
          <ol className="m-0 grid list-none grid-cols-1 gap-x-7 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((icon, i) => (
              <li
                key={i}
                data-reveal={String(i)}
                className={`grid grid-cols-[44px_minmax(0,1fr)] gap-x-[18px] gap-y-3.5 border-t py-[22px] lg:grid-cols-[minmax(0,1fr)] ${i === 0 ? "border-g5" : "border-s2"}`}
              >
                <span
                  className={`grid size-11 place-items-center rounded-pill shadow-ring-g5-55 ${i === 0 ? "bg-em9 text-g3" : "bg-iv text-em7"}`}
                >
                  <Icon name={icon} className="size-[22px]" />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span
                    className={`font-sans text-[11px] leading-[1.2] font-bold tracking-[.14em] uppercase hi:tracking-normal ${i === 0 ? "text-ok" : "text-g7"}`}
                  >
                    {t(i === 0 ? "next.st.done" : i === 1 ? "next.st.next" : "next.st.then")}
                  </span>
                  <span lang="en" className="font-display text-[20px] leading-[1.25] font-normal text-em9">
                    {texts[i]?.t}
                  </span>
                  <span className="font-sans text-[14.5px] leading-[1.55] text-pretty text-ink6">{texts[i]?.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-[clamp(32px,4vw,48px)] flex flex-wrap gap-3">
            <Link
              href={routes.consultations}
              className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-em7 px-[22px] font-sans text-[14.5px] leading-none font-semibold text-iv no-underline shadow-ring-gold hover:bg-em5 hover:text-iv"
            >
              {t("backConsult")}
            </Link>
            <Link
              href={routes.shop}
              className="inline-flex h-[50px] items-center gap-[9px] rounded-btn bg-iv px-[22px] font-sans text-[14.5px] leading-none font-semibold text-em7 no-underline shadow-ring-em hover:bg-em1"
            >
              {t("shop")}
              <Icon name="arrowR" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
