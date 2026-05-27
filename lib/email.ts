import { Resend } from "resend";
import type { ReactElement } from "react";

const PLACEHOLDER_FROM = "noreply@yourdomain.com";

if (!process.env.RESEND_API_KEY) {
  console.warn("[email] RESEND_API_KEY is not set — emails will not be sent.");
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const EMAIL_FROM = process.env.EMAIL_FROM ?? PLACEHOLDER_FROM;

export type SendEmailArgs = {
  to: string;
  subject: string;
  react: ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailArgs) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (EMAIL_FROM === PLACEHOLDER_FROM) {
    throw new Error(
      `EMAIL_FROM is not configured (still set to placeholder "${PLACEHOLDER_FROM}")`,
    );
  }
  return await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    react,
  });
}
