import "server-only";
import { Section, Text, Row, Column } from "@react-email/components";
import type { MessageTopic } from "@/lib/domain/enums";
import {
  EmailShell,
  EmailText,
  EmailMuted,
  EmailButton,
} from "../components";

export type ContactAlertEmailProps = {
  messageId: number;
  name: string;
  phone: string | null;
  email: string | null;
  topic: MessageTopic;
  body: string;
  adminUrl: string;
};

const TOPIC_LABELS: Record<MessageTopic, string> = {
  order: "Order",
  consultation: "Consultation",
  kundali: "Kundali",
  course: "Course",
  ritual: "Ritual",
  other: "Other",
};

export function ContactAlertEmail({
  name,
  phone,
  email,
  topic,
  body,
  adminUrl,
}: ContactAlertEmailProps): React.JSX.Element {
  return (
    <EmailShell
      preview={`New Contact Message from ${name} · ${TOPIC_LABELS[topic]}`}
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
        New Contact Message
      </Text>

      <EmailText style={{ margin: "0 0 16px 0" }}>
        A visitor has sent a message through the contact form.
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
          <Column style={{ width: "30%" }}>
            <EmailMuted style={{ margin: 0 }}>Name:</EmailMuted>
          </Column>
          <Column style={{ width: "70%" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
              {name}
            </Text>
          </Column>
        </Row>

        {phone && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "30%" }}>
              <EmailMuted style={{ margin: 0 }}>Phone:</EmailMuted>
            </Column>
            <Column style={{ width: "70%" }}>
              <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
                +91 {phone}
              </Text>
            </Column>
          </Row>
        )}

        {email && (
          <Row style={{ marginBottom: "8px" }}>
            <Column style={{ width: "30%" }}>
              <EmailMuted style={{ margin: 0 }}>Email:</EmailMuted>
            </Column>
            <Column style={{ width: "70%" }}>
              <Text style={{ margin: 0, fontSize: "14px", color: "#1F2A24" }}>
                {email}
              </Text>
            </Column>
          </Row>
        )}

        <Row style={{ marginBottom: "8px" }}>
          <Column style={{ width: "30%" }}>
            <EmailMuted style={{ margin: 0 }}>Topic:</EmailMuted>
          </Column>
          <Column style={{ width: "70%" }}>
            <Text style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#1F2A24" }}>
              {TOPIC_LABELS[topic]}
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={{ fontSize: "14px", fontWeight: "600", color: "#164E3F", margin: "16px 0 6px 0" }}>
        Message:
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
          {body}
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0 8px 0" }}>
        <EmailButton href={adminUrl}>
          View in Admin Panel
        </EmailButton>
      </Section>
    </EmailShell>
  );
}
