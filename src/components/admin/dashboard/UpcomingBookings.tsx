import Link from "next/link";
import type { UpcomingBookingItem } from "@/server/dashboard/queries";
import { formatIst } from "@/lib/core/ist";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { AdminIcon } from "@/components/admin/AdminIcon";
import type { BookingStatus } from "@/lib/domain/enums";

export type UpcomingBookingsProps = {
  bookings: UpcomingBookingItem[];
};

function getBookingStatusBadge(status: BookingStatus): { tone: BadgeTone; label: string } {
  switch (status) {
    case "confirmed":
      return { tone: "ok", label: "Confirmed" };
    case "completed":
      return { tone: "info", label: "Completed" };
    case "hold":
      return { tone: "warn", label: "On Hold" };
    case "cancelled":
      return { tone: "danger", label: "Cancelled" };
    default:
      return { tone: "muted", label: status };
  }
}

export function UpcomingBookings({ bookings }: UpcomingBookingsProps): React.JSX.Element {
  return (
    <div className="rounded-btn bg-cream p-5 shadow-ring-sand border border-s2 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-s2 pb-3">
          <div>
            <h3 className="font-serif text-[17px] font-bold text-ink">
              Upcoming Consultations
            </h3>
            <p className="font-sans text-[11.5px] text-ink6">
              Next scheduled client calls
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="flex items-center gap-1 font-sans text-[12px] font-semibold text-em7 hover:text-em5 no-underline"
          >
            <span>All bookings</span>
            <AdminIcon name="arrowR" className="size-3" />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center font-sans text-[13px] text-ink6">
            No upcoming consultations scheduled.
          </div>
        ) : (
          <div className="divide-y divide-s2/60">
            {bookings.map((b) => {
              const badge = getBookingStatusBadge(b.status);
              const timeStr = b.startAt
                ? formatIst(b.startAt, { date: true, time: true })
                : "Unscheduled";

              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="group flex items-center justify-between gap-3 py-3 no-underline transition-colors hover:bg-s1/30 px-2 rounded -mx-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12.5px] font-bold text-em7 group-hover:underline">
                        {b.ref}
                      </span>
                      <span className="font-sans text-[11px] font-medium text-g7 uppercase tracking-wider">
                        {b.mode}
                      </span>
                    </div>
                    <p className="truncate font-sans text-[12px] text-ink font-medium mt-0.5">
                      {b.name} <span className="text-ink6">({b.phone})</span>
                    </p>
                    <p className="font-sans text-[11px] text-ink6">
                      {timeStr}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-none text-right">
                    <StatusBadge tone={badge.tone}>
                      {badge.label}
                    </StatusBadge>
                    {b.meetingLink && (
                      <span className="font-sans text-[10.5px] text-em7 font-medium">
                        Link ready
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
