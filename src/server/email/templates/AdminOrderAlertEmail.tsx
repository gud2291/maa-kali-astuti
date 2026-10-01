import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { PaymentMethod, PaymentStatus } from "@/lib/domain/enums";
import { fmt } from "@/lib/core/format";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
} from "../components";

export type AdminOrderAlertEmailProps = {
  number: string;
  orderId: number;
  totalInr: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  itemCount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  adminUrl: string;
};

export function AdminOrderAlertEmail({
  number,
  totalInr,
  paymentMethod,
  paymentStatus,
  itemCount,
  customerName,
  customerPhone,
  customerEmail,
  adminUrl,
}: AdminOrderAlertEmailProps): React.JSX.Element {
  return (
    <EmailShell
      preview={`New Order Placed: ${number} · ₹${totalInr}`}
      locale="en"
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
        New Order Placed
      </Text>

      <EmailText style={{ margin: "0 0 16px 0" }}>
        A new order has been received on the storefront.
      </EmailText>

      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "16px",
          margin: "16px 0",
        }}
      >
        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Order Number:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: "bold", color: "#1F2A24" }}>
              {number}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Total Amount:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#164E3F" }}>
              {fmt(totalInr)}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Payment:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
              {paymentMethod.toUpperCase()} ({paymentStatus})
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Items Count:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </Text>
          </Column>
        </Row>

        <Hr style={{ borderColor: "#EAE0CA", margin: "10px 0" }} />

        <Row style={{ marginBottom: "6px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Customer:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#1F2A24" }}>
              {customerName}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "6px" }}>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Phone:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
              {customerPhone}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: "40%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#5A655F" }}>Email:</Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text style={{ margin: 0, fontSize: "13px", color: "#1F2A24" }}>
              {customerEmail}
            </Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0 12px 0" }}>
        <EmailButton href={adminUrl}>
          View Order in Admin
        </EmailButton>
      </Section>

      <EmailMuted style={{ textAlign: "center", marginTop: "16px" }}>
        Maa Kali Astuti Admin Alerts
      </EmailMuted>
    </EmailShell>
  );
}

export default AdminOrderAlertEmail;
