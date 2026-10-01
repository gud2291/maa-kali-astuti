"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { addDaysKey, formatIst } from "@/lib/core/ist";
import type { WeekCalendarResult, WeekCalendarBooking } from "@/server/bookings/admin";
import type { BookingStatus } from "@/lib/domain/enums";

export type WeekCalendarProps = {
  data: WeekCalendarResult;
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21 (08:00 to 21:00)

function getStatusStyle(status: BookingStatus): {
  bg: string;
  border: string;
  text: string;
} {
  switch (status) {
    case "confirmed":
      return {
        bg: "bg-em7/15 hover:bg-em7/25",
        border: "border-l-4 border-em7",
        text: "text-em9",
      };
    case "pending_payment":
      return {
        bg: "bg-g5/25 hover:bg-g5/35",
        border: "border-l-4 border-g7",
        text: "text-g7",
      };
    case "completed":
      return {
        bg: "bg-teal-700/15 hover:bg-teal-700/25",
        border: "border-l-4 border-teal-700",
        text: "text-teal-900",
      };
    case "no_show":
      return {
        bg: "bg-rose/40 hover:bg-rose/60",
        border: "border-l-4 border-sin",
        text: "text-sin",
      };
    case "cancelled":
    case "expired":
    default:
      return {
        bg: "bg-s2/60 hover:bg-s2",
        border: "border-l-4 border-ink6/50",
        text: "text-ink6",
      };
  }
}

export function WeekCalendar({ data }: WeekCalendarProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const prevWeek = addDaysKey(data.weekStart, -7);
  const nextWeek = addDaysKey(data.weekStart, 7);

  const navigateWeek = (targetStart: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("week", targetStart);
    params.set("view", "calendar");
    router.push(`?${params.toString()}`);
  };

  // Map bookings to day index 0..6
  const bookingsByDay: WeekCalendarBooking[][] = Array.from(
    { length: 7 },
    () => [],
  );

  for (const b of data.bookings) {
    if (!b.startAt) continue;
    const startIst = new Date(
      new Date(b.startAt).getTime() + (5 * 60 + 30) * 60_000,
    );
    const y = startIst.getUTCFullYear();
    const m = String(startIst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(startIst.getUTCDate()).padStart(2, "0");
    const dayKey = `${y}-${m}-${d}`;

    const dayIndex = data.days.indexOf(dayKey);
    if (dayIndex >= 0 && dayIndex < 7) {
      bookingsByDay[dayIndex]!.push(b);
    }
  }

  return (
    <div className="rounded-btn border border-s2 bg-cream p-4 shadow-sm space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-s2 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigateWeek(prevWeek)}
            className="flex size-8 items-center justify-center rounded-field border border-s2 bg-cream hover:bg-s1 text-ink cursor-pointer"
            title="Previous Week"
            aria-label="Previous Week"
          >
            <span className="size-4">
              <AdminIcon name="chevL" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              // Current week's Monday
              const now = new Date();
              const day = now.getDay();
              const diff = now.getDate() - day + (day === 0 ? -6 : 1);
              const mon = new Date(now.setDate(diff));
              const monKey = mon.toISOString().slice(0, 10);
              navigateWeek(monKey);
            }}
            className="h-8 rounded-field border border-s2 bg-cream px-3 font-sans text-[12.5px] font-semibold text-ink hover:bg-s1 cursor-pointer"
          >
            Current Week
          </button>

          <button
            type="button"
            onClick={() => navigateWeek(nextWeek)}
            className="flex size-8 items-center justify-center rounded-field border border-s2 bg-cream hover:bg-s1 text-ink cursor-pointer"
            title="Next Week"
            aria-label="Next Week"
          >
            <span className="size-4">
              <AdminIcon name="chevR" />
            </span>
          </button>

          <span className="ml-2 font-display text-[15px] font-semibold text-ink">
            {formatIst(data.days[0]!, { date: true })} –{" "}
            {formatIst(data.days[6]!, { date: true })}
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 font-sans text-[11px] font-medium text-ink6">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-em7" />
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-g7" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-teal-700" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-sin" />
            <span>No Show / Cancelled</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-s2 text-center font-sans">
            <div className="py-2 text-[11px] font-semibold text-ink6">Time</div>
            {data.days.map((dayKey, i) => {
              const dt = new Date(`${dayKey}T00:00:00Z`);
              const dayName = dt.toLocaleDateString("en-US", {
                weekday: "short",
                timeZone: "UTC",
              });
              const dayNum = dayKey.slice(8);
              return (
                <div
                  key={dayKey}
                  className={`py-2 px-1 border-l border-s2 ${
                    i >= 5 ? "bg-s1/20" : ""
                  }`}
                >
                  <div className="text-[11px] font-semibold uppercase text-ink6">
                    {dayName}
                  </div>
                  <div className="text-[14px] font-bold text-ink">{dayNum}</div>
                </div>
              );
            })}
          </div>

          {/* Time Rows and Grid */}
          <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
            {/* Hour lines background */}
            <div className="contents">
              {HOURS.map((hour) => (
                <div key={hour} className="contents">
                  <div className="h-16 border-b border-s2/40 pr-2 pt-1 text-right font-mono text-[11px] text-ink6 select-none">
                    {String(hour).padStart(2, "0")}:00
                  </div>
                  {Array.from({ length: 7 }).map((_, dIdx) => (
                    <div
                      key={dIdx}
                      className="h-16 border-b border-l border-s2/40"
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Bookings Overlay */}
            {data.days.map((_, dayIndex) => {
              const dayBookings = bookingsByDay[dayIndex] || [];
              return (
                <div
                  key={dayIndex}
                  className="absolute inset-y-0 pointer-events-none"
                  style={{
                    left: `calc(60px + (100% - 60px) * ${dayIndex} / 7)`,
                    width: `calc((100% - 60px) / 7)`,
                  }}
                >
                  {dayBookings.map((b) => {
                    if (!b.startAt) return null;
                    const startIst = new Date(
                      new Date(b.startAt).getTime() + (5 * 60 + 30) * 60_000,
                    );
                    const startH = startIst.getUTCHours();
                    const startM = startIst.getUTCMinutes();

                    const endIst = b.endAt
                      ? new Date(
                          new Date(b.endAt).getTime() +
                            (5 * 60 + 30) * 60_000,
                        )
                      : new Date(startIst.getTime() + 30 * 60_000);
                    const endH = endIst.getUTCHours();
                    const endM = endIst.getUTCMinutes();

                    const minutesFrom8 = (startH - 8) * 60 + startM;
                    const durationM = (endH - startH) * 60 + (endM - startM);

                    // 64px per hour = ~1.0667px per min
                    const topPx = (minutesFrom8 / 60) * 64;
                    const heightPx = Math.max(34, (durationM / 60) * 64);

                    const style = getStatusStyle(b.status);

                    return (
                      <Link
                        key={b.id}
                        href={`/admin/bookings/${b.id}`}
                        className={`absolute left-1 right-1 rounded-btn p-1.5 shadow-2xs transition-transform duration-100 hover:scale-[1.02] pointer-events-auto overflow-hidden no-underline flex flex-col justify-between ${style.bg} ${style.border} ${style.text}`}
                        style={{
                          top: `${topPx}px`,
                          height: `${heightPx}px`,
                          zIndex: 10,
                        }}
                      >
                        <div className="leading-tight">
                          <div className="flex items-center justify-between text-[10px] font-mono font-semibold">
                            <span>
                              {String(startH).padStart(2, "0")}:
                              {String(startM).padStart(2, "0")}
                            </span>
                            <span className="opacity-75">{b.ref}</span>
                          </div>
                          <div className="truncate font-sans text-[11.5px] font-bold text-ink">
                            {b.name}
                          </div>
                        </div>

                        <div className="truncate text-[10px] opacity-85">
                          {b.serviceKey} · {b.mode}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
