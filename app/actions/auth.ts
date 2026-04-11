"use server";

// Auth actions (sign-in, sign-up, password reset) are handled client-side
// via Better Auth's authClient in lib/auth-client.ts.
//
// This file is intentionally empty — it is kept so that any existing imports
// resolve without errors during the migration period.

export type ActionResult = {
  error?: string;
  success?: string;
};
