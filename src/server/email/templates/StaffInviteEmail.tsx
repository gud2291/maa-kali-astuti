import "server-only";
import { Text } from "@react-email/components";
import {
  EmailShell,
  EmailText,
  EmailButton,
  EmailMuted,
  type ContactEmailInfo,
} from "../components";

export type StaffInviteEmailProps = {
  name: string;
  role: string;
  loginUrl: string;
  contact?: ContactEmailInfo;
};

export function StaffInviteEmail({
  name,
  role,
  loginUrl,
  contact,
}: StaffInviteEmailProps): React.JSX.Element {
  const roleName = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <EmailShell
      preview={`You've been invited to join Maa Kali Astuti as ${roleName}`}
      locale="en"
      contact={contact}
    >
      <Text
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#164E3F",
          margin: "0 0 16px 0",
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        Welcome to the Admin Team
      </Text>

      <EmailText>Hello {name || "there"},</EmailText>

      <EmailText>
        You have been granted administrative access to the Maa Kali Astuti portal with the role of{" "}
        <strong>{roleName}</strong>.
      </EmailText>

      <EmailText>
        You can sign in to your administrative dashboard using your email address and a secure, one-time passcode:
      </EmailText>

      <div style={{ textAlign: "center", margin: "28px 0" }}>
        <EmailButton href={loginUrl}>Open Admin Portal</EmailButton>
      </div>

      <EmailMuted>
        If you have questions about your role permissions or access level, please consult your store owner.
      </EmailMuted>
    </EmailShell>
  );
}
