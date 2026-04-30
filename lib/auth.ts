import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import * as React from "react";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { resend, EMAIL_FROM } = await import("./email");
      if (!resend) return;
      try {
        const { default: ResetPasswordEmail } = await import(
          "@/emails/reset-password"
        );
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Reset your StudyBug password",
          react: React.createElement(ResetPasswordEmail, {
            userEmail: user.email,
            resetLink: url,
            expiresInHours: 1,
          }),
        });
      } catch (error) {
        console.error("Failed to send reset password email:", error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      const { resend, EMAIL_FROM } = await import("./email");
      if (!resend) return;
      try {
        const { default: VerifyEmailTemplate } = await import(
          "@/emails/verify-email"
        );
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "Verify your StudyBug email",
          react: React.createElement(VerifyEmailTemplate, {
            userEmail: user.email,
            verificationLink: url,
          }),
        });
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { resend, EMAIL_FROM } = await import("./email");
          if (!resend) return;
          try {
            const { default: WelcomeEmail } = await import("@/emails/welcome");
            await resend.emails.send({
              from: EMAIL_FROM,
              to: user.email,
              subject: "Welcome to StudyBug",
              react: React.createElement(WelcomeEmail, {
                userName: user.name || undefined,
                userEmail: user.email,
              }),
            });
          } catch (error) {
            console.error("Failed to send welcome email:", error);
          }
        },
      },
    },
  },
});
