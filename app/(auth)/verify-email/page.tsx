"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailToUse = session?.user?.email ?? email;

  async function handleResend() {
    const target = emailToUse.trim();
    if (!target) return;

    setLoading(true);
    setError(null);

    const { error: authError } = await authClient.sendVerificationEmail({
      email: target,
      callbackURL: "/dashboard",
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Failed to send. Please try again.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-foreground">StudyBug</span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a verification link to{" "}
            {session?.user?.email ? (
              <span className="font-medium text-foreground">{session.user.email}</span>
            ) : (
              "your email address"
            )}
            .
          </p>
        </div>

        <div className="bg-card border rounded-xl p-5 sm:p-8 shadow-sm space-y-5">
          <p className="text-sm text-muted-foreground text-center">
            Click the link in the email to verify your account. Check your spam
            folder if you don&apos;t see it.
          </p>

          {sent ? (
            <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 text-center">
              Verification email sent — check your inbox.
            </div>
          ) : (
            <div className="space-y-3">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!session?.user?.email && (
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              )}

              <Button
                className="w-full"
                variant="outline"
                onClick={handleResend}
                disabled={loading || (!session?.user?.email && !email.trim())}
              >
                {loading ? "Sending..." : "Resend verification email"}
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/sign-in"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
