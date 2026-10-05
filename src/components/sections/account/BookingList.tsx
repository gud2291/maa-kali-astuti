import Link from "next/link";
import type { BookingListItem } from "@/server/bookings/queries";
import type { Locale } from "@/lib/domain/enums";
import { Icon } from "@/components/icons/Icon";
import { fmt } from "@/lib/core/format";
import { formatIst } from "@/lib/core/ist";
import { cn } from "@/lib/utils/cn";

export function BookingList({
  bookings,
  locale = "en",
}: {
  bookings: BookingListItem[];
  locale?: Locale;
}): React.JSX.Element {
  const isHi = locale === "hi";
  const now = Date.now();

  const isUpcoming = (b: BookingListItem) => {
    if (b.status === "cancelled" || b.status === "completed") {
      return false;
    }
    // Written report or future start
    if (b.startMs === null) return true;
    return b.startMs > now;
  };

  const upcoming = bookings.filter(isUpcoming);
  const past = bookings.filter((b) => !isUpcoming(b));

  const statusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          label: isHi ? "निश्चित" : "Confirmed",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "completed":
        return {
          label: isHi ? "पूर्ण" : "Completed",
          cls: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "cancelled":
        return {
          label: isHi ? "रद्द" : "Cancelled",
          cls: "bg-red-50 text-red-800 border-red-200",
        };
      case "refunded":
        return {
          label: isHi ? "वापस" : "Refunded",
          cls: "bg-purple-50 text-purple-800 border-purple-200",
        };
      default:
        return {
          label: isHi ? "भुगतान लंबित" : "Pending Payment",
          cls: "bg-amber-50 text-amber-800 border-amber-200",
        };
    }
  };

  const modeLabels: Record<string, { en: string; hi: string }> = {
    video: { en: "Video Call", hi: "वीडियो कॉल" },
    call: { en: "Phone Call", hi: "फ़ोन कॉल" },
    report: { en: "Written Report", hi: "लिखित रिपोर्ट" },
    in_person: { en: "In Person", hi: "व्यक्तिगत" },
  };

  const renderBookingCard = (b: BookingListItem) => {
    const badge = statusBadge(b.status);
    const modeLabel = isHi
      ? modeLabels[b.mode]?.hi ?? b.mode
      : modeLabels[b.mode]?.en ?? b.mode;

    const timeLabel = b.startMs
      ? formatIst(b.startMs, {
          date: true,
          time: true,
          weekday: true,
          locale: isHi ? "hi" : "en",
        })
      : isHi
        ? "लिखित रिपोर्ट"
        : "Written Report (48 hrs)";

    const manageHref = isHi ? `/hi/booking/${b.ref}` : `/booking/${b.ref}`;

    return (
      <div
        key={b.ref}
        className="overflow-hidden rounded-btn border border-s2 bg-cream shadow-sm transition-all duration-150 hover:border-g5 hover:shadow-md"
      >
        {/* Top Header of Card */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-s2 bg-iv px-5 py-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-sans text-ink6">
              {isHi ? "संदर्भ:" : "Ref:"}
            </span>
            <span className="font-mono font-bold text-em9">{b.ref}</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-semibold tracking-wide",
                badge.cls,
              )}
            >
              {badge.label}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-title text-[18px] font-normal text-em9">
              {b.serviceName}
            </h3>
            <p className="font-sans text-[13.5px] text-ink6">
              {b.tierTitle} · <span className="font-medium text-ink">{modeLabel}</span>
            </p>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-em7 font-medium">
              <Icon name="clock" className="size-3.5 text-g5 shrink-0" />
              <span>{timeLabel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-s2 pt-4 sm:border-t-0 sm:pt-0 sm:flex-col sm:items-end">
            <span className="font-title text-[18px] font-semibold text-em9">
              {fmt(b.priceInr)}
            </span>
            <Link
              href={manageHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-btn bg-em7 px-4 font-sans text-[13px] font-semibold text-iv shadow-xs transition-colors hover:bg-em9"
            >
              <span>{isHi ? "प्रबंधित करें" : "Manage"}</span>
              <Icon name="arrowR" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-s2 pb-4">
        <h1 className="font-title text-2xl font-normal text-em9 sm:text-3xl">
          {isHi ? "मेरे परामर्श" : "My Consultations"}
        </h1>
        <p className="mt-1 font-sans text-xs text-ink6 sm:text-sm">
          {isHi
            ? "साधक पवन पांडे जी के साथ आपके सत्र और परामर्श रिपोर्ट"
            : "Your personal sessions and reports with Sadhak Pawan Pandey"}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-btn border border-s2 bg-cream p-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-pill bg-s1 text-ink6">
            <Icon name="calendar" className="size-6 text-em7" />
          </div>
          <h2 className="font-sans text-base font-bold text-ink">
            {isHi ? "कोई परामर्श नहीं मिला" : "No consultations found"}
          </h2>
          <p className="mt-1 font-sans text-xs text-ink6">
            {isHi
              ? "आपने अभी तक कोई परामर्श बुक नहीं किया है।"
              : "You haven't booked any consultation sessions with this account yet."}
          </p>
          <div className="mt-5">
            <Link
              href="/consultations"
              className="inline-flex items-center gap-2 rounded-btn bg-em7 px-4 py-2 font-sans text-xs font-semibold text-iv hover:bg-em9 transition-colors"
            >
              <span>{isHi ? "परामर्श देखें" : "Explore Consultations"}</span>
              <Icon name="arrowR" className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div className="space-y-4">
            <h2 className="font-title text-lg font-normal text-em9 flex items-center gap-2">
              <span>{isHi ? "आगामी सत्र" : "Upcoming Sessions"}</span>
              <span className="rounded-full bg-s1 px-2 py-0.5 font-sans text-xs font-bold text-ink6">
                {upcoming.length}
              </span>
            </h2>

            {upcoming.length === 0 ? (
              <p className="font-sans text-sm text-ink6 italic">
                {isHi
                  ? "कोई आगामी परामर्श निर्धारित नहीं है।"
                  : "No upcoming consultation sessions."}
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map(renderBookingCard)}
              </div>
            )}
          </div>

          {/* Past Section */}
          {past.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-s2">
              <h2 className="font-title text-lg font-normal text-em9 flex items-center gap-2">
                <span>{isHi ? "पिछले सत्र" : "Past Sessions"}</span>
                <span className="rounded-full bg-s1 px-2 py-0.5 font-sans text-xs font-bold text-ink6">
                  {past.length}
                </span>
              </h2>

              <div className="space-y-3">
                {past.map(renderBookingCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
