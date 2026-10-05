"use client";

import dynamic from "next/dynamic";

/* `ssr: false` is only allowed inside a Client Component, so the bookings page imports this wrapper. */
export const WeekCalendarLazy = dynamic(
  () => import("@/components/admin/bookings/WeekCalendar").then((m) => m.WeekCalendar),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full rounded-btn border border-s2 bg-cream animate-pulse" />
    ),
  },
);
