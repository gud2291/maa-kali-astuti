import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import { fmt } from "@/lib/core/format";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
} from "../components";

export type AdminBookingAlertEmailProps = {
  refCode: string;
  bookingId: number;
  serviceName: string;
  tierTitle: string;
  modeLabel: string;
  startFormatted?: string | null;
  isReport: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  priceInr: number;
  adminUrl: string;
  slotClash?: boolean;
  amountMismatch?: boolean;
  adminNote?: string | null;
};

export function AdminBookingAlertEmail({
  refCode,
  serviceName,
  tierTitle,
  modeLabel,
  startFormatted,
  isReport,
  customerName,
  customerPhone,
  customerEmail,
  priceInr,
  adminUrl,
  slotClash,
  amountMismatch,
  adminNote,
}: AdminBookingAlertEmailProps): React.JSX.Element {
  const isUrgent = slotClash || amountMismatch;

  return (
    <EmailShell
      preview={`New Booking Confirmed: ${refCode} · ${serviceName} (${fmt(priceInr)})`}
      locale="en"
    >
      <Text
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: isUrgent ? "#A8322D" : "#164E3F",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: "0 0 12px 0",
          lineHeight: "1.3",
        }}
      >
        {isUrgent ? "⚠️ New Booking Alert (Attention Needed)" : "New Consultation Booking"}
      </Text>

      <EmailText style={{ margin: "0 0 16px 0" }}>
        A new consultation booking has been confirmed on the storefront.
      </EmailText>

      {slotClash && (
        <Section
          style={{
            backgroundColor: "#FDF2F2",
            border: "1px solid #F5C6CB",
            borderRadius: "4px",
            padding: "12px 16px",
            margin: "0 0 16px 0",
          }}
        >
          <Text style={{ margin: 0, color: "#721C24", fontWeight: "bold", fontSize: "14px" }}>
            Slot Clash Alert: The hold expired before payment and another booking overlaps with this time. Reschedule is required.
          </Text>
        </Section>
      )}

      {amountMismatch && (
        <Section
          style={{
            backgroundColor: "#FFF3CD",
            border: "1px solid #FFEEBA",
            borderRadius: "4px",
            padding: "12px 16px",
            margin: "0 0 16px 0",
          }}
        >
          <Text style={{ margin: 0, color: "#856404", fontWeight: "bold", fontSize: "14px" }}>
            Amount Mismatch: Paid amount does not match package price. Please review payment in admin.
          </Text>
        </Section>
      )}

      <Section
        style={{
          backgroundColor: "#FBF7EE",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "0 0 24px 0",
          border: "1px solid #EAE0CA",
        }}
      >
        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Reference</EmailMuted>
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

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Service</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0, fontWeight: "600" }}>
              {serviceName}
            </EmailText>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Package</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0 }}>{tierTitle}</EmailText>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Mode</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0 }}>{modeLabel}</EmailText>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>{isReport ? "Delivery" : "Scheduled Time"}</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0, fontWeight: "600", color: "#164E3F" }}>
              {isReport ? "Written Report (48 hrs)" : (startFormatted ?? "—")}
            </EmailText>
          </Column>
        </Row>

        <Hr style={{ borderColor: "#EAE0CA", margin: "10px 0" }} />

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Customer</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0, fontWeight: "600" }}>
              {customerName}
            </EmailText>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Phone</EmailMuted>
          </Column>
          <Column style={{ width: "60%", textAlign: "right" }}>
            <EmailText style={{ margin: 0 }}>+91 {customerPhone}</EmailText>
          </Column>
        </Row>

        {customerEmail && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted>Email</EmailMuted>
            </Column>
            <Column style={{ width: "60%", textAlign: "right" }}>
              <EmailText style={{ margin: 0 }}>{customerEmail}</EmailText>
            </Column>
          </Row>
        )}

        <Row>
          <Column style={{ width: "40%" }}>
            <EmailMuted>Paid Amount</EmailMuted>
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

        {adminNote && (
          <Row style={{ marginTop: "10px" }}>
            <Column style={{ width: "40%" }}>
              <EmailMuted>Admin Note</EmailMuted>
            </Column>
            <Column style={{ width: "60%", textAlign: "right" }}>
              <EmailText style={{ margin: 0, color: "#A8322D" }}>{adminNote}</EmailText>
            </Column>
          </Row>
        )}
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <EmailButton href={adminUrl}>
          View in Admin Panel
        </EmailButton>
      </Section>
    </EmailShell>
  );
}
