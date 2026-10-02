import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { Locale } from "@/lib/domain/enums";
import { fmt } from "@/lib/core/format";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";

export type AbandonedCheckoutLine = {
  name: string;
  qty: number;
  priceInr: number;
};

export type AbandonedCheckoutEmailProps = {
  locale: Locale;
  customerName?: string | null;
  lines: AbandonedCheckoutLine[];
  totalInr: number;
  cartUrl: string;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: "You left something sacred in your cart — Maa Kali Astuti",
    preview: "Your cart is saved. Complete your order today to reserve your sacred items.",
    heading: "Complete Your Order",
    greeting: (name?: string | null) => (name ? `Namaste ${name},` : "Namaste,"),
    intro:
      "We noticed you started selecting sacred items on our storefront but didn't finish your checkout. We have saved your cart so you can easily pick up right where you left off.",
    itemsHeading: "Items in your cart",
    qty: "Qty",
    total: "Total Estimate",
    cta: "Complete Your Order",
    supportNote:
      "All spiritual items and yantras are personally checked and energized before dispatch. If you faced any issues during payment or checkout, please let our team know.",
  },
  hi: {
    subject: "आपकी टोकरी में कुछ पवित्र वस्तुएं रह गई हैं — माँ काली स्तुति",
    preview: "आपकी टोकरी सुरक्षित है। अपना पवित्र ऑर्डर आज ही पूरा करें।",
    heading: "अपना ऑर्डर पूरा करें",
    greeting: (name?: string | null) => (name ? `नमस्ते ${name},` : "नमस्ते,"),
    intro:
      "हमने देखा कि आपने माँ काली स्तुति से कुछ पवित्र वस्तुएं चुनी थीं, परंतु ऑर्डर पूरा नहीं हुआ। आपकी चुनी हुई वस्तुएं सुरक्षित हैं, आप आसानी से अपना ऑर्डर पूरा कर सकते हैं।",
    itemsHeading: "आपकी टोकरी की वस्तुएं",
    qty: "मात्रा",
    total: "कुल राशि",
    cta: "ऑर्डर अभी पूरा करें",
    supportNote:
      "सभी यंत्र, रुद्राक्ष एवं पूजन सामग्री प्रेषण से पूर्व विधिवत अभिमंत्रित की जाती हैं। यदि भुगतान में कोई समस्या आई हो तो कृपया हमसे संपर्क करें।",
  },
};

export function getAbandonedCheckoutSubject(locale: Locale): string {
  const d = DICT[locale] ?? DICT.en;
  return d.subject;
}

export function AbandonedCheckoutEmail({
  locale = "en",
  customerName,
  lines,
  totalInr,
  cartUrl,
  contact,
}: AbandonedCheckoutEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;

  return (
    <EmailShell
      preview={d.preview}
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
        {d.heading}
      </Text>

      <EmailText style={{ margin: "0 0 8px 0" }}>
        {d.greeting(customerName)}
      </EmailText>

      <EmailText style={{ margin: "0 0 20px 0" }}>
        {d.intro}
      </EmailText>

      <Text
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 12px 0",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {d.itemsHeading}
      </Text>

      {/* Cart Summary Card */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "0 0 24px 0",
        }}
      >
        {lines.map((line, idx) => (
          <Row
            key={idx}
            style={{
              padding: "10px 0",
              borderBottom: idx < lines.length - 1 ? "1px solid #EAE0CA" : "none",
            }}
          >
            <Column style={{ width: "65%" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  fontWeight: "600",
                  color: "#1F2A24",
                }}
              >
                {line.name}
              </Text>
              <Text
                style={{
                  margin: "2px 0 0 0",
                  fontSize: "12px",
                  color: "#5A655F",
                }}
              >
                {d.qty}: {line.qty}
              </Text>
            </Column>
            <Column style={{ width: "35%", textAlign: "right" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  fontWeight: "bold",
                  color: "#164E3F",
                }}
              >
                {fmt(line.priceInr * line.qty)}
              </Text>
            </Column>
          </Row>
        ))}

        <Row style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1.5px solid #B8923A" }}>
          <Column style={{ width: "65%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "bold",
                color: "#1F2A24",
              }}
            >
              {d.total}:
            </Text>
          </Column>
          <Column style={{ width: "35%", textAlign: "right" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "16px",
                fontWeight: "bold",
                color: "#164E3F",
              }}
            >
              {fmt(totalInr)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Complete Order Button */}
      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={cartUrl}>
          {d.cta}
        </EmailButton>
      </Section>

      <Hr style={{ borderColor: "#EAE0CA", margin: "24px 0" }} />

      <EmailMuted style={{ margin: 0, textAlign: "center" }}>
        {d.supportNote}
      </EmailMuted>
    </EmailShell>
  );
}
