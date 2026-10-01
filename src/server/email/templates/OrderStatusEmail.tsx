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

export type OrderStatusEmailProps = {
  locale: Locale;
  number: string;
  customerName: string;
  status: string;
  orderUrl: string;
  energizationOn?: string | null;
  courier?: string | null;
  awb?: string | null;
  trackingUrl?: string | null;
  refundAmountInr?: number | null;
  contact?: ContactEmailInfo;
};

type StatusCopy = {
  subject: string;
  preview: string;
  heading: string;
  message: string;
};

export function getStatusCopy(
  locale: Locale,
  number: string,
  status: string,
  params: {
    energizationOn?: string | null;
    courier?: string | null;
    awb?: string | null;
    refundAmountInr?: number | null;
  },
): StatusCopy {
  const isHi = locale === "hi";

  switch (status) {
    case "energizing":
      return {
        subject: isHi
          ? `ऑर्डर ${number} — प्राण प्रतिष्ठा अनुष्ठान निर्धारित`
          : `Order ${number} — Energization Scheduled`,
        preview: isHi
          ? `आपके ऑर्डर की सामग्री के लिए वैदिक प्राण प्रतिष्ठा अनुष्ठान निर्धारित कर दिया गया है।`
          : `Your sacred items have been scheduled for Vedic energization.`,
        heading: isHi ? "प्राण-प्रतिष्ठा निर्धारित" : "Energization Scheduled",
        message: isHi
          ? `आपकी पवित्र सामग्री ${params.energizationOn || "शीघ्र"} को महापूजा के दौरान वैदिक प्राण-प्रतिष्ठा (अभिमंत्रण) हेतु निर्धारित की गई है। साधक पवन पाण्डेय जी द्वारा विधिवत संकल्प एवं अनुष्ठान संपन्न किया जाएगा।`
          : `Your sacred items are scheduled for Vedic energization (pran-pratishtha) on ${params.energizationOn || "the upcoming auspicious date"} during the sacred Mahapuja.`,
      };

    case "packed":
      return {
        subject: isHi
          ? `ऑर्डर ${number} — पैक हो गया है एवं भेजने के लिए तैयार है`
          : `Order ${number} — Packed & Ready to Ship`,
        preview: isHi
          ? `आपका ऑर्डर पूर्ण पवित्रता के साथ पैक कर दिया गया है।`
          : `Your order has been carefully packed with devotion and is ready for dispatch.`,
        heading: isHi ? "ऑर्डर पैक हो गया है" : "Order Packed",
        message: isHi
          ? `आपका ऑर्डर पूर्ण पवित्रता एवं सावधानी के साथ पैक कर दिया गया है और शीघ्र ही कूरियर पार्टनर को सौंपा जाएगा।`
          : `Your order has been carefully packaged with sacred care and devotion, and will be handed over to our delivery courier shortly.`,
      };

    case "shipped":
      return {
        subject: isHi
          ? `ऑर्डर ${number} — रवाना कर दिया गया है (${params.courier || "कूरियर"})`
          : `Order ${number} — Dispatched via ${params.courier || "Courier"}`,
        preview: isHi
          ? `आपका पवित्र पार्सल कूरियर द्वारा रवाना कर दिया गया है।`
          : `Your sacred parcel has been dispatched and is on its way.`,
        heading: isHi ? "ऑर्डर रवाना हो चुका है" : "Order Dispatched",
        message: isHi
          ? `आपका पवित्र पार्सल ${params.courier || "कूरियर"} के माध्यम से भेज दिया गया है। ट्रैकिंग संख्या (AWB): ${params.awb || "शीघ्र उपलब्ध होगी"}।`
          : `Your sacred parcel is on its way to you via ${params.courier || "our courier partner"}. AWB / Tracking Number: ${params.awb || "Pending"}`,
      };

    case "delivered":
      return {
        subject: isHi
          ? `ऑर्डर ${number} — सफलतापूर्वक वितरित`
          : `Order ${number} — Delivered`,
        preview: isHi
          ? `आपका ऑर्डर सफलतापूर्वक वितरित हो चुका है।`
          : `Your sacred parcel has been delivered. May Maa Kali bless you.`,
        heading: isHi ? "ऑर्डर डिलीवर हो गया है" : "Order Delivered",
        message: isHi
          ? `आपका ऑर्डर सफलतापूर्वक वितरित हो चुका है। माँ काली की दिव्य कृपा, रक्षा एवं आशीर्वाद आपके घर-परिवार में सुख-समृद्धि लाए।`
          : `Your order has been marked as delivered. May Maa Kali's divine grace bring protection, peace, and prosperity to your household.`,
      };

    case "cancelled":
      return {
        subject: isHi
          ? `ऑर्डर ${number} — रद्द कर दिया गया`
          : `Order ${number} — Cancelled`,
        preview: isHi
          ? `आपका ऑर्डर रद्द कर दिया गया है।`
          : `Your order has been cancelled.`,
        heading: isHi ? "ऑर्डर रद्द हुआ" : "Order Cancelled",
        message: isHi
          ? `आपका ऑर्डर ${number} रद्द कर दिया गया है। किसी भी सहायता के लिए कृपया हमारी सहायता टीम से संपर्क करें।`
          : `Your order ${number} has been cancelled. If you need any assistance or have questions, please reach out to our support team.`,
      };

    case "refund_processed":
      return {
        subject: isHi
          ? `ऑर्डर ${number} — धनवापसी (रिफंड) संपन्न`
          : `Order ${number} — Refund Processed`,
        preview: isHi
          ? `आपके ऑर्डर के लिए रिफंड सफलतापूर्वक पूरा कर दिया गया है।`
          : `A refund has been processed for your order.`,
        heading: isHi ? "रिफंड संपन्न हुआ" : "Refund Processed",
        message: isHi
          ? `आपके ऑर्डर के लिए ₹${params.refundAmountInr || ""} की धनवापसी (रिफंड) सफलतापूर्वक पूरी कर दी गई है। यह राशि 5-7 कार्य दिवसों में आपके खाते में आ जाएगी।`
          : `A refund of ₹${params.refundAmountInr || ""} has been successfully processed for your order. It typically reflects in your bank account or original payment method within 5–7 business days.`,
      };

    default:
      return {
        subject: isHi
          ? `ऑर्डर ${number} अपडेट`
          : `Order ${number} Status Update`,
        preview: isHi
          ? `आपके ऑर्डर की स्थिति अपडेट की गई है।`
          : `Your order status has been updated.`,
        heading: isHi ? "ऑर्डर अपडेट" : "Order Update",
        message: isHi
          ? `आपके ऑर्डर ${number} की स्थिति अपडेट कर दी गई है: ${status}।`
          : `Your order ${number} has been updated to status: ${status}.`,
      };
  }
}

export function orderStatusSubject(
  locale: Locale,
  number: string,
  status: string,
  params: {
    energizationOn?: string | null;
    courier?: string | null;
    awb?: string | null;
    refundAmountInr?: number | null;
  } = {},
): string {
  const copy = getStatusCopy(locale, number, status, params);
  return copy.subject;
}

export function OrderStatusEmail({
  locale,
  number,
  customerName,
  status,
  orderUrl,
  energizationOn,
  courier,
  awb,
  trackingUrl,
  refundAmountInr,
  contact,
}: OrderStatusEmailProps): React.JSX.Element {
  const copy = getStatusCopy(locale, number, status, {
    energizationOn,
    courier,
    awb,
    refundAmountInr,
  });

  const isHi = locale === "hi";

  return (
    <EmailShell preview={copy.preview} locale={locale} contact={contact}>
      {/* Heading */}
      <Text
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: "20px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 12px 0",
          textAlign: "center",
        }}
      >
        {copy.heading}
      </Text>

      {/* Greeting */}
      <EmailText style={{ fontSize: "15px", marginBottom: "8px" }}>
        {isHi ? `नमस्ते ${customerName},` : `Namaste ${customerName},`}
      </EmailText>

      {/* Message */}
      <EmailText style={{ lineHeight: "1.6", color: "#2E3D35" }}>
        {copy.message}
      </EmailText>

      {/* Order Info Bar */}
      <Section
        style={{
          backgroundColor: "#F4EFE6",
          borderRadius: "4px",
          padding: "12px 16px",
          margin: "20px 0",
          border: "1px solid #EAE0CA",
        }}
      >
        <Row>
          <Column>
            <EmailMuted style={{ fontSize: "11px", textTransform: "uppercase" }}>
              {isHi ? "ऑर्डर संख्या" : "Order Number"}
            </EmailMuted>
            <Text
              style={{
                fontFamily: "monospace",
                fontWeight: "bold",
                color: "#164E3F",
                fontSize: "14px",
                margin: "2px 0 0 0",
              }}
            >
              {number}
            </Text>
          </Column>
          {status === "shipped" && awb && (
            <Column style={{ textAlign: "right" }}>
              <EmailMuted
                style={{ fontSize: "11px", textTransform: "uppercase" }}
              >
                {isHi ? "ट्रैकिंग AWB" : "Tracking AWB"}
              </EmailMuted>
              <Text
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#164E3F",
                  fontSize: "14px",
                  margin: "2px 0 0 0",
                }}
              >
                {awb}
              </Text>
            </Column>
          )}
        </Row>
      </Section>

      {/* Shipped tracking action */}
      {status === "shipped" && trackingUrl && (
        <Section style={{ textAlign: "center", margin: "16px 0" }}>
          <Link
            href={trackingUrl}
            target="_blank"
            style={{
              display: "inline-block",
              backgroundColor: "#D9B96A",
              color: "#164E3F",
              fontWeight: "bold",
              fontSize: "14px",
              padding: "10px 20px",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            {isHi ? "पार्सल ट्रैक करें" : "Track Shipment Online"}
          </Link>
        </Section>
      )}

      {/* View Order Button */}
      <Section style={{ textAlign: "center", margin: "24px 0 12px 0" }}>
        <EmailButton href={orderUrl}>
          {isHi ? "ऑर्डर का विवरण देखें" : "View Order Details"}
        </EmailButton>
      </Section>

      <Hr
        style={{
          borderColor: "#EAE0CA",
          borderWidth: "1px",
          borderStyle: "solid",
          margin: "24px 0 16px 0",
        }}
      />

      <EmailMuted style={{ fontSize: "12px", textAlign: "center" }}>
        {isHi
          ? "यदि आपका कोई प्रश्न है, तो बेझिझक इस ईमेल का उत्तर दें।"
          : "If you have any questions or need guidance, reply directly to this email."}
      </EmailMuted>
    </EmailShell>
  );
}
