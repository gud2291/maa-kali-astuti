import "server-only";
import { Section, Text, Row, Column, Hr } from "@react-email/components";
import type { InquiryKind } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
} from "../components";

export type AdminInquiryAlertEmailProps = {
  refCode: string;
  inquiryId: number;
  kind: InquiryKind;
  name: string;
  phone: string;
  email?: string | null;
  city: string;
  courseOrArea: string;
  expOrLang: string;
  why: string;
  adminUrl: string;
};

export function AdminInquiryAlertEmail({
  refCode,
  kind,
  name,
  phone,
  email,
  city,
  courseOrArea,
  expOrLang,
  why,
  adminUrl,
}: AdminInquiryAlertEmailProps): React.JSX.Element {
  const kindLabel = kind === "course" ? "Course Enrollment Inquiry" : "Ritual Inquiry";

  return (
    <EmailShell
      preview={`New Inquiry: ${refCode} · ${kindLabel} · ${name}`}
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
        New {kindLabel}
      </Text>

      <EmailText style={{ margin: "0 0 16px 0" }}>
        A new inquiry has been received on the storefront.
      </EmailText>

      <Section
        style={{
          backgroundColor: "#FBF7EE",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "16px 20px",
          margin: "16px 0",
        }}
      >
        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "35%" }}>
            <EmailMuted style={{ margin: 0 }}>Reference:</EmailMuted>
          </Column>
          <Column style={{ width: "65%" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "bold",
                color: "#164E3F",
                fontFamily: "monospace",
              }}
            >
              {refCode}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "35%" }}>
            <EmailMuted style={{ margin: 0 }}>Seeker Name:</EmailMuted>
          </Column>
          <Column style={{ width: "65%" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
              {name}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "35%" }}>
            <EmailMuted style={{ margin: 0 }}>Phone / WA:</EmailMuted>
          </Column>
          <Column style={{ width: "65%" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
              +91 {phone}
            </Text>
          </Column>
        </Row>

        {email && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "35%" }}>
              <EmailMuted style={{ margin: 0 }}>Email:</EmailMuted>
            </Column>
            <Column style={{ width: "65%" }}>
              <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
                {email}
              </Text>
            </Column>
          </Row>
        )}

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "35%" }}>
            <EmailMuted style={{ margin: 0 }}>City:</EmailMuted>
          </Column>
          <Column style={{ width: "65%" }}>
            <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
              {city}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "35%" }}>
            <EmailMuted style={{ margin: 0 }}>
              {kind === "course" ? "Course:" : "Area:"}
            </EmailMuted>
          </Column>
          <Column style={{ width: "65%" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
              {courseOrArea}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "35%" }}>
            <EmailMuted style={{ margin: 0 }}>
              {kind === "course" ? "Experience:" : "Language:"}
            </EmailMuted>
          </Column>
          <Column style={{ width: "65%" }}>
            <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
              {expOrLang}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={{ fontSize: "14px", fontWeight: "600", color: "#164E3F", margin: "16px 0 6px 0" }}>
        Message / Reason:
      </Text>
      <Section
        style={{
          backgroundColor: "#FFFDF8",
          border: "1px solid #EAE0CA",
          borderRadius: "4px",
          padding: "12px 16px",
          marginBottom: "20px",
        }}
      >
        <Text style={{ margin: 0, fontSize: "13.5px", lineHeight: "1.55", color: "#3A453F", whiteSpace: "pre-wrap" }}>
          {why}
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0 8px 0" }}>
        <EmailButton href={adminUrl}>
          View Inquiry in Admin Panel
        </EmailButton>
      </Section>
    </EmailShell>
  );
}
