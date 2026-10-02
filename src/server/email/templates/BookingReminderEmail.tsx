import "server-only";
import { Section, Text, Row, Column, Hr, Link } from "@react-email/components";
import type { Locale } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";

export type BookingReminderVariant = "day" | "hour";

export type BookingReminderEmailProps = {
  locale: Locale;
  variant: BookingReminderVariant;
  refCode: string;
  customerName: string;
  serviceName: string;
  tierTitle?: string;
  startFormatted?: string | null;
  modeLabel?: string;
  manageUrl: string;
  meetingLink?: string | null;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    day: {
      subject: (ref: string, svc: string) =>
        `Reminder: Consultation tomorrow — ${svc} (${ref}) — Maa Kali Astuti`,
      preview: (ref: string) =>
        `Reminder: Your consultation ${ref} is scheduled for tomorrow.`,
      heading: "Consultation Tomorrow",
      intro:
        "This is a gentle reminder that your sacred consultation with Sadhak Pawan Pandey is scheduled for tomorrow.",
      cta: "View / Reschedule Session",
    },
    hour: {
      subject: (ref: string, svc: string) =>
        `Starting in 1 hour: Consultation — ${svc} (${ref}) — Maa Kali Astuti`,
      preview: (ref: string) =>
        `Starting in 1 hour: Your consultation ${ref} begins soon.`,
      heading: "Consultation Starting Soon",
      intro:
        "Your consultation with Sadhak Pawan Pandey is starting in approximately 1 hour. Please be prepared in a peaceful setting.",
      cta: "Join Consultation Now",
    },
    greeting: (name: string) => `Namaste ${name},`,
    refCode: "Booking Reference",
    service: "Service",
    package: "Package",
    mode: "Consultation Mode",
    scheduledTime: "Scheduled Time",
    meetingLink: "Meeting Link",
    joinHint:
      "If you are joining via Google Meet or video, click the join button below. If you selected phone or WhatsApp call, Sadhak Ji will call you directly at the scheduled time.",
    prepHeading: "Preparation Tips",
    prepBody:
      "Please find a quiet, comfortable space where you will not be disturbed. Keep your birth details and any questions you wish to ask ready.",
    rescheduleNote:
      "If you need to check details or request assistance, you can view your booking anytime.",
    manageButton: "Manage Booking",
  },
  hi: {
    day: {
      subject: (ref: string, svc: string) =>
        `स्मरण: कल आपका परामर्श — ${svc} (${ref}) — माँ काली स्तुति`,
      preview: (ref: string) =>
        `स्मरण: आपका परामर्श ${ref} कल के लिए निश्चित है।`,
      heading: "कल आपका परामर्श है",
      intro:
        "सादर स्मरण: साधक पवन पांडे जी के साथ आपका परामर्श कल के लिए निश्चित है।",
      cta: "सत्र देखें / समय बदलें",
    },
    hour: {
      subject: (ref: string, svc: string) =>
        `1 घंटे में प्रारंभ: आपका परामर्श — ${svc} (${ref}) — माँ काली स्तुति`,
      preview: (ref: string) =>
        `1 घंटे में प्रारंभ: आपका परामर्श ${ref} जल्द शुरू होगा।`,
      heading: "परामर्श शीघ्र प्रारंभ हो रहा है",
      intro:
        "साधक पवन पांडे जी के साथ आपका परामर्श लगभग 1 घंटे में शुरू होने जा रहा है। कृपया शांत स्थान पर तैयार रहें।",
      cta: "सत्र में अभी जुड़ें",
    },
    greeting: (name: string) => `नमस्ते ${name},`,
    refCode: "बुकिंग संदर्भ (Ref)",
    service: "परामर्श",
    package: "पैकेज",
    mode: "परामर्श माध्यम",
    scheduledTime: "निश्चित समय",
    meetingLink: "मीटिंग लिंक",
    joinHint:
      "यदि आपका सत्र वीडियो कॉल पर है, तो नीचे दिए गए लिंक से जुड़ें। यदि फ़ोन या व्हाट्सएप कॉल चुनी है, तो साधक जी स्वयं आपको कॉल करेंगे।",
    prepHeading: "तैयारी",
    prepBody:
      "कृपया शांत और एकांत स्थान पर बैठें जहाँ कोई व्यवधान न हो। अपनी जन्म तिथि, समय व आवश्यक प्रश्न पास रखें।",
    rescheduleNote:
      "यदि आप बुकिंग संबंधी विवरण देखना चाहते हैं या सहायता चाहते हैं, तो अपनी बुकिंग पृष्ठ पर जा सकते हैं।",
    manageButton: "बुकिंग प्रबंधित करें",
  },
};

export function getBookingReminderSubject(
  locale: Locale,
  variant: BookingReminderVariant,
  refCode: string,
  serviceName: string,
): string {
  const d = DICT[locale] ?? DICT.en;
  return d[variant].subject(refCode, serviceName);
}

export function BookingReminderEmail({
  locale = "en",
  variant,
  refCode,
  customerName,
  serviceName,
  tierTitle,
  startFormatted,
  modeLabel,
  manageUrl,
  meetingLink,
  contact,
}: BookingReminderEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;
  const v = d[variant];

  const primaryCtaUrl = variant === "hour" && meetingLink ? meetingLink : manageUrl;
  const primaryCtaText = variant === "hour" && meetingLink ? v.cta : v.cta;

  return (
    <EmailShell
      preview={v.preview(refCode)}
      locale={locale}
      contact={contact}
    >
      <Text
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#164E3F",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: "0 0 12px 0",
          lineHeight: "1.3",
        }}
      >
        {v.heading}
      </Text>

      <EmailText style={{ margin: "0 0 8px 0" }}>
        {d.greeting(customerName)}
      </EmailText>

      <EmailText style={{ margin: "0 0 20px 0" }}>
        {v.intro}
      </EmailText>

      {/* Booking Details Card */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid "#EAE0CA",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "20px 0",
        }}
      >
        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
              {d.refCode}:
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "bold",
                color: "#1F2A24",
                fontFamily: "monospace",
              }}
            >
              {refCode}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
              {d.service}:
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "13px",
                fontWeight: "600",
                color: "#164E3F",
              }}
            >
              {serviceName}
            </Text>
          </Column>
        </Row>

        {tierTitle && (
          <Row style={{ marginBottom: "10px" }}>
            <Column style={{ width: "40%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
                {d.package}:
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
                {tierTitle}
              </Text>
            </Column>
          </Row>
        )}

        {modeLabel && (
          <Row style={{ marginBottom: "10px" }}>
            <Column style={{ width: "40%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
                {d.mode}:
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
                {modeLabel}
              </Text>
            </Column>
          </Row>
        )}

        {startFormatted && (
          <Row style={{ marginBottom: meetingLink ? "10px" : 0 }}>
            <Column style={{ width: "40%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
                {d.scheduledTime}:
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#B8923A",
                }}
              >
                {startFormatted}
              </Text>
            </Column>
          </Row>
        )}

        {meetingLink && (
          <Row>
            <Column style={{ width: "40%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
                {d.meetingLink}:
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Link
                href={meetingLink}
                style={{
                  fontSize: "13px",
                  color: "#164E3F",
                  textDecoration: "underline",
                  wordBreak: "break-all",
                }}
              >
                {meetingLink}
              </Link>
            </Column>
          </Row>
        )}
      </Section>

      {variant === "hour" && (
        <EmailText style={{ fontSize: "14px", color: "#5A655F", margin: "0 0 20px 0" }}>
          {d.joinHint}
        </EmailText>
      )}

      {variant === "day" && (
        <Section
          style={{
            backgroundColor: "#FFFDF8",
            border: "1px dashed #D9B96A",
            borderRadius: "4px",
            padding: "14px 16px",
            margin: "0 0 20px 0",
          }}
        >
          <Text
            style={{
              margin: "0 0 6px 0",
              fontSize: "13.5px",
              fontWeight: "bold",
              color: "#164E3F",
            }}
          >
            {d.prepHeading}
          </Text>
          <Text
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: "1.5",
              color: "#5A655F",
            }}
          >
            {d.prepBody}
          </Text>
        </Section>
      )}

      {/* Action Buttons */}
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={primaryCtaUrl}>
          {primaryCtaText}
        </EmailButton>
      </Section>

      {variant === "hour" && meetingLink && (
        <Section style={{ textAlign: "center", margin: "0 0 20px 0" }}>
          <Link
            href={manageUrl}
            style={{
              fontSize: "13px",
              color: "#164E3F",
              textDecoration: "underline",
            }}
          >
            {d.manageButton}
          </Link>
        </Section>
      )}

      <Hr style={{ borderColor: "#EAE0CA", margin: "24px 0" }} />

      <EmailMuted style={{ margin: 0, textAlign: "center" }}>
        {d.rescheduleNote}
      </EmailMuted>
    </EmailShell>
  );
}
