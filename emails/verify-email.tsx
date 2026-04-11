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

interface VerifyEmailProps {
  userEmail: string;
  verificationLink: string;
}

export default function VerifyEmail({
  userEmail,
  verificationLink,
}: VerifyEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>Verify your StudyBug email address</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Verify your email</Heading>
          <Text style={text}>
            Thanks for signing up! Please verify the email address associated
            with your StudyBug account: {userEmail}.
          </Text>
          <Text style={text}>
            Click the button below to confirm your address. This link will
            expire in 24 hours.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verificationLink}>
              Verify email address
            </Button>
          </Section>
          <Text style={text}>
            If you can&apos;t click the button, copy and paste this link into
            your browser:
          </Text>
          <Text style={linkText}>
            <Link href={verificationLink} style={link}>
              {verificationLink}
            </Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t create a StudyBug account, you can safely ignore
            this email.
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
