import Link from "next/link";
import { StatusBadge, type BadgeTone } from "@/components/admin/ui/StatusBadge";
import { PalmPhotos } from "./PalmPhotos";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import type { BookingAdminDetail } from "@/server/bookings/admin";
import type { BookingStatus } from "@/lib/domain/enums";

export type BookingDetailProps = {
  booking: BookingAdminDetail;
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

export function BookingDetail({
  booking,
}: BookingDetailProps): React.JSX.Element {
  const details = booking.details || {
    dob: "",
    tob: "",
    unknown: false,
    place: "",
    q: "",
    lang: "hi",
    mobile: "",
    biz: "",
  };

  const cleanPhone = booking.phone.replace(/\D/g, "");
  const waPhone = cleanPhone.startsWith("91")
    ? cleanPhone
    : `91${cleanPhone.replace(/^0+/, "")}`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-s2 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[16px] font-bold text-em7">
                {booking.ref}
              </span>
              <StatusBadge tone={getBadgeTone(booking.status)}>
                {booking.status.replace("_", " ")}
              </StatusBadge>
            </div>
            <p className="mt-1 font-mono text-[12px] text-ink6">
              Booked on {formatIst(booking.createdAt, { date: true, time: true })}
            </p>
          </div>

          <div className="text-right">
            <span className="font-mono text-[20px] font-bold text-ink">
              ₹{fmt(booking.priceInr)}
            </span>
            <div className="font-mono text-[11px] text-ink6">
              {booking.paidAt ? (
                <span className="text-em7 font-semibold">
                  Paid on {formatIst(booking.paidAt, { date: true })}
                </span>
              ) : (
                <span className="text-sin font-semibold">Unpaid</span>
              )}
            </div>
          </div>
        </div>

        {/* Customer & Session Info */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Customer Column */}
          <div className="space-y-2">
            <h4 className="font-display text-[14px] font-semibold text-ink">
              Customer Contact
            </h4>
            <div className="space-y-1 font-sans text-[13px]">
              <div className="font-semibold text-ink">{booking.name}</div>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={`tel:+91${cleanPhone}`}
                  className="inline-flex items-center gap-1.5 rounded-field border border-s2 bg-cream px-2.5 py-1 text-[12px] font-semibold text-ink hover:bg-s1 no-underline"
                >
                  <span className="size-3.5 text-em7">
                    <AdminIcon name="phone" />
                  </span>
                  <span>{booking.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-field border border-em7/40 bg-em7/5 px-2.5 py-1 text-[12px] font-semibold text-em7 hover:bg-em7/10 no-underline"
                >
                  <span className="size-3.5">
                    <AdminIcon name="whatsapp" />
                  </span>
                  <span>WhatsApp</span>
                </a>
              </div>

              {booking.email && (
                <div className="pt-1 text-ink6">
                  <a
                    href={`mailto:${booking.email}`}
                    className="hover:text-em7 hover:underline"
                  >
                    {booking.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Session Details Column */}
          <div className="space-y-2">
            <h4 className="font-display text-[14px] font-semibold text-ink">
              Consultation Package
            </h4>
            <div className="space-y-1 font-sans text-[13px] text-ink6">
              <div>
                <strong className="text-ink capitalize">
                  {booking.serviceKey}
                </strong>{" "}
                · <span className="capitalize">{booking.tierKey} package</span>
              </div>
              <div>
                Mode:{" "}
                <span className="font-mono font-semibold uppercase text-ink">
                  {booking.mode}
                </span>
              </div>
              {booking.startAt ? (
                <div>
                  Time:{" "}
                  <strong className="text-ink font-semibold">
                    {formatIst(booking.startAt, {
                      date: true,
                      time: true,
                      weekday: true,
                    })}
                  </strong>
                </div>
              ) : (
                <div className="italic text-em7">
                  Written Report (No live slot)
                </div>
              )}
              {booking.meetingLink && (
                <div className="pt-1">
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-em7 hover:underline"
                  >
                    <span className="size-3.5">
                      <AdminIcon name="link" />
                    </span>
                    <span>Join Session URL</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Birth & Kundali Details Card */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-4">
        <h3 className="font-display text-[16px] font-semibold text-ink">
          Birth Profile & Question
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 font-sans text-[13px]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
              Date of Birth
            </span>
            <div className="mt-0.5 font-mono font-bold text-ink">
              {details.dob || "Not provided"}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
              Time of Birth
            </span>
            <div className="mt-0.5 font-mono font-bold text-ink">
              {details.unknown ? "Unknown" : details.tob || "Not provided"}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
              Place of Birth
            </span>
            <div className="mt-0.5 font-semibold text-ink">
              {details.place || "Not provided"}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
              Preferred Language
            </span>
            <div className="mt-0.5 font-semibold text-ink">
              {details.lang === "hi" ? "Hindi (हिन्दी)" : "English"}
            </div>
          </div>
        </div>

        {/* Primary Query / Question */}
        {details.q && (
          <div className="border-t border-s2 pt-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
              Client Question / Concerns
            </span>
            <div className="mt-1 rounded-btn bg-s1/30 p-3 font-sans text-[13px] leading-relaxed text-ink whitespace-pre-wrap">
              {details.q}
            </div>
          </div>
        )}

        {/* Numerology Specific Fields */}
        {(details.mobile || details.biz) && (
          <div className="border-t border-s2 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {details.mobile && (
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
                  Numerology Mobile Number
                </span>
                <div className="mt-0.5 font-mono font-bold text-ink">
                  {details.mobile}
                </div>
              </div>
            )}
            {details.biz && (
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink6">
                  Business / Brand Name
                </span>
                <div className="mt-0.5 font-semibold text-ink">
                  {details.biz}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Palm Photos Section */}
      <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-3">
        <h3 className="font-display text-[16px] font-semibold text-ink">
          Palm Photos ({booking.palmUrls?.length || 0})
        </h3>
        <PalmPhotos photos={booking.palmUrls || []} />
      </div>

      {/* Admin Notes History */}
      {booking.adminNote && (
        <div className="rounded-btn border border-s2 bg-cream p-5 shadow-sm space-y-2">
          <h3 className="font-display text-[15px] font-semibold text-ink">
            Admin Log & Notes History
          </h3>
          <div className="rounded-btn bg-s1/25 p-3.5 font-mono text-[12.5px] leading-relaxed text-ink whitespace-pre-wrap">
            {booking.adminNote}
          </div>
        </div>
      )}
    </div>
  );
}
