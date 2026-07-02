import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export interface DemoRequestEmailProps {
  schoolName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  numberOfStudents: string;
  numberOfTeachers: string;
  preferredTimes?: string;
  specificDate?: string;
  additionalNotes?: string;
}

export default function DemoRequestEmail(props: DemoRequestEmailProps) {
  const {
    schoolName,
    contactName,
    contactRole,
    email,
    phone,
    numberOfStudents,
    numberOfTeachers,
    preferredTimes,
    specificDate,
    additionalNotes,
  } = props;

  const rows: Array<[string, string | undefined]> = [
    ["School", schoolName],
    ["Contact", contactName],
    ["Role", contactRole],
    ["Email", email],
    ["Phone", phone],
    ["Students", numberOfStudents],
    ["Teachers", numberOfTeachers],
    ["Preferred contact time", preferredTimes],
    ["Specific date", specificDate],
  ];

  return (
    <Html>
      <Head />
      <Preview>{`Demo request from ${schoolName}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New demo request</Heading>
          <Text style={text}>
            {contactName} ({contactRole}) at {schoolName} has requested a demo.
          </Text>
          <Section>
            {rows.map(([label, value]) =>
              value ? (
                <Text key={label} style={row}>
                  <strong>{label}:</strong> {value}
                </Text>
              ) : null,
            )}
          </Section>
          {additionalNotes ? (
            <>
              <Hr style={hr} />
              <Text style={row}>
                <strong>Notes:</strong>
              </Text>
              <Text style={text}>{additionalNotes}</Text>
            </>
          ) : null}
          <Hr style={hr} />
          <Text style={footer}>
            Reply directly to this email to reach {contactName} at {email}.
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
  fontSize: "24px",
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

const row = {
  color: "#1a1a1a",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 6px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "0",
};
