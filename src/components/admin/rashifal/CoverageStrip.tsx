"use client";

import { useMemo } from "react";
import type { RashifalPeriod } from "@/lib/domain/enums";
import type { PeriodCoverage } from "@/server/rashifal/admin";
import { addDaysKey, weekdayOfKey, formatIst, istWallToUtc } from "@/lib/core/ist";
import { cn } from "@/lib/utils/cn";

export type CoverageStripProps = {
  period: RashifalPeriod;
  selectedStartsOn: string;
  coverage: PeriodCoverage[];
  onSelectStartsOn: (startsOn: string) => void;
  todayKey: string;
};

type StripItem = {
  startsOn: string;
  label: string;
  sub: string;
};

export function CoverageStrip({
  period,
  selectedStartsOn,
  coverage,
  onSelectStartsOn,
  todayKey,
}: CoverageStripProps): React.JSX.Element {
  const coverageMap = useMemo(() => {
    const map = new Map<string, PeriodCoverage>();
    for (const c of coverage) {
      if (c.period === period) {
        map.set(c.startsOn, c);
      }
    }
    return map;
  }, [coverage, period]);

  const items = useMemo<StripItem[]>(() => {
    if (period === "day") {
      return Array.from({ length: 14 }, (_, i) => {
        const startsOn = addDaysKey(todayKey, i);
        let label = formatIst(istWallToUtc(startsOn, "12:00"), {
          weekday: true,
          date: true,
        });
        if (i === 0) label = "Today";
        else if (i === 1) label = "Tomorrow";
        return {
          startsOn,
          label,
          sub: startsOn,
        };
      });
    }

    if (period === "week") {
      const wd = weekdayOfKey(todayKey);
      const daysSinceMonday = (wd + 6) % 7;
      const currentMonday = addDaysKey(todayKey, -daysSinceMonday);

      return Array.from({ length: 8 }, (_, i) => {
        const startsOn = addDaysKey(currentMonday, i * 7);
        const endsOn = addDaysKey(startsOn, 6);
        let label = `${startsOn.slice(5)} – ${endsOn.slice(5)}`;
        if (i === 0) label = "This Week";
        else if (i === 1) label = "Next Week";
        return {
          startsOn,
          label,
          sub: `${startsOn.slice(5)} to ${endsOn.slice(5)}`,
        };
      });
    }

    if (period === "month") {
      const [yearStr, monthStr] = todayKey.split("-");
      let year = Number(yearStr);
      let month = Number(monthStr);

      return Array.from({ length: 6 }, (_, i) => {
        let curMonth = month + i;
        let curYear = year;
        while (curMonth > 12) {
          curMonth -= 12;
          curYear += 1;
        }
        const startsOn = `${curYear}-${String(curMonth).padStart(2, "0")}-01`;
        const dateObj = new Date(Date.UTC(curYear, curMonth - 1, 1));
        const label = new Intl.DateTimeFormat("en-IN", {
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(dateObj);
        return {
          startsOn,
          label,
          sub: startsOn,
        };
      });
    }

    // "year"
    const currentYear = Number(todayKey.slice(0, 4));
    return Array.from({ length: 3 }, (_, i) => {
      const y = currentYear + i;
      const startsOn = `${y}-01-01`;
      return {
        startsOn,
        label: `Year ${y}`,
        sub: startsOn,
      };
    });
  }, [period, todayKey]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-ink6">
        <span className="font-semibold uppercase tracking-wider">
          Schedule &amp; Coverage ({items.length} {period === "day" ? "days" : period === "week" ? "weeks" : period === "month" ? "months" : "years"})
        </span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-ok" />
            <span>Complete (12/12)</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-cu" />
            <span>Partial</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-s2 border border-ink6" />
            <span>Empty</span>
          </span>
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
        {items.map((item) => {
          const cov = coverageMap.get(item.startsOn);
          const count = cov?.count ?? 0;
          const complete = cov?.complete ?? false;
          const isSelected = item.startsOn === selectedStartsOn;

          return (
            <button
              key={item.startsOn}
              type="button"
              onClick={() => onSelectStartsOn(item.startsOn)}
              className={cn(
                "group flex min-w-[120px] flex-none flex-col items-start gap-1 rounded-btn p-2.5 text-left transition-all duration-150 cursor-pointer",
                isSelected
                  ? "bg-em9 text-iv shadow-[inset_0_0_0_1.5px_#B8923A]"
                  : "bg-iv text-ink hover:bg-cream shadow-[inset_0_0_0_1px_#EAE0CA]",
              )}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="text-[13px] font-semibold leading-tight">
                  {item.label}
                </span>
                <span
                  className={cn(
                    "size-2 rounded-full flex-none",
                    complete
                      ? "bg-ok"
                      : count > 0
                        ? "bg-cu"
                        : "bg-s2 border border-ink6",
                  )}
                />
              </div>

              <div className="flex w-full items-baseline justify-between gap-1">
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    isSelected ? "text-g3" : "text-ink6",
                  )}
                >
                  {item.sub}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase",
                    complete
                      ? "text-ok"
                      : count > 0
                        ? "text-cu"
                        : isSelected
                          ? "text-ink6"
                          : "text-ink6",
                  )}
                >
                  {count}/12
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
