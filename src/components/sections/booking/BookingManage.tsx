"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { useUi } from "@/stores/ui";
import type { BookingView } from "@/server/bookings/queries";
import type { ConsultRules } from "@/server/bookings/availability";
import { bookingReportLinkAction } from "@/server/bookings/actions";
import { formatIst } from "@/lib/core/ist";
import { fmt } from "@/lib/core/format";
import { gcal, downloadIcs, type CalEvent } from "@/lib/astro/calendar";
import { RescheduleCard } from "./RescheduleCard";
import { cn } from "@/lib/utils/cn";

export type BookingManageProps = {
  booking: BookingView;
  rules: ConsultRules;
  mins: number;
  accessKey?: string;
  whatsapp?: string;
};

export function BookingManage({
  booking,
  rules,
  mins,
  accessKey,
  whatsapp,
}: BookingManageProps): React.JSX.Element {
  const t = useTranslations("bookingManage");
  const hi = useLocale() === "hi";

  const [downloading, startDownload] = useTransition();

  const isLive = booking.mode !== "report";
  const startFormatted = booking.startMs
    ? formatIst(booking.startMs, {
        date: true,
        time: true,
        weekday: true,
        locale: hi ? "hi" : "en",
      })
    : null;

  // Calendar event for live session
  const calEvent: CalEvent | null =
    isLive && booking.startMs
      ? {
          id: booking.ref,
          start: new Date(booking.startMs),
          mins,
          title: `${booking.serviceName} with Sadhak Pawan Pandey`,
          desc: `${booking.tierTitle} package. Booking reference: ${booking.ref}.`,
          loc:
            booking.mode === "video"
              ? "Video link on WhatsApp"
              : "Phone / WhatsApp call",
        }
      : null;

  const handleDownloadReport = () => {
    startDownload(async () => {
      try {
        const res = await bookingReportLinkAction({
          ref: booking.ref,
          accessKey,
        });

        if (res.ok && res.data.url) {
          window.open(res.data.url, "_blank");
        } else {
          useUi.getState().toast({
            msg: hi
              ? "रिपोर्ट डाउनलोड करने में त्रुटि हुई।"
              : "Could not download report. Please try again later.",
            tone: "err",
          });
        }
      } catch {
        useUi.getState().toast({
          msg: hi ? "त्रुटि हुई।" : "An error occurred.",
          tone: "err",
        });
      }
    });
  };

  const statusBadge = () => {
    switch (booking.status) {
      case "confirmed":
        return {
          label: t("status.confirmed"),
          cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "completed":
        return {
          label: t("status.completed"),
          cls: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "cancelled":
        return {
          label: t("status.cancelled"),
          cls: "bg-red-50 text-red-800 border-red-200",
        };
      default:
        return {
          label: t("status.pending_payment"),
          cls: "bg-amber-50 text-amber-800 border-amber-200",
        };
    }
  };

  const badge = statusBadge();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      {/* Top Header Card */}
      <div className="mb-6 rounded-btn border border-s2 bg-iv p-6 md:p-8 shadow-ring-sand">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <span className="font-sans text-[12px] font-bold tracking-widest text-g7 uppercase">
                {t("badge")}
              </span>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-semibold tracking-wide",
                  badge.cls,
                )}
              >
                {badge.label}
              </span>
            </div>
            <h1 className="font-title text-[24px] md:text-[28px] leading-tight font-normal text-em9">
              {booking.serviceName}
            </h1>
            <p className="font-sans text-[14px] text-ink6">
              {booking.tierTitle} · <span className="font-mono font-medium">{booking.ref}</span>
            </p>
          </div>

          <div className="flex items-baseline gap-1 sm:text-right">
            <span className="font-sans text-[13px] text-ink6">{t("details.price")}:</span>
            <span className="font-title text-[22px] font-semibold text-em9">
              {fmt(booking.priceInr)}
            </span>
          </div>
        </div>

        {/* Quick Action Alerts: Join link or Report download */}
        {booking.meetingLink && booking.status === "confirmed" && (
          <div className="mt-6 rounded-btn border border-g3/40 bg-emerald-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-pill bg-em7 text-iv shrink-0">
                <Icon name="eye" className="size-5" />
              </span>
              <div>
                <h4 className="font-sans text-[14.5px] font-semibold text-em9">
                  {t("actions.join")}
                </h4>
                <p className="font-sans text-[13px] text-ink6">
                  {t("actions.joinDesc")}
                </p>
              </div>
            </div>
            <a
              href={booking.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-btn bg-em7 px-5 font-sans text-[13.5px] font-semibold text-iv shadow-ring-gold transition-colors hover:bg-em9 shrink-0"
            >
              <span>{t("actions.join")}</span>
              <Icon name="arrowR" className="size-4" />
            </a>
          </div>
        )}

        {booking.hasReport && (
          <div className="mt-6 rounded-btn border border-s2 bg-cream p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-pill bg-em7 text-iv shrink-0">
                <Icon name="report" className="size-5" />
              </span>
              <div>
                <h4 className="font-sans text-[14.5px] font-semibold text-em9">
                  {t("actions.downloadReport")}
                </h4>
                <p className="font-sans text-[13px] text-ink6">
                  {hi
                    ? "आपकी व्यक्तिगत ज्योतिषीय परामर्श रिपोर्ट तैयार है।"
                    : "Your personalized consultation report is ready."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={downloading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-btn bg-em7 px-5 font-sans text-[13.5px] font-semibold text-iv shadow-ring-gold transition-colors hover:bg-em9 disabled:opacity-50 shrink-0"
            >
              {downloading ? (
                <>
                  <span className="size-4 animate-spin rounded-pill border-2 border-iv border-t-transparent" />
                  <span>{t("actions.downloading")}</span>
                </>
              ) : (
                <>
                  <Icon name="download" className="size-4" />
                  <span>{t("actions.downloadReport")}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Details & Reschedule */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Details Summary Card */}
          <div className="rounded-btn border border-s2 bg-iv p-5 md:p-6 shadow-ring-sand">
            <h2 className="mb-4 font-title text-[18px] font-normal text-em9">
              {t("title")}
            </h2>

            <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="font-sans text-[12.5px] text-ink6">{t("details.mode")}</dt>
                <dd className="mt-1 font-sans text-[14.5px] font-semibold text-ink">
                  {booking.mode === "video"
                    ? t("details.modes.video")
                    : booking.mode === "call"
                      ? t("details.modes.call")
                      : booking.mode === "report"
                        ? t("details.modes.report")
                        : t("details.modes.in_person")}
                </dd>
              </div>

              <div>
                <dt className="font-sans text-[12.5px] text-ink6">
                  {isLive ? t("details.scheduledTime") : t("details.writtenReport")}
                </dt>
                <dd className="mt-1 font-sans text-[14.5px] font-semibold text-em7">
                  {isLive ? (startFormatted ?? "—") : t("details.writtenReportDesc")}
                </dd>
              </div>

              <div>
                <dt className="font-sans text-[12.5px] text-ink6">{t("details.package")}</dt>
                <dd className="mt-1 font-sans text-[14.5px] font-semibold text-ink">
                  {booking.tierTitle}
                </dd>
              </div>

              <div>
                <dt className="font-sans text-[12.5px] text-ink6">{t("ref")}</dt>
                <dd className="mt-1 font-mono text-[14px] font-medium text-ink">
                  {booking.ref}
                </dd>
              </div>
            </dl>

            {/* Add to Calendar Buttons for Live Sessions */}
            {calEvent && booking.status === "confirmed" && (
              <div className="mt-6 border-t border-s2 pt-4">
                <span className="block mb-2 font-sans text-[12.5px] font-semibold text-ink6">
                  {t("actions.addToCalendar")}:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={gcal(calEvent)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-2 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-medium text-ink transition-colors hover:border-g5 hover:bg-s1"
                  >
                    <Icon name="calendar" className="size-4 text-g5" />
                    <span>{t("actions.gcal")}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadIcs(calEvent, `maa-kali-astuti-${booking.ref}.ics`)}
                    className="inline-flex h-9 items-center gap-2 rounded-btn border border-s2 bg-cream px-3 font-sans text-[13px] font-medium text-ink transition-colors hover:border-g5 hover:bg-s1"
                  >
                    <Icon name="calendar" className="size-4 text-g5" />
                    <span>{t("actions.ics")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reschedule Card */}
          {isLive && (
            <RescheduleCard
              booking={booking}
              rules={rules}
              mins={mins}
              accessKey={accessKey}
              whatsapp={whatsapp}
            />
          )}
        </div>

        {/* Right Col: Help & Support Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="rounded-btn border border-s2 bg-iv p-5 md:p-6 shadow-ring-sand">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="grid size-8 place-items-center rounded-pill bg-cream text-em7">
                <Icon name="whatsapp" className="size-4" />
              </span>
              <h3 className="font-title text-[17px] font-normal text-em9">
                {t("help.title")}
              </h3>
            </div>
            <p className="font-sans text-[13.5px] leading-relaxed text-ink6 mb-4">
              {t("help.body")}
            </p>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Namaste, regarding booking ${booking.ref}...`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-btn bg-[#25D366] px-4 font-sans text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Icon name="whatsapp" className="size-4" />
                <span>{t("help.whatsapp")}</span>
              </a>
            )}
          </div>

          {/* Links back */}
          <div className="rounded-btn border border-s2 bg-cream/70 p-4 flex flex-col gap-2">
            <Link
              href="/consultations"
              className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-em7 hover:text-em9"
            >
              <Icon name="arrowL" className="size-3.5" />
              <span>{hi ? "सभी परामर्श देखें" : "Explore all consultations"}</span>
            </Link>
            <Link
              href="/account/bookings"
              className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium text-em7 hover:text-em9"
            >
              <Icon name="calendar" className="size-3.5" />
              <span>{hi ? "मेरे परामर्श" : "My Consultations in Account"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
