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

interface WelcomeEmailProps {
  userName?: string;
  userEmail: string;
}

export default function WelcomeEmail({
  userName,
  userEmail,
}: WelcomeEmailProps) {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const displayName = userName ?? userEmail;

  return (
    <Html>
      <Head />
      <Preview>Welcome to StudyBug — your account is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to StudyBug</Heading>
          <Text style={text}>Hi {displayName},</Text>
          <Text style={text}>
            Thanks for signing up. Your account is ready and you can start
            using StudyBug right away.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={`${appUrl}/dashboard`}>
              Go to your dashboard
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            You&apos;re receiving this email because you signed up for StudyBug
            with {userEmail}. If you didn&apos;t sign up, you can safely ignore
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
