"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { formatIst } from "@/lib/core/ist";
import type { WeekCalendarResult, WeekCalendarBooking } from "@/server/bookings/admin";
import type { BookingStatus } from "@/lib/domain/enums";

export type DayListProps = {
  data: WeekCalendarResult;
};

function getBadgeTone(status: BookingStatus): BadgeTone {
  switch (status) {
    case "confirmed":
      return "ok";
    case "pending_payment":
      return "warn";
    case "completed":
      return "info";
    case "no_show":
    case "cancelled":
    case "expired":
      return "danger";
    default:
      return "muted";
  }
}

export function DayList({ data }: DayListProps): React.JSX.Element {
  const [selectedDayKey, setSelectedDayKey] = useState<string>(
    data.days[0] ?? "",
  );

  const dayBookings: WeekCalendarBooking[] = data.bookings.filter((b) => {
    if (!b.startAt) return false;
    const startIst = new Date(
      new Date(b.startAt).getTime() + (5 * 60 + 30) * 60_000,
    );
    const y = startIst.getUTCFullYear();
    const m = String(startIst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(startIst.getUTCDate()).padStart(2, "0");
    const dayKey = `${y}-${m}-${d}`;
    return dayKey === selectedDayKey;
  });

  return (
    <div className="space-y-4 md:hidden">
      {/* Day Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {data.days.map((dayKey) => {
          const dt = new Date(`${dayKey}T00:00:00Z`);
          const dayName = dt.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          });
          const dayNum = dayKey.slice(8);
          const isSelected = dayKey === selectedDayKey;

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => setSelectedDayKey(dayKey)}
              className={`flex flex-col items-center justify-center min-w-14 rounded-btn border p-2 text-center transition-colors cursor-pointer ${
                isSelected
                  ? "border-em7 bg-em7 text-cream shadow-sm"
                  : "border-s2 bg-cream text-ink hover:border-s2/80"
              }`}
            >
              <span
                className={`text-[11px] font-semibold uppercase ${
                  isSelected ? "text-cream/80" : "text-ink6"
                }`}
              >
                {dayName}
              </span>
              <span className="font-mono text-[14px] font-bold">
                {dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Bookings List */}
      <div className="space-y-3">
        {dayBookings.length === 0 ? (
          <div className="rounded-btn border border-s2 bg-cream p-6 text-center">
            <p className="font-sans text-[13px] text-ink6">
              No sessions scheduled for this day.
            </p>
          </div>
        ) : (
          dayBookings.map((b) => (
            <Link
              key={b.id}
              href={`/admin/bookings/${b.id}`}
              className="group flex flex-col justify-between rounded-btn border border-s2 bg-cream p-4 shadow-2xs hover:border-em7/40 no-underline transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-em7">
                      {b.startAt
                        ? formatIst(b.startAt, { time: true, date: false })
                        : "No time"}
                    </span>
                    <span className="font-mono text-[11px] text-ink6">
                      {b.ref}
                    </span>
                  </div>
                  <h4 className="mt-1 font-display text-[15px] font-semibold text-ink group-hover:text-em7">
                    {b.name}
                  </h4>
                  <p className="font-sans text-[12px] text-ink6">
                    {b.phone}
                  </p>
                </div>

                <StatusBadge tone={getBadgeTone(b.status)}>
                  {b.status.replace("_", " ")}
                </StatusBadge>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-s2/60 pt-2 font-sans text-[12px] text-ink6">
                <span>
                  {b.serviceKey} · {b.mode}
                </span>
                <span className="font-semibold text-em7 flex items-center gap-1">
                  <span>View</span>
                  <span className="size-3.5">
                    <AdminIcon name="arrowR" />
                  </span>
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
