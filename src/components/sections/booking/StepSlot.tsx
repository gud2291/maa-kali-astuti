"use client";

import { useLocale, useTranslations } from "next-intl";
import { Icon, type IconName } from "@/components/icons/Icon";
import type { ServiceKey } from "@/lib/api/consult";
import { istDate, slotsFor, t12 } from "@/lib/astro/slots";
import { addDays, dfmt, dlong, monthTitle } from "@/lib/core/dates";
import { cn } from "@/lib/utils/cn";
import { ErrorRow } from "./ui";

/* Step 3 (Booking.dc.html 235–302).
   Live sessions: a month calendar (Mon-first; tomorrow → +30 days, Sundays closed; ‹ › between
   the months in the window; a gold dot under today) next to the open times of the chosen date,
   grouped Morning / Afternoon / Evening (IST; booked times are struck through). When the
   visitor's timezone is not IST, a green note converts the chosen time.
   Written reports: the three-step delivery timeline instead (today → tomorrow → +2 days).
   Columns: side by side at 700–1023 and ≥1180 (L.slot 526), stacked otherwise. */

const TITLE = "font-title text-[21px] leading-[1.2] font-normal text-em9";

export function StepSlot({
  svc,
  needsSlot,
  mins,
  month,
  date,
  time,
  error,
  onMonth,
  onDate,
  onTime,
}: {
  svc: ServiceKey;
  needsSlot: boolean;
  mins: number;
  month: number;
  date: Date | null;
  time: string | null;
  error?: string;
  onMonth: (m: number) => void;
  onDate: (d: Date) => void;
  onTime: (t: string) => void;
}) {
  const t = useTranslations("booking.s3");
  const hi = useLocale() === "hi";

  if (!needsSlot) {
    const tl = t.raw(svc === "palm" ? "tl.palm" : "tl.other") as string[];
    const rows: [string, IconName][] = [
      [t("today"), "upload"],
      [dfmt(addDays(1), hi), "eye"],
      [dfmt(addDays(2), hi), "report"],
    ];
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 rounded-btn bg-cream p-[clamp(18px,3vw,28px)] shadow-ring-sand">
          <span className="font-sans text-[15px] leading-[1.6] font-medium text-pretty text-ink">{t("report")}</span>
          <ol className="m-0 flex list-none flex-col p-0">
            {rows.map(([when, icon], i) => {
              const last = i === rows.length - 1;
              return (
                <li
                  key={i}
                  className={cn("relative grid grid-cols-[40px_minmax(0,1fr)] gap-4", !last && "pb-[22px]")}
                >
                  {!last && (
                    <span
                      aria-hidden="true"
                      className="absolute top-10 bottom-0 left-[19.5px] w-px bg-[rgba(184,146,58,.5)]"
                    />
                  )}
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-pill shadow-ring-g5-55",
                      i === 0 ? "bg-em9 text-g3" : "bg-iv text-em7",
                    )}
                  >
                    <Icon name={icon} className="size-[18px]" />
                  </span>
                  <span className="flex flex-col gap-1 pt-0.5">
                    <span className="font-sans text-[11px] leading-[1.2] font-bold tracking-[.14em] text-g7 uppercase hi:tracking-normal">
                      {when}
                    </span>
                    <span className="font-sans text-[15px] leading-[1.5] font-medium text-ink">{tl[i]}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  /* ---- calendar (Booking 560–565) ---- */
  const today = addDays(0);
  const first = addDays(1);
  const last = addDays(30);
  const base = new Date(today.getFullYear(), today.getMonth() + month, 1, 12);
  const lead = (base.getDay() + 6) % 7;
  const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const prevDis = month === 0;
  const nextDis = new Date(base.getFullYear(), base.getMonth() + 1, 1, 12) > last;
  const dows = t.raw("dows") as string[];

  /* ---- slots (566–570) ---- */
  const list = date ? slotsFor(date, mins) : [];
  const groups = (
    [
      ["morning", (h: number) => h < 12],
      ["afternoon", (h: number) => h >= 12 && h < 16],
      ["evening", (h: number) => h >= 16],
    ] as const
  )
    .map(([k, fn]) => ({ k, items: list.filter((x) => fn(+x.t.split(":")[0])) }))
    .filter((g) => g.items.length);

  let local = "";
  let tz = "";
  if (date && time && -new Date().getTimezoneOffset() !== 330) {
    const at = istDate(date, time);
    local = at.toLocaleString(hi ? "hi-IN" : [], { weekday: "short", hour: "numeric", minute: "2-digit" });
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      tz = t("localTz");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-start gap-6 min-[700px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:grid-cols-1 nav:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="rounded-btn bg-cream p-[clamp(14px,2vw,20px)] shadow-ring-sand">
          <div className="mb-2.5 flex items-center justify-between gap-2.5">
            <span aria-live="polite" className={TITLE}>
              {monthTitle(base, hi)}
            </span>
            <span className="flex gap-1">
              {(
                [
                  ["prev", "chevL", prevDis, () => onMonth(Math.max(0, month - 1))],
                  ["next", "chevR", nextDis, () => !nextDis && onMonth(month + 1)],
                ] as const
              ).map(([k, icon, dis, go]) => (
                <button
                  key={k}
                  type="button"
                  onClick={go}
                  disabled={dis}
                  aria-label={t(k)}
                  className={cn(
                    "grid size-11 place-items-center rounded-btn border-0 bg-transparent enabled:hover:bg-s1",
                    dis ? "text-[#C9CFC9]" : "text-em7",
                  )}
                >
                  <Icon name={icon} className="size-[18px]" />
                </button>
              ))}
            </span>
          </div>
          <div
            role="group"
            aria-label={t("grid")}
            className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 text-center"
          >
            {dows.map((w) => (
              <span
                key={w}
                aria-hidden="true"
                className="py-1.5 font-sans text-[10.5px] leading-none font-bold tracking-[.1em] text-ink6 uppercase hi:tracking-normal"
              >
                {w}
              </span>
            ))}
            {Array.from({ length: lead }, (_, i) => (
              <span key={`b${i}`} aria-hidden="true" className="h-11" />
            ))}
            {Array.from({ length: dim }, (_, i) => {
              const n = i + 1;
              const dt = new Date(base.getFullYear(), base.getMonth(), n, 12);
              const ok = dt >= first && dt <= last && dt.getDay() !== 0;
              const sel = !!date && dt.toDateString() === date.toDateString();
              const isToday = dt.toDateString() === today.toDateString();
              const long = dlong(dt, hi);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onDate(dt)}
                  disabled={!ok}
                  aria-pressed={sel}
                  aria-label={ok ? long : t(dt.getDay() === 0 ? "closed" : "unavailable", { date: long })}
                  className={cn(
                    "relative h-11 rounded-btn border-0 p-0 font-sans text-[14px] leading-none font-semibold tabular transition-colors duration-200",
                    sel ? "bg-em7 text-iv" : ok ? "bg-s1 text-em9" : "bg-transparent text-[#A9B5AE]",
                  )}
                >
                  {n}
                  {isToday && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1.5 left-1/2 -ml-0.5 size-1 rounded-pill bg-g5"
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-s2 pt-3 font-sans text-[12.5px] leading-[1.4] font-medium text-ink6">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-field bg-s1 shadow-ring-sand" />
              {t("open")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-field bg-em7" />
              {t("selected")}
            </span>
            <span>{t("rule")}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <div className="flex flex-col gap-1">
            <span className={TITLE}>{date ? dlong(date, hi) : t("openTimes")}</span>
            <span className="flex items-center gap-1.5 font-sans text-[12.5px] leading-[1.4] font-semibold text-ink6">
              <Icon name="clock" className="size-[14px] flex-none text-g5" />
              {t("ist", { n: mins })}
            </span>
          </div>
          {!date && (
            <div className="flex items-center gap-3.5 rounded-btn bg-s1 p-[18px]">
              <span className="grid size-10 flex-none place-items-center rounded-pill bg-iv text-g5">
                <Icon name="calendar" className="size-5" />
              </span>
              <span className="font-sans text-[14px] leading-[1.5] font-medium text-ink">{t("pick")}</span>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.k} role="group" aria-labelledby={`bk-slot-${g.k}`} className="flex flex-col gap-2.5">
              <span
                id={`bk-slot-${g.k}`}
                className="font-sans text-[10.5px] leading-none font-semibold tracking-[.14em] text-g7 uppercase hi:tracking-normal"
              >
                {t(`groups.${g.k}`)}
              </span>
              <div className="flex flex-wrap gap-2">
                {g.items.map((x) => {
                  const sel = time === x.t;
                  const label = t12(x.t);
                  return (
                    <button
                      key={x.t}
                      type="button"
                      onClick={() => onTime(x.t)}
                      disabled={!x.free}
                      aria-pressed={sel}
                      aria-label={x.free ? label : t("booked", { time: label })}
                      className={cn(
                        "h-11 min-w-[98px] rounded-pill border-0 px-3.5 font-sans text-[14px] leading-none font-semibold tabular transition-colors duration-200",
                        sel
                          ? "bg-em7 text-iv"
                          : x.free
                            ? "bg-cream text-em9 shadow-ring-sand"
                            : "cursor-not-allowed bg-transparent text-[#A9B5AE] line-through shadow-ring-sand",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {local && (
            <span className="flex items-start gap-2 rounded-btn bg-em1 px-3.5 py-3 font-sans text-[13.5px] leading-[1.5] font-medium text-em9">
              <Icon name="globe" className="mt-0.5 size-4 flex-none" />
              {t("local", { time: local, tz })}
            </span>
          )}
          {error && <ErrorRow>{error}</ErrorRow>}
        </div>
      </div>
    </div>
  );
}
