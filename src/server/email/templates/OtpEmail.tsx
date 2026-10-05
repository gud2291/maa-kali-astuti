import "server-only";
import { Section, Text } from "@react-email/components";
import type { Locale, OtpPurpose } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  type ContactEmailInfo,
} from "../components";

export type OtpEmailProps = {
  code: string;
  locale: Locale;
  purpose: OtpPurpose;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: "Your verification code — Maa Kali Astuti",
    preview: (code: string) => `Your verification code is ${code}`,
    titleCustomer: "Sign in to Maa Kali Astuti",
    titleAdmin: "Admin Sign-in",
    body: "Use the 6-digit verification code below to complete your sign-in:",
    expires: "This code expires in 10 minutes.",
    ignore: "If you did not request this code, you can safely ignore this email. No action is required.",
  },
  hi: {
    subject: "आपका सत्यापन कोड — माँ काली अस्तुति",
    preview: (code: string) => `आपका सत्यापन कोड ${code} है`,
    titleCustomer: "माँ काली अस्तुति में साइन-इन करें",
    titleAdmin: "एडमिन साइन-इन",
    body: "अपना साइन-इन पूरा करने के लिए नीचे दिए गए 6 अंकों के सत्यापन कोड का उपयोग करें:",
    expires: "यह कोड 10 मिनट में निष्प्रभावी हो जाएगा।",
    ignore: "यदि आपने इस कोड का अनुरोध नहीं किया है, तो आप इस ईमेल को सुरक्षित रूप से अनदेखा कर सकते हैं।",
  },
};

export function otpSubject(locale: Locale): string {
  return DICT[locale]?.subject ?? DICT.en.subject;
}

export function OtpEmail({
  code,
  locale = "en",
  purpose,
  contact,
}: OtpEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;
  const title = purpose === "admin_login" ? d.titleAdmin : d.titleCustomer;

  return (
    <EmailShell
      preview={d.preview(code)}
      locale={locale}
      contact={contact}
    >
      <Text
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#1F2A24",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: "0 0 16px 0",
          lineHeight: "1.3",
        }}
      >
        {title}
      </Text>

      <EmailText>{d.body}</EmailText>

      {/* Code display */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px dashed #B8923A",
          borderRadius: "4px",
          padding: "18px 12px",
          textAlign: "center",
          margin: "24px 0",
        }}
      >
        <Text
          style={{
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: "34px",
            fontWeight: "bold",
            letterSpacing: "8px",
            color: "#164E3F",
            margin: 0,
            lineHeight: "1.1",
          }}
        >
          {code}
        </Text>
      </Section>

      <EmailText style={{ fontWeight: "600", color: "#164E3F" }}>
        {d.expires}
      </EmailText>

      <EmailMuted>{d.ignore}</EmailMuted>
    </EmailShell>
  );
}

export default OtpEmail;
