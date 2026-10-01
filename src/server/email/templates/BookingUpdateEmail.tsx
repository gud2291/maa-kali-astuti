import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { Locale } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";

export type BookingUpdateKind = "meeting_link" | "report_ready" | "cancelled";

export type BookingUpdateEmailProps = {
  locale: Locale;
  kind: BookingUpdateKind;
  refCode: string;
  customerName: string;
  serviceName: string;
  tierTitle?: string;
  startFormatted?: string | null;
  manageUrl: string;
  meetingLink?: string | null;
  refundNote?: string | null;
  reason?: string | null;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    meeting_link: {
      subject: (ref: string, svc: string) =>
        `Meeting Link Added: ${svc} (${ref}) — Maa Kali Astuti`,
      preview: (ref: string) =>
        `Your meeting link for consultation ${ref} is now ready.`,
      heading: "Consultation Link Ready",
      intro:
        "Your consultation meeting link has been prepared. Please join at your scheduled time using the link below.",
      cta: "Join Consultation",
    },
    report_ready: {
      subject: (ref: string, svc: string) =>
        `Report Ready: ${svc} (${ref}) — Maa Kali Astuti`,
      preview: (ref: string) =>
        `Your written consultation report for ${ref} is ready to view.`,
      heading: "Your Report is Ready",
      intro:
        "Sadhak Pawan Pandey has completed your personalized consultation report. You can view and download your report now.",
      cta: "View & Download Report",
    },
    cancelled: {
      subject: (ref: string, svc: string) =>
        `Booking Cancelled: ${svc} (${ref}) — Maa Kali Astuti`,
      preview: (ref: string) =>
        `Your consultation booking ${ref} has been cancelled.`,
      heading: "Consultation Cancelled",
      intro:
        "Your consultation booking has been cancelled. Details regarding the cancellation and refund are given below.",
      cta: "View Booking Details",
    },
    greeting: (name: string) => `Namaste ${name},`,
    refCode: "Booking Reference",
    service: "Service",
    package: "Package",
    scheduledTime: "Scheduled Time",
    meetingLink: "Meeting Link",
    reason: "Reason",
    refund: "Refund Status",
    manageHint:
      "You can always manage your booking, access session links, or download documents on your booking page.",
  },
  hi: {
    meeting_link: {
      subject: (ref: string, svc: string) =>
        `मीटिंग लिंक उपलब्ध: ${svc} (${ref}) — माँ काली स्तुति`,
      preview: (ref: string) =>
        `आपके परामर्श ${ref} का मीटिंग लिंक तैयार है।`,
      heading: "परामर्श लिंक तैयार है",
      intro:
        "आपके परामर्श का मीटिंग लिंक तैयार कर दिया गया है। कृपया निश्चित समय पर नीचे दिए गए लिंक से जुड़ें।",
      cta: "परामर्श में जुड़ें",
    },
    report_ready: {
      subject: (ref: string, svc: string) =>
        `रिपोर्ट तैयार है: ${svc} (${ref}) — माँ काली स्तुति`,
      preview: (ref: string) =>
        `आपके परामर्श ${ref} की लिखित रिपोर्ट तैयार है।`,
      heading: "आपकी रिपोर्ट तैयार है",
      intro:
        "साधक पवन पांडे जी द्वारा आपकी व्यक्तिगत परामर्श रिपोर्ट तैयार कर ली गई है। आप इसे अभी डाउनलोड कर सकते हैं।",
      cta: "रिपोर्ट देखें और डाउनलोड करें",
    },
    cancelled: {
      subject: (ref: string, svc: string) =>
        `बुकिंग रद्द: ${svc} (${ref}) — माँ काली स्तुति`,
      preview: (ref: string) =>
        `आपका परामर्श ${ref} रद्द कर दिया गया है।`,
      heading: "परामर्श रद्द हुआ",
      intro:
        "आपकी परामर्श बुकिंग रद्द कर दी गई है। रद्दीकरण व रिफंड संबंधी विवरण नीचे दिया गया है।",
      cta: "बुकिंग विवरण देखें",
    },
    greeting: (name: string) => `नमस्ते ${name},`,
    refCode: "बुकिंग संदर्भ (Ref)",
    service: "परामर्श",
    package: "पैकेज",
    scheduledTime: "निश्चित समय",
    meetingLink: "मीटिंग लिंक",
    reason: "कारण",
    refund: "रिफंड स्थिति",
    manageHint:
      "आप किसी भी समय अपने बुकिंग पृष्ठ पर जाकर विवरण देख सकते हैं या रिपोर्ट डाउनलोड कर सकते हैं।",
  },
};

export function getBookingUpdateSubject(
  locale: Locale,
  kind: BookingUpdateKind,
  refCode: string,
  serviceName: string,
): string {
  const d = DICT[locale]?.[kind] ?? DICT.en[kind];
  return d.subject(refCode, serviceName);
}

export function BookingUpdateEmail({
  locale = "en",
  kind,
  refCode,
  customerName,
  serviceName,
  tierTitle,
  startFormatted,
  manageUrl,
  meetingLink,
  refundNote,
  reason,
  contact,
}: BookingUpdateEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;
  const k = d[kind];

  const primaryBtnUrl =
    kind === "meeting_link" && meetingLink ? meetingLink : manageUrl;

  return (
    <EmailShell preview={k.preview(refCode)} locale={locale} contact={contact}>
      <Text
        style={{
          margin: "0 0 8px 0",
          fontFamily:
            locale === "hi"
              ? "Rozha One, devanagari, serif"
              : "Cinzel, Georgia, serif",
          fontSize: "24px",
          lineHeight: "32px",
          color: "#0c1f17",
          fontWeight: 700,
        }}
      >
        {k.heading}
      </Text>

      <EmailText style={{ fontSize: "15px", marginBottom: "8px" }}>
        {d.greeting(customerName)}
      </EmailText>

      <EmailText style={{ fontSize: "14px", lineHeight: "22px" }}>
        {k.intro}
      </EmailText>

      {/* Details Box */}
      <Section
        style={{
          margin: "20px 0",
          padding: "16px 20px",
          backgroundColor: "#fbf8f0",
          borderRadius: "4px",
          border: "1px solid #d4c39c",
        }}
      >
        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted style={{ fontSize: "12px" }}>{d.refCode}</EmailMuted>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "13px",
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#165034",
              }}
            >
              {refCode}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted style={{ fontSize: "12px" }}>{d.service}</EmailMuted>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: 600,
                color: "#0c1f17",
              }}
            >
              {serviceName}
            </Text>
          </Column>
        </Row>

        {tierTitle && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted style={{ fontSize: "12px" }}>{d.package}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#0c1f17" }}>
                {tierTitle}
              </Text>
            </Column>
          </Row>
        )}

        {startFormatted && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted style={{ fontSize: "12px" }}>
                {d.scheduledTime}
              </EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#0c1f17",
                  fontWeight: 600,
                }}
              >
                {startFormatted}
              </Text>
            </Column>
          </Row>
        )}

        {kind === "meeting_link" && meetingLink && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted style={{ fontSize: "12px" }}>
                {d.meetingLink}
              </EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#165034",
                  wordBreak: "break-all",
                }}
              >
                {meetingLink}
              </Text>
            </Column>
          </Row>
        )}

        {reason && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted style={{ fontSize: "12px" }}>{d.reason}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#0c1f17" }}>
                {reason}
              </Text>
            </Column>
          </Row>
        )}

        {refundNote && (
          <Row style={{ marginBottom: "4px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted style={{ fontSize: "12px" }}>{d.refund}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#165034",
                  fontWeight: 600,
                }}
              >
                {refundNote}
              </Text>
            </Column>
          </Row>
        )}
      </Section>

      {/* Action Button */}
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={primaryBtnUrl}>{k.cta}</EmailButton>
      </Section>

      {kind === "meeting_link" && (
        <Section style={{ textAlign: "center", marginBottom: "16px" }}>
          <EmailMuted style={{ fontSize: "12px" }}>
            Or view your session details on your{" "}
            <a
              href={manageUrl}
              style={{ color: "#165034", textDecoration: "underline" }}
            >
              booking management page
            </a>
            .
          </EmailMuted>
        </Section>
      )}

      <Hr style={{ borderColor: "#ece5d3", margin: "24px 0" }} />

      <EmailMuted style={{ fontSize: "12px", lineHeight: "18px" }}>
        {d.manageHint}
      </EmailMuted>
    </EmailShell>
  );
}
