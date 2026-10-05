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

export type ReviewRequestItem = {
  productId: string;
  name: string;
  url: string;
};

export type ReviewRequestEmailProps = {
  locale: Locale;
  customerName: string;
  orderNumber: string;
  items: ReviewRequestItem[];
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: (num: string) =>
      `How was your experience with Maa Kali Astuti? (Order ${num})`,
    preview: (num: string) =>
      `We hope your sacred order ${num} has brought peace and blessings. Please share your review.`,
    heading: "Share Your Experience",
    greeting: (name: string) => `Namaste ${name},`,
    intro:
      "A few days ago, your sacred order was delivered. We hope our spiritual items, energized yantras, or holy rudrakshas have brought peace, divine grace, and positive energy into your life.",
    request:
      "Your sincere feedback helps fellow devotees choose their spiritual remedies with confidence, and helps us serve Maa Kali's devotees better.",
    itemsHeading: "Items from your order",
    leaveReview: "Leave a Review",
    footerHint:
      "It only takes a minute to share your thoughts and star rating. Thank you for being a part of our spiritual family.",
  },
  hi: {
    subject: (num: string) =>
      `माँ काली अस्तुति के साथ आपका अनुभव कैसा रहा? (ऑर्डर ${num})`,
    preview: (num: string) =>
      `आशा है कि आपके पवित्र ऑर्डर ${num} से आपके जीवन में सकारात्मक ऊर्जा आई होगी। कृपया अपना अनुभव साझा करें।`,
    heading: "अपना अनुभव साझा करें",
    greeting: (name: string) => `नमस्ते ${name},`,
    intro:
      "कुछ दिन पूर्व आपका पवित्र ऑर्डर आपको प्राप्त हुआ था। हमें आशा है कि माँ काली की कृपा से अभिमंत्रित सामग्री आपके जीवन में सुख, शांति और सकारात्मकता लेकर आई होगी।",
    request:
      "आपकी समीक्षा अन्य साधकों और भक्तों को सही आध्यात्मिक मार्गदर्शन व सामग्री चुनने में सहायता करती है।",
    itemsHeading: "आपके ऑर्डर की वस्तुएं",
    leaveReview: "समीक्षा लिखें",
    footerHint:
      "कृपया एक क्षण निकालकर अपना अनुभव व रेटिंग साझा करें। माँ भगवती आप पर सदैव कृपा बनाए रखें।",
  },
};

export function getReviewRequestSubject(
  locale: Locale,
  orderNumber: string,
): string {
  const d = DICT[locale] ?? DICT.en;
  return d.subject(orderNumber);
}

export function ReviewRequestEmail({
  locale = "en",
  customerName,
  orderNumber,
  items,
  contact,
}: ReviewRequestEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;

  return (
    <EmailShell
      preview={d.preview(orderNumber)}
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

      <EmailText style={{ margin: "0 0 14px 0" }}>
        {d.intro}
      </EmailText>

      <EmailText style={{ margin: "0 0 20px 0" }}>
        {d.request}
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

      {/* Items list */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "8px 16px",
          margin: "0 0 24px 0",
        }}
      >
        {items.map((item, idx) => (
          <Row
            key={item.productId || idx}
            style={{
              padding: "12px 0",
              borderBottom: idx < items.length - 1 ? "1px solid #EAE0CA" : "none",
            }}
          >
            <Column style={{ width: "70%" }}>
              <Text
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#1F2A24",
                }}
              >
                {item.name}
              </Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Link
                href={item.url}
                style={{
                  display: "inline-block",
                  backgroundColor: "#164E3F",
                  color: "#FFFDF8",
                  padding: "6px 12px",
                  borderRadius: "3px",
                  fontSize: "12.5px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                {d.leaveReview}
              </Link>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={{ borderColor: "#EAE0CA", margin: "20px 0" }} />

      <EmailMuted style={{ margin: 0, textAlign: "center" }}>
        {d.footerHint}
      </EmailMuted>
    </EmailShell>
  );
}
