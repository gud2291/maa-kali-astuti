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

export type KundaliReadyEmailProps = {
  locale: Locale;
  refCode: string;
  name: string;
  dob: string;
  place: string;
  reportUrl: string;
  pdfUrl?: string | null;
  hasAttachment?: boolean;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: (name: string) => `Your Vedic Janampatri is Ready — ${name}`,
    preview: (name: string) => `Your comprehensive 28-page Vedic Kundali report for ${name} is ready.`,
    heading: "Vedic Janampatri Ready",
    greeting: (name: string) => `Namaste ${name},`,
    intro:
      "Your sacred 28-page Vedic Janampatri has been generated according to sidereal Lahiri astrology. You can view your full report online or download your complete PDF document below.",
    detailsHeading: "Report Details",
    refCode: "Reference Code",
    fullName: "Name",
    dob: "Date of Birth",
    place: "Birth Place",
    viewOnline: "View Report Online",
    downloadPdf: "Download PDF Report",
    attachedNote: "Your complete 28-page PDF report is also attached to this email for your permanent records.",
    footerNote:
      "Keep this report safe. If you have any questions or wish to book a personalized one-on-one consultation with Sadhak Pawan Pandey Ji, visit our website.",
  },
  hi: {
    subject: (name: string) => `आपकी वैदिक जन्मपत्री तैयार है — ${name}`,
    preview: (name: string) => `${name} जी, आपका 28 पृष्ठों का संपूर्ण वैदिक जन्मपत्री प्रतिवेदन तैयार है।`,
    heading: "वैदिक जन्मपत्री तैयार है",
    greeting: (name: string) => `नमस्ते ${name},`,
    intro:
      "आपकी 28 पृष्ठों की विस्तृत वैदिक जन्मपत्री निरयण लाहिड़ी पद्धति के अनुसार तैयार कर दी गई है। आप अपनी जन्मपत्री ऑनलाइन देख सकते हैं अथवा नीचे दिए गए लिंक से संपूर्ण PDF डाउनलोड कर सकते हैं।",
    detailsHeading: "विवरण",
    refCode: "संदर्भ कोड (Ref)",
    fullName: "नाम",
    dob: "जन्म तिथि",
    place: "जन्म स्थान",
    viewOnline: "ऑनलाइन रिपोर्ट देखें",
    downloadPdf: "PDF रिपोर्ट डाउनलोड करें",
    attachedNote: "आपकी सुविधा के लिए 28 पृष्ठों की संपूर्ण PDF रिपोर्ट इस ईमेल के साथ भी संलग्न है।",
    footerNote:
      "इस प्रतिवेदन को सुरक्षित रखें। यदि आप साधक पवन पांडे जी से व्यक्तिगत परामर्श प्राप्त करना चाहते हैं, तो हमारी वेबसाइट पर पधारें।",
  },
};

export function getKundaliReadySubject(locale: Locale, name: string): string {
  const d = DICT[locale] ?? DICT.en;
  return d.subject(name);
}

export function KundaliReadyEmail({
  locale,
  refCode,
  name,
  dob,
  place,
  reportUrl,
  pdfUrl,
  hasAttachment,
  contact,
}: KundaliReadyEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;

  return (
    <EmailShell
      locale={locale}
      preview={d.preview(name)}
      contact={contact}
    >
      <Section style={{ padding: "0 24px" }}>
        <Text
          style={{
            color: "#164E3F",
            fontSize: "22px",
            lineHeight: "28px",
            fontWeight: 700,
            margin: "0 0 16px 0",
          }}
        >
          {d.heading}
        </Text>

        <EmailText>{d.greeting(name)}</EmailText>
        <EmailText>{d.intro}</EmailText>

        {/* Details Card */}
        <Section
          style={{
            backgroundColor: "#FBF7EE",
            borderRadius: "6px",
            padding: "16px 18px",
            margin: "20px 0",
            border: "1px solid #EAE0CA",
          }}
        >
          <Text
            style={{
              color: "#164E3F",
              fontSize: "13px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              margin: "0 0 12px 0",
            }}
          >
            {d.detailsHeading}
          </Text>

          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted>{d.refCode}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#164E3F" }}>
                {refCode}
              </Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted>{d.fullName}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
                {name}
              </Text>
            </Column>
          </Row>

          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted>{d.dob}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
                {dob}
              </Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: "40%" }}>
              <EmailMuted>{d.place}</EmailMuted>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
                {place}
              </Text>
            </Column>
          </Row>
        </Section>

        {/* Action buttons */}
        <Section style={{ textAlign: "center", margin: "24px 0 16px 0" }}>
          <EmailButton href={reportUrl}>
            {d.viewOnline}
          </EmailButton>

          {pdfUrl && (
            <div style={{ marginTop: "12px" }}>
              <EmailButton href={pdfUrl} style={{ backgroundColor: "#FFFFFF", color: "#1F4D3A", border: "1px solid #1F4D3A" }}>
                {d.downloadPdf}
              </EmailButton>
            </div>
          )}
        </Section>

        {hasAttachment && (
          <EmailText style={{ fontSize: "13px", color: "#7A5C1C", fontStyle: "italic", textAlign: "center" }}>
            📎 {d.attachedNote}
          </EmailText>
        )}

        <Hr style={{ borderColor: "#EAE0CA", margin: "24px 0 16px 0" }} />

        <EmailMuted style={{ fontSize: "12px", lineHeight: "18px" }}>
          {d.footerNote}
        </EmailMuted>
      </Section>
    </EmailShell>
  );
}
