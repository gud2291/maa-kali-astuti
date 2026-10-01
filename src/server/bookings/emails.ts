import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/consult";
import { getSetting } from "@/server/settings/queries";
import { getConsultRows } from "@/server/consult/queries";
import { accessKeyFor } from "@/server/ids";
import { absoluteUrl } from "@/server/request";
import { sendEmail, type EmailAttachment } from "@/server/email/send";
import { log } from "@/server/log";
import { ics, type CalEvent } from "@/lib/astro/calendar";
import { formatIst } from "@/lib/core/ist";
import {
  BookingConfirmedEmail,
  getBookingConfirmedSubject,
} from "@/server/email/templates/BookingConfirmedEmail";
import { AdminBookingAlertEmail } from "@/server/email/templates/AdminBookingAlertEmail";
import type { Locale } from "@/lib/domain/enums";

export async function sendBookingConfirmed(
  bookingId: number,
  alerts?: { slotClash?: boolean; amountMismatch?: boolean },
): Promise<void> {
  try {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      log.warn("booking.email_booking_not_found", { bookingId });
      return;
    }

    const [notify, contact, consultSettings, consultData] = await Promise.all([
      getSetting("notify"),
      getSetting("contact"),
      getSetting("consult"),
      getConsultRows(),
    ]);

    const service = consultData.services.find((s) => s.key === booking.serviceKey);
    const tier = consultData.tiers.find(
      (t) => t.serviceKey === booking.serviceKey && t.tierKey === booking.tierKey,
    );

    const isHi = booking.locale === "hi";
    const serviceName = service
      ? isHi
        ? service.nameHi
        : service.nameEn
      : booking.serviceKey;
    const tierTitle = tier
      ? isHi
        ? tier.titleHi || tier.titleEn
        : tier.titleEn
      : booking.tierKey;

    const modeLabels: Record<string, { en: string; hi: string }> = {
      video: { en: "Video Call", hi: "वीडियो कॉल" },
      call: { en: "Phone Call", hi: "फ़ोन कॉल" },
      report: { en: "Written Report", hi: "लिखित रिपोर्ट" },
      in_person: { en: "In Person", hi: "व्यक्तिगत" },
    };
    const modeLabel = isHi
      ? modeLabels[booking.mode]?.hi ?? booking.mode
      : modeLabels[booking.mode]?.en ?? booking.mode;

    const isReport = booking.mode === "report";
    const startFormatted = booking.startAt
      ? formatIst(booking.startAt, {
          date: true,
          time: true,
          weekday: true,
          locale: booking.locale as "en" | "hi",
        })
      : null;

    const accessKey = accessKeyFor("booking", booking.ref);
    const managePath = isHi
      ? `/hi/booking/${encodeURIComponent(booking.ref)}?k=${encodeURIComponent(accessKey)}`
      : `/booking/${encodeURIComponent(booking.ref)}?k=${encodeURIComponent(accessKey)}`;
    const manageUrl = absoluteUrl(managePath);

    // Customer email (if email was provided)
    if (booking.email) {
      try {
        let attachments: EmailAttachment[] | undefined;

        if (booking.startAt && !isReport) {
          const calEvent: CalEvent = {
            id: booking.ref,
            start: booking.startAt,
            mins: tier ? tier.mins : 30,
            title: `${service ? service.nameEn : booking.serviceKey} with Sadhak Pawan Pandey`,
            desc: `${tier ? tier.titleEn : booking.tierKey} package, ${modeLabels[booking.mode]?.en ?? booking.mode}. Booking ${booking.ref}. Maa Kali Astuti will message you on WhatsApp before the session.`,
            loc:
              booking.mode === "video"
                ? "Video link on WhatsApp"
                : "Phone / WhatsApp call",
          };

          const icsString = ics(calEvent);
          attachments = [
            {
              filename: `maa-kali-astuti-${booking.ref}.ics`,
              content: icsString,
            },
          ];
        }

        const subject = getBookingConfirmedSubject(
          booking.locale as Locale,
          booking.ref,
          serviceName,
        );

        await sendEmail({
          to: booking.email,
          subject,
          react: (
            <BookingConfirmedEmail
              locale={booking.locale as Locale}
              refCode={booking.ref}
              customerName={booking.name}
              serviceName={serviceName}
              tierTitle={tierTitle}
              mode={booking.mode}
              modeLabel={modeLabel}
              startFormatted={startFormatted}
              isReport={isReport}
              priceInr={booking.priceInr}
              manageUrl={manageUrl}
              rescheduleMinHours={consultSettings.rescheduleMinHours ?? 12}
              contact={{
                phoneDisplay: contact.phoneDisplay,
                email: contact.email,
              }}
            />
          ),
          attachments,
        });
      } catch (err) {
        log.error("booking.email_customer_error", {
          bookingId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Admin alert email
    if (notify.bookingAlerts && notify.adminEmails && notify.adminEmails.length > 0) {
      try {
        const adminUrl = absoluteUrl(`/admin/bookings/${booking.id}`);
        const alertPrefix = alerts?.slotClash
          ? "[URGENT: Slot Clash] "
          : alerts?.amountMismatch
            ? "[Attention: Price Mismatch] "
            : "";

        const subject = `${alertPrefix}New Booking: ${booking.ref} — ${service?.nameEn ?? booking.serviceKey} (₹${booking.priceInr})`;

        await sendEmail({
          to: notify.adminEmails,
          subject,
          react: (
            <AdminBookingAlertEmail
              refCode={booking.ref}
              bookingId={booking.id}
              serviceName={service?.nameEn ?? booking.serviceKey}
              tierTitle={tier?.titleEn ?? booking.tierKey}
              modeLabel={modeLabels[booking.mode]?.en ?? booking.mode}
              startFormatted={
                booking.startAt
                  ? formatIst(booking.startAt, {
                      date: true,
                      time: true,
                      weekday: true,
                      locale: "en",
                    })
                  : null
              }
              isReport={isReport}
              customerName={booking.name}
              customerPhone={booking.phone}
              customerEmail={booking.email}
              priceInr={booking.priceInr}
              adminUrl={adminUrl}
              slotClash={alerts?.slotClash}
              amountMismatch={alerts?.amountMismatch}
              adminNote={booking.adminNote}
            />
          ),
        });
      } catch (err) {
        log.error("booking.email_admin_alert_error", {
          bookingId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  } catch (err) {
    log.error("booking.email_fatal_error", {
      bookingId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
