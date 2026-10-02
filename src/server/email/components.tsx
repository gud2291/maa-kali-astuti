import "server-only";
import type { CSSProperties, ReactNode } from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";
import type { Locale } from "@/lib/domain/enums";

export type ContactEmailInfo = {
  phoneDisplay?: string;
  email?: string;
  whatsapp?: string;
};

export type EmailShellProps = {
  preview?: string;
  locale?: Locale;
  contact?: ContactEmailInfo;
  children: ReactNode;
};

export function EmailShell({
  preview,
  locale = "en",
  contact,
  children,
}: EmailShellProps): React.JSX.Element {
  return (
    <Html lang={locale}>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body
        style={{
          backgroundColor: "#FBF7EE",
          margin: "0 auto",
          padding: "24px 0",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "0 16px",
          }}
        >
          {/* Card */}
          <Section
            style={{
              backgroundColor: "#FFFDF8",
              borderRadius: "6px",
              overflow: "hidden",
              border: "1px solid #EAE0CA",
              boxShadow: "0 2px 8px rgba(31, 42, 36, 0.05)",
            }}
          >
            {/* Header */}
            <Section
              style={{
                backgroundColor: "#164E3F",
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#D9B96A",
                  letterSpacing: "0.04em",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                Maa Kali Astuti
              </Text>
            </Section>

            {/* Gold hairline */}
            <Hr
              style={{
                borderColor: "#B8923A",
                borderWidth: "1.5px",
                borderStyle: "solid",
                margin: 0,
              }}
            />

            {/* Content body */}
            <Section
              style={{
                padding: "32px 28px",
              }}
            >
              {children}
            </Section>
          </Section>

          {/* Footer */}
          <Section
            style={{
              padding: "24px 16px 8px 16px",
              textAlign: "center",
            }}
          >
            {contact && (contact.phoneDisplay || contact.email) && (
              <Text
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "12.5px",
                  color: "#5A655F",
                  lineHeight: "1.5",
                }}
              >
                {contact.phoneDisplay && <span>{contact.phoneDisplay}</span>}
                {contact.phoneDisplay && contact.email && <span> · </span>}
                {contact.email && (
                  <Link
                    href={`mailto:${contact.email}`}
                    style={{ color: "#164E3F", textDecoration: "underline" }}
                  >
                    {contact.email}
                  </Link>
                )}
              </Text>
            )}
            <Text
              style={{
                margin: 0,
                fontSize: "11.5px",
                color: "#8A948E",
                lineHeight: "1.4",
              }}
            >
              © {new Date().getFullYear()} Maa Kali Astuti · sadhakpawanpandey.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailButton({
  href,
  children,
  style,
}: {
  href: string;
  children: ReactNode;
  style?: CSSProperties;
}): React.JSX.Element {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: "#164E3F",
        color: "#FFFDF8",
        border: "1px solid #B8923A",
        borderRadius: "4px",
        padding: "12px 24px",
        fontSize: "15px",
        fontWeight: "600",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        textDecoration: "none",
        textAlign: "center",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </Button>
  );
}

export function EmailText({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}): React.JSX.Element {
  return (
    <Text
      style={{
        fontSize: "15px",
        lineHeight: "1.6",
        color: "#1F2A24",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        margin: "0 0 16px 0",
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailMuted({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}): React.JSX.Element {
  return (
    <Text
      style={{
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#5A655F",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        margin: "0 0 12px 0",
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
