import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { Locale, ModeKey } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";

export type BookingRescheduledEmailProps = {
  locale: Locale;
  refCode: string;
  customerName: string;
  serviceName: string;
  tierTitle: string;
  mode: ModeKey;
  modeLabel: string;
  startFormatted?: string | null;
  manageUrl: string;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: (ref: string, svc: string) => `Booking Rescheduled: ${svc} (${ref}) — Maa Kali Astuti`,
    preview: (ref: string) => `Your consultation ${ref} has been rescheduled.`,
    heading: "Consultation Rescheduled",
    greeting: (name: string) => `Namaste ${name},`,
    message:
      "Your consultation session with Sadhak Pawan Pandey has been successfully rescheduled. Below are your updated session details.",
    refCode: "Booking Reference",
    service: "Service",
    package: "Package",
    mode: "Consultation Mode",
    when: "New Scheduled Time",
    prepHeading: "Preparation Reminder",
    prepLive:
      "Please find a quiet, comfortable space 5 minutes prior to your new scheduled time. Keep your birth details and questions ready.",
    linkNotice:
      "Our office will share your video/WhatsApp session link 1 hour before your new scheduled time.",
    manageButton: "View Booking Details",
    attachmentNotice:
      "An updated calendar invite (.ics) has been attached to this email reflecting your new appointment time.",
  },
  hi: {
    subject: (ref: string, svc: string) => `परामर्श समय परिवर्तन: ${svc} (${ref}) — माँ काली स्तुति`,
    preview: (ref: string) => `आपका परामर्श ${ref} नए समय पर निर्धारित कर दिया गया है।`,
    heading: "परामर्श का समय बदला गया",
    greeting: (name: string) => `नमस्ते ${name},`,
    message:
      "साधक पवन पांडे जी के साथ आपके परामर्श का समय सफलतापूर्वक बदल दिया गया है। नीचे आपके नए सत्र का विवरण दिया गया है।",
    refCode: "बुकिंग संदर्भ (Ref)",
    service: "परामर्श",
    package: "पैकेज",
    mode: "परामर्श माध्यम",
    when: "नया निर्धारित समय",
    prepHeading: "सत्र की तैयारी",
    prepLive:
      "कृपया नए निर्धारित समय से 5 मिनट पहले शांत स्थान पर बैठें। अपने जन्म विवरण और प्रश्न तैयार रखें।",
    linkNotice:
      "हमारे कार्यालय द्वारा नए समय से 1 घंटे पहले व्हाट्सएप/वीडियो लिंक भेजा जाएगा।",
    manageButton: "बुकिंग विवरण देखें",
    attachmentNotice:
      "इस ईमेल के साथ एक अपडेटेड कैलेंडर फाइल (.ics) संलग्न है जिससे आप नया समय अपने कैलेंडर में अपडेट कर सकें।",
  },
};

export function BookingRescheduledEmail({
  locale = "en",
  refCode,
  customerName,
  serviceName,
  tierTitle,
  mode: _mode,
  modeLabel,
  startFormatted,
  manageUrl,
  contact,
}: BookingRescheduledEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;

  return (
    <EmailShell
      preview={d.preview(refCode)}
      locale={locale}
      contact={contact}
    >
      <Text
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: "22px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 12px 0",
          lineHeight: "1.3",
        }}
      >
        {d.heading}
      </Text>

      <EmailText style={{ margin: "0 0 8px 0" }}>
        {d.greeting(customerName)}
      </EmailText>

      <EmailText style={{ margin: "0 0 20px 0" }}>
        {d.message}
      </EmailText>

      {/* Details Box */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "0 0 24px 0",
          border: "1px solid #EAE0CA",
        }}
      >
        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{d.refCode}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <Text
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#164E3F",
                margin: 0,
                fontFamily: "monospace",
              }}
            >
              {refCode}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{d.service}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0, fontWeight: "600" }}>
              {serviceName}
            </EmailText>
          </Column>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{d.package}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0 }}>{tierTitle}</EmailText>
          </Column>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{d.mode}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0 }}>{modeLabel}</EmailText>
          </Column>
        </Row>

        <Hr style={{ borderColor: "#EAE0CA", margin: "10px 0" }} />

        <Row>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{d.when}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0, fontWeight: "600", color: "#164E3F" }}>
              {startFormatted ?? "—"}
            </EmailText>
          </Column>
        </Row>
      </Section>

      {/* Preparation instructions */}
      <Text
        style={{
          fontSize: "15px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 6px 0",
        }}
      >
        {d.prepHeading}
      </Text>
      <EmailText style={{ margin: "0 0 12px 0", fontSize: "13.5px" }}>
        {d.prepLive}
      </EmailText>

      <EmailText style={{ margin: "0 0 12px 0", fontSize: "13.5px", color: "#0E3B30", fontWeight: "500" }}>
        {d.linkNotice}
      </EmailText>

      <EmailMuted style={{ margin: "0 0 20px 0", fontSize: "12px", fontStyle: "italic" }}>
        {d.attachmentNotice}
      </EmailMuted>

      {/* Button to manage booking */}
      <Section style={{ textAlign: "center", margin: "24px 0 16px 0" }}>
        <EmailButton href={manageUrl}>
          {d.manageButton}
        </EmailButton>
      </Section>
    </EmailShell>
  );
}

export function getBookingRescheduledSubject(
  locale: Locale,
  refCode: string,
  serviceName: string,
): string {
  const d = DICT[locale] ?? DICT.en;
  return d.subject(refCode, serviceName);
}
