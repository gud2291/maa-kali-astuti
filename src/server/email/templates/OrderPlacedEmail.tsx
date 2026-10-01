import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { Locale, PaymentMethod, PaymentStatus } from "@/lib/domain/enums";
import type { ShipAddress } from "@/lib/domain/types";
import { fmt } from "@/lib/core/format";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
  type ContactEmailInfo,
} from "../components";

export type OrderPlacedItem = {
  name: string;
  qty: number;
  priceInr: number;
  lineTotalInr: number;
  variant?: string | null;
  energName?: string | null;
  energGotra?: string | null;
};

export type OrderPlacedEmailProps = {
  locale: Locale;
  number: string;
  orderUrl: string;
  customerName: string;
  items: OrderPlacedItem[];
  totals: {
    items: number;
    energ?: number;
    discount?: number;
    shipping?: number;
    express?: number;
    cod?: number;
    total: number;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shipAddress: ShipAddress;
  energizationOn?: string | null;
  contact?: ContactEmailInfo;
};

const DICT = {
  en: {
    subject: (num: string) => `Order Confirmed: ${num} — Maa Kali Astuti`,
    preview: (num: string) => `Thank you for your order ${num}. Your items are being prepared.`,
    heading: "Order Confirmed",
    greeting: (name: string) => `Namaste ${name},`,
    thankYou: "Thank you for your order. We have received your order details and our team is preparing it with devotion.",
    orderNumber: "Order Number",
    energizationNotice: (date: string) => `Your items will be energized on ${date} during the Mahapuja before dispatch.`,
    itemsHeading: "Ordered Items",
    qty: "Qty",
    subtotal: "Items Subtotal",
    energization: "Energization (Pran Pratishtha)",
    discount: "Discount",
    shipping: "Standard Delivery",
    express: "Express Delivery",
    codFee: "Cash on Delivery Handling",
    total: "Total Amount",
    deliveryAddress: "Delivery Address",
    paymentMethod: "Payment Method",
    cod: "Cash on Delivery (Pending at delivery)",
    online: "Online Payment",
    viewOrder: "View Order Details",
  },
  hi: {
    subject: (num: string) => `ऑर्डर कन्फर्म: ${num} — माँ काली स्तुति`,
    preview: (num: string) => `आपके ऑर्डर ${num} के लिए धन्यवाद। आपकी वस्तुएं तैयार की जा रही हैं।`,
    heading: "ऑर्डर कन्फर्म हुआ",
    greeting: (name: string) => `नमस्ते ${name},`,
    thankYou: "आपके ऑर्डर के लिए धन्यवाद। हमें आपके ऑर्डर का विवरण प्राप्त हो गया है और हमारी टीम इसे पूर्ण श्रद्धा के साथ तैयार कर रही है।",
    orderNumber: "ऑर्डर संख्या",
    energizationNotice: (date: string) => `प्रेषण से पहले आपके सामान को महापूजा के दौरान ${date} को सिद्ध (अभिमंत्रित) किया जाएगा।`,
    itemsHeading: "ऑर्डर की गई वस्तुएं",
    qty: "मात्रा",
    subtotal: "वस्तुओं का मूल्य",
    energization: "प्राण प्रतिष्ठा (अभिमंत्रण)",
    discount: "छूट",
    shipping: "सामान्य डिलीवरी",
    express: "एक्सप्रेस डिलीवरी",
    codFee: "कैश ऑन डिलीवरी शुल्क",
    total: "कुल राशि",
    deliveryAddress: "डिलीवरी का पता",
    paymentMethod: "भुगतान का प्रकार",
    cod: "कैश ऑन डिलीवरी (डिलीवरी के समय देय)",
    online: "ऑनलाइन भुगतान",
    viewOrder: "ऑर्डर का विवरण देखें",
  },
};

export function orderPlacedSubject(locale: Locale, number: string): string {
  const d = DICT[locale] ?? DICT.en;
  return d.subject(number);
}

export function OrderPlacedEmail({
  locale = "en",
  number,
  orderUrl,
  customerName,
  items,
  totals,
  paymentMethod,
  paymentStatus,
  shipAddress,
  energizationOn,
  contact,
}: OrderPlacedEmailProps): React.JSX.Element {
  const d = DICT[locale] ?? DICT.en;

  return (
    <EmailShell
      preview={d.preview(number)}
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
          margin: "0 0 12px 0",
          lineHeight: "1.3",
        }}
      >
        {d.heading}
      </Text>

      <EmailText style={{ fontWeight: "600", fontSize: "16px", color: "#1F2A24", margin: "0 0 8px 0" }}>
        {d.greeting(customerName)}
      </EmailText>

      <EmailText>{d.thankYou}</EmailText>

      {/* Order number badge */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "12px 16px",
          margin: "16px 0",
        }}
      >
        <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
          {d.orderNumber}: <span style={{ fontWeight: "bold", color: "#1F2A24" }}>{number}</span>
        </Text>
      </Section>

      {/* Energization Notice */}
      {energizationOn && (
        <Section
          style={{
            backgroundColor: "#FFF8EA",
            borderLeft: "3px solid #B8923A",
            padding: "10px 14px",
            margin: "16px 0",
          }}
        >
          <Text
            style={{
              margin: 0,
              fontSize: "13.5px",
              color: "#7A5C1C",
              lineHeight: "1.4",
            }}
          >
            {d.energizationNotice(energizationOn)}
          </Text>
        </Section>
      )}

      {/* Items list */}
      <Text
        style={{
          fontSize: "15px",
          fontWeight: "bold",
          color: "#1F2A24",
          margin: "24px 0 12px 0",
          borderBottom: "1px solid #EAE0CA",
          paddingBottom: "6px",
        }}
      >
        {d.itemsHeading}
      </Text>

      {items.map((item, idx) => (
        <Section key={idx} style={{ marginBottom: "12px" }}>
          <Row>
            <Column style={{ width: "75%" }}>
              <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
                {item.name}
              </Text>
              {(item.variant || item.energName) && (
                <Text style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#5A655F" }}>
                  {item.variant && `Size: ${item.variant}`}
                  {item.variant && item.energName && " · "}
                  {item.energName && `Sankalp: ${item.energName} (${item.energGotra || "Kashyap"})`}
                </Text>
              )}
              <Text style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "#5A655F" }}>
                {d.qty}: {item.qty} × {fmt(item.priceInr)}
              </Text>
            </Column>
            <Column style={{ width: "25%", textAlign: "right" }}>
              <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
                {fmt(item.lineTotalInr)}
              </Text>
            </Column>
          </Row>
        </Section>
      ))}

      <Hr style={{ borderColor: "#EAE0CA", margin: "16px 0" }} />

      {/* Totals */}
      <Section style={{ margin: "12px 0" }}>
        <Row style={{ marginBottom: "6px" }}>
          <Column style={{ width: "70%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>{d.subtotal}</Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>{fmt(totals.items)}</Text>
          </Column>
        </Row>

        {totals.energ != null && totals.energ > 0 && (
          <Row style={{ marginBottom: "6px" }}>
            <Column style={{ width: "70%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>{d.energization}</Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>{fmt(totals.energ)}</Text>
            </Column>
          </Row>
        )}

        {totals.discount != null && totals.discount > 0 && (
          <Row style={{ marginBottom: "6px" }}>
            <Column style={{ width: "70%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#A8322D" }}>{d.discount}</Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#A8322D" }}>−{fmt(totals.discount)}</Text>
            </Column>
          </Row>
        )}

        <Row style={{ marginBottom: "6px" }}>
          <Column style={{ width: "70%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
              {totals.express != null && totals.express > 0 ? d.express : d.shipping}
            </Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
              {totals.shipping === 0 && (!totals.express || totals.express === 0)
                ? (locale === "hi" ? "मुफ़्त" : "FREE")
                : fmt((totals.shipping || 0) + (totals.express || 0))}
            </Text>
          </Column>
        </Row>

        {totals.cod != null && totals.cod > 0 && (
          <Row style={{ marginBottom: "6px" }}>
            <Column style={{ width: "70%" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>{d.codFee}</Text>
            </Column>
            <Column style={{ width: "30%", textAlign: "right" }}>
              <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>{fmt(totals.cod)}</Text>
            </Column>
          </Row>
        )}

        <Hr style={{ borderColor: "#B8923A", margin: "8px 0" }} />

        <Row>
          <Column style={{ width: "70%" }}>
            <Text style={{ margin: 0, fontSize: "15px", fontWeight: "bold", color: "#1F2A24" }}>{d.total}</Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" }}>
            <Text style={{ margin: 0, fontSize: "16px", fontWeight: "bold", color: "#164E3F" }}>{fmt(totals.total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Address & Payment Info */}
      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "14px 16px",
          margin: "20px 0",
        }}
      >
        <Text style={{ margin: "0 0 6px 0", fontSize: "13px", fontWeight: "bold", color: "#1F2A24" }}>
          {d.deliveryAddress}
        </Text>
        <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F", lineHeight: "1.5" }}>
          {shipAddress.name}<br />
          {shipAddress.line1}{shipAddress.line2 ? `, ${shipAddress.line2}` : ""}<br />
          {shipAddress.landmark ? `${shipAddress.landmark}, ` : ""}{shipAddress.city}, {shipAddress.state} — {shipAddress.pincode}<br />
          Phone: {shipAddress.phone}
        </Text>

        <Hr style={{ borderColor: "#EAE0CA", margin: "10px 0" }} />

        <Text style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "bold", color: "#1F2A24" }}>
          {d.paymentMethod}
        </Text>
        <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>
          {paymentMethod === "cod" ? d.cod : `${d.online} (${paymentStatus})`}
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", margin: "24px 0 12px 0" }}>
        <EmailButton href={orderUrl}>
          {d.viewOrder}
        </EmailButton>
      </Section>

      <EmailMuted style={{ textAlign: "center", marginTop: "16px" }}>
        {locale === "hi"
          ? "यदि आपका कोई प्रश्न है, तो बेझिझक इस ईमेल का उत्तर दें।"
          : "If you have any questions, feel free to reply to this email."}
      </EmailMuted>
    </EmailShell>
  );
}

export default OrderPlacedEmail;
