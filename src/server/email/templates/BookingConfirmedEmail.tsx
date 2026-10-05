import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { Locale, ModeKey } from "@/lib/domain/enums";
import { fmt } from "@/lib/core/format";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";

export type BookingConfirmedEmailProps = {
  locale: Locale;
  refCode: string;
  customerName: string;
  serviceName: string;
  tierTitle: string;
  mode: ModeKey;
  modeLabel: string;
  startFormatted?: string | null;
  isReport: boolean;
  priceInr: number;
  manageUrl: string;
  rescheduleMinHours: number;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: (ref: string, svc: string) => `Booking Confirmed: ${svc} (${ref}) — Maa Kali Astuti`,
    preview: (ref: string) => `Your consultation booking ${ref} is confirmed.`,
    heading: "Consultation Confirmed",
    greeting: (name: string) => `Namaste ${name},`,
    thankYou: "Your sacred consultation with Sadhak Pawan Pandey has been confirmed. Below are your session details.",
    refCode: "Booking Reference",
    service: "Service",
    package: "Package",
    mode: "Consultation Mode",
    when: "Scheduled Time",
    deliveryReport: "Delivery Time",
    deliveryReportText: "Your detailed written report will be delivered via WhatsApp and email within 48 hours.",
    price: "Amount Paid",
    prepHeading: "What to Keep Ready",
    prepLive: "Please find a quiet, comfortable space 5 minutes prior to the session. Keep your birth details and any questions you wish to ask ready.",
    prepReport: "Sadhak Ji will carefully analyze your chart and questions to prepare your personalized remedies and guidance.",
    linkNotice: "Our office will share your video/WhatsApp session link 1 hour before your scheduled time.",
    reschedulePolicy: (hours: number) => `Need to reschedule? You can reschedule your session once up to ${hours} hours before your scheduled time.`,
    manageButton: "Manage Booking",
    attachmentNotice: "A calendar invite (.ics) has been attached to this email so you can add this session to your calendar.",
  },
  hi: {
    subject: (ref: string, svc: string) => `परामर्श निश्चित: ${svc} (${ref}) — माँ काली अस्तुति`,
    preview: (ref: string) => `आपका परामर्श ${ref} निश्चित हो गया है।`,
    heading: "परामर्श निश्चित हुआ",
    greeting: (name: string) => `नमस्ते ${name},`,
    thankYou: "साधक पवन पांडे जी के साथ आपका परामर्श निश्चित हो गया है। नीचे आपके सत्र का विवरण दिया गया है।",
    refCode: "बुकिंग संदर्भ (Ref)",
    service: "परामर्श",
    package: "पैकेज",
    mode: "परामर्श माध्यम",
    when: "निश्चित समय",
    deliveryReport: "रिपोर्ट प्राप्ति",
    deliveryReportText: "आपकी विस्तृत लिखित रिपोर्ट 48 घंटों के भीतर व्हाट्सएप और ईमेल पर भेज दी जाएगी।",
    price: "भुगतान की गई राशि",
    prepHeading: "तैयारी",
    prepLive: "कृपया सत्र से 5 मिनट पहले शांत स्थान पर बैठें। अपने जन्म विवरण और प्रश्न तैयार रखें।",
    prepReport: "साधक जी आपकी कुंडली और प्रश्नों का गहन अध्ययन करके आपका मार्गदर्शन तैयार करेंगे।",
    linkNotice: "हमारे कार्यालय द्वारा सत्र से 1 घंटे पहले व्हाट्सएप/वीडियो लिंक भेजा जाएगा।",
    reschedulePolicy: (hours: number) => `समय बदलना चाहते हैं? आप सत्र से ${hours} घंटे पहले तक एक बार अपना समय बदल सकते हैं।`,
    manageButton: "बुकिंग प्रबंधित करें",
    attachmentNotice: "इस ईमेल के साथ एक कैलेंडर फाइल (.ics) संलग्न की गई है जिससे आप इसे अपने कैलेंडर में जोड़ सकते हैं।",
  },
};

export function BookingConfirmedEmail({
  locale = "en",
  refCode,
  customerName,
  serviceName,
  tierTitle,
  mode,
  modeLabel,
  startFormatted,
  isReport,
  priceInr,
  manageUrl,
  rescheduleMinHours,
  contact,
}: BookingConfirmedEmailProps): React.JSX.Element {
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
        {d.thankYou}
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

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{isReport ? d.deliveryReport : d.when}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0, fontWeight: "600", color: "#164E3F" }}>
              {isReport ? d.deliveryReportText : (startFormatted ?? "—")}
            </EmailText>
          </Column>
        </Row>

        <Hr style={{ borderColor: "#EAE0CA", margin: "10px 0" }} />

        <Row>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{d.price}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <Text
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#164E3F",
                margin: 0,
              }}
            >
              {fmt(priceInr)}
            </Text>
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
        {isReport ? d.prepReport : d.prepLive}
      </EmailText>

      {!isReport && (
        <EmailText style={{ margin: "0 0 12px 0", fontSize: "13.5px", color: "#0E3B30", fontWeight: "500" }}>
          {d.linkNotice}
        </EmailText>
      )}

      {!isReport && (
        <EmailMuted style={{ margin: "0 0 16px 0", fontSize: "12.5px" }}>
          {d.reschedulePolicy(rescheduleMinHours)}
        </EmailMuted>
      )}

      {!isReport && (
        <EmailMuted style={{ margin: "0 0 20px 0", fontSize: "12px", fontStyle: "italic" }}>
          {d.attachmentNotice}
        </EmailMuted>
      )}

      {/* Button to manage booking */}
      <Section style={{ textAlign: "center", margin: "24px 0 16px 0" }}>
        <EmailButton href={manageUrl}>
          {d.manageButton}
        </EmailButton>
      </Section>
    </EmailShell>
  );
}

export function getBookingConfirmedSubject(
  locale: Locale,
  refCode: string,
  serviceName: string,
): string {
  const d = DICT[locale] ?? DICT.en;
  return d.subject(refCode, serviceName);
}
