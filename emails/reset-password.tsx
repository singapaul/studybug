import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userEmail: string;
  resetLink: string;
  expiresInHours?: number;
}

export default function ResetPasswordEmail({
  userEmail,
  resetLink,
  expiresInHours = 1,
}: ResetPasswordEmailProps) {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>Reset your StudyBug password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset the password for your StudyBug
            account associated with {userEmail}.
          </Text>
          <Text style={text}>
            Click the button below to reset your password. This link will
            expire in {expiresInHours} hour{expiresInHours !== 1 ? "s" : ""}.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetLink}>
              Reset password
            </Button>
          </Section>
          <Text style={text}>
            If you can&apos;t click the button, copy and paste this link into
            your browser:
          </Text>
          <Text style={linkText}>
            <Link href={resetLink} style={link}>
              {resetLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email. Your password will not be changed.
          </Text>
          <Text style={footer}>
            <Link href={appUrl} style={link}>
              StudyBug
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
  borderRadius: "8px",
  marginTop: "40px",
  marginBottom: "40px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 24px",
  padding: "0",
};

const text = {
  color: "#444",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const buttonContainer = {
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0f172a",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
};

const linkText = {
  color: "#444",
  fontSize: "14px",
  lineHeight: "24px",
  wordBreak: "break-all" as const,
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0 0 8px",
};

const link = {
  color: "#0f172a",
  textDecoration: "underline",
};
