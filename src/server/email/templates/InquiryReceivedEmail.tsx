import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { InquiryKind, Locale } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";
import { waLink, waLinkTo } from "@/lib/core/commerce";

export type InquiryReceivedEmailProps = {
  locale: Locale;
  refCode: string;
  customerName: string;
  kind: InquiryKind;
  targetTitle: string;
  langPref: string;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: (ref: string, title: string) => `Inquiry Received: ${title} (${ref}) — Maa Kali Astuti`,
    preview: (ref: string) => `Your inquiry ${ref} has been received. Our team will contact you shortly.`,
    heading: "Inquiry Received",
    greeting: (name: string) => `Pranam ${name},`,
    thankYou:
      "Thank you for reaching out to Maa Kali Astuti. We have received your inquiry and our office will review it with utmost care.",
    refCode: "Reference Number",
    inquiryType: "Inquiry Type",
    course: "Sadhana Course",
    ritual: "Special Ritual / Anushthan",
    subjectLabel: "Subject",
    callLang: "Preferred Language",
    nextHeading: "What Happens Next",
    nextText:
      "Sadhak Ji's team personally reviews every inquiry. You will receive a WhatsApp message or call from our office within two working days to discuss your path, understand your requirements, and answer any questions.",
    whatsappCta: "Message on WhatsApp",
  },
  hi: {
    subject: (ref: string, title: string) => `पूछताछ प्राप्त हुई: ${title} (${ref}) — माँ काली स्तुति`,
    preview: (ref: string) => `आपकी पूछताछ ${ref} प्राप्त हो गई है। हमारी टीम शीघ्र ही आपसे संपर्क करेगी।`,
    heading: "पूछताछ प्राप्त हुई",
    greeting: (name: string) => `प्रणाम ${name},`,
    thankYou:
      "माँ काली स्तुति से संपर्क करने के लिए धन्यवाद। आपका अनुरोध प्राप्त हो गया है और हमारा कार्यालय इसका ध्यानपूर्वक अध्ययन करेगा।",
    refCode: "संदर्भ संख्या (Ref)",
    inquiryType: "पूछताछ का प्रकार",
    course: "साधना पाठ्यक्रम",
    ritual: "विशेष अनुष्ठान",
    subjectLabel: "विषय",
    callLang: "वार्ता की भाषा",
    nextHeading: "आगे क्या होगा?",
    nextText:
      "साधक जी की टीम प्रत्येक पूछताछ का व्यक्तिगत रूप से अध्ययन करती है। आपकी आवश्यकता को समझने और मार्गदर्शन हेतु दो कार्य दिवसों के भीतर हमारे कार्यालय से व्हाट्सएप संदेश या कॉल प्राप्त होगी।",
    whatsappCta: "व्हाट्सएप पर संपर्क करें",
  },
};

export function InquiryReceivedEmail({
  locale = "en",
  refCode,
  customerName,
  kind,
  targetTitle,
  langPref,
  contact,
}: InquiryReceivedEmailProps): React.JSX.Element {
  const d = DICT[locale] || DICT.en;

  return (
    <EmailShell
      preview={d.preview(refCode)}
      locale={locale}
      contact={contact}
    >
      <Text
        style={{
          fontSize: "22px",
          fontWeight: "bold",
          color: "#164E3F",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: "0 0 14px 0",
          lineHeight: "1.25",
        }}
      >
        {d.heading}
      </Text>

      <EmailText style={{ fontSize: "16px", fontWeight: "600", color: "#164E3F" }}>
        {d.greeting(customerName)}
      </EmailText>

      <EmailText>{d.thankYou}</EmailText>

      {/* Details Box */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "20px 0",
        }}
      >
        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted style={{ margin: 0, fontSize: "12px" }}>{d.refCode}</EmailMuted>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "700",
                color: "#164E3F",
                fontFamily: "monospace",
              }}
            >
              {refCode}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted style={{ margin: 0, fontSize: "12px" }}>{d.inquiryType}</EmailMuted>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13.5px", fontWeight: "600", color: "#1F2A24" }}>
              {kind === "course" ? d.course : d.ritual}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "10px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted style={{ margin: 0, fontSize: "12px" }}>{d.subjectLabel}</EmailMuted>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13.5px", fontWeight: "600", color: "#1F2A24" }}>
              {targetTitle}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: "40%" }}>
            <EmailMuted style={{ margin: 0, fontSize: "12px" }}>{d.callLang}</EmailMuted>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13.5px", fontWeight: "500", color: "#1F2A24" }}>
              {langPref}
            </Text>
          </Column>
        </Row>
      </Section>

      <Hr
        style={{
          borderColor: "#EAE0CA",
          borderWidth: "1px",
          borderStyle: "solid",
          margin: "24px 0",
        }}
      />

      {/* Next steps */}
      <Text
        style={{
          fontSize: "16px",
          fontWeight: "600",
          color: "#164E3F",
          margin: "0 0 8px 0",
        }}
      >
        {d.nextHeading}
      </Text>

      <EmailText style={{ fontSize: "14px", lineHeight: "1.6" }}>
        {d.nextText}
      </EmailText>

      <Section style={{ textAlign: "center", margin: "28px 0 10px 0" }}>
        <EmailButton href={contact?.whatsapp ? waLinkTo(contact.whatsapp) : waLink()}>
          {d.whatsappCta}
        </EmailButton>
      </Section>
    </EmailShell>
  );
}
