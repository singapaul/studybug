"use server";

import * as React from "react";
import { render } from "@react-email/render";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { sendEmail, EMAIL_FROM } from "@/lib/email";
import WelcomeEmail from "@/emails/welcome";
import VerifyEmail from "@/emails/verify-email";
import ResetPasswordEmail from "@/emails/reset-password";

export type TemplateKey = "welcome" | "verify" | "reset";

type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function assertDev() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Admin email actions are not available in production");
  }
}

function sampleAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function buildTemplate(key: TemplateKey, recipient: string) {
  const appUrl = sampleAppUrl();
  switch (key) {
    case "welcome":
      return {
        subject: "Welcome to StudyBug",
        element: React.createElement(WelcomeEmail, {
          userName: "Sample User",
          userEmail: recipient,
        }),
      };
    case "verify":
      return {
        subject: "Verify your StudyBug email",
        element: React.createElement(VerifyEmail, {
          userEmail: recipient,
          verificationLink: `${appUrl}/verify-email?token=sample-token-123`,
        }),
      };
    case "reset":
      return {
        subject: "Reset your StudyBug password",
        element: React.createElement(ResetPasswordEmail, {
          userEmail: recipient,
          resetLink: `${appUrl}/reset-password?token=sample-token-456`,
          expiresInHours: 1,
        }),
      };
  }
}

export async function getEmailConfig() {
  assertDev();
  return {
    resendApiKeyPresent: Boolean(process.env.RESEND_API_KEY),
    emailFrom: EMAIL_FROM,
    emailFromIsPlaceholder: EMAIL_FROM === "noreply@yourdomain.com",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    appUrlResolved: sampleAppUrl(),
    legacyNextauthUrlPresent: Boolean(process.env.NEXTAUTH_URL),
    nodeEnv: process.env.NODE_ENV ?? "unknown",
  };
}

export async function renderTemplatePreview(
  key: TemplateKey,
): Promise<string> {
  assertDev();
  const { element } = buildTemplate(key, "preview@example.com");
  return await render(element);
}

export async function sendDirectEmail(
  key: TemplateKey,
  to: string,
): Promise<ActionResult> {
  assertDev();
  if (!to || !to.includes("@")) {
    return { ok: false, error: "Provide a valid recipient email" };
  }
  try {
    const { subject, element } = buildTemplate(key, to);
    const result = await sendEmail({ to, subject, react: element });
    const id = result?.data?.id ?? "(no id returned)";
    if (result?.error) {
      return {
        ok: false,
        error: `Resend error: ${result.error.name ?? "Error"} — ${result.error.message ?? "(no message)"}`,
      };
    }
    return { ok: true, message: `Sent — Resend id ${id}` };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function triggerVerification(
  email: string,
): Promise<ActionResult> {
  assertDev();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Provide a valid email" };
  }
  try {
    await auth.api.sendVerificationEmail({
      body: { email },
      headers: await headers(),
    });
    return {
      ok: true,
      message: `Better Auth sendVerificationEmail invoked for ${email}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function triggerPasswordReset(
  email: string,
): Promise<ActionResult> {
  assertDev();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Provide a valid email" };
  }
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: `${sampleAppUrl()}/reset-password`,
      },
      headers: await headers(),
    });
    return {
      ok: true,
      message: `Better Auth requestPasswordReset invoked for ${email}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
