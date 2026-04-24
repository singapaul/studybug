"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function RequestResetForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Something went wrong. Please try again.");
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
          If an account exists with that email, we&apos;ve sent a reset link.
        </div>
        <p className="text-sm text-muted-foreground">
          Check your inbox and follow the link to reset your password.
        </p>
        <Link
          href="/sign-in"
          className="block text-sm font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

function SetNewPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message ?? "Invalid or expired reset link.");
    } else {
      router.push("/sign-in?reset=success");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-foreground">StudyBug</span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {token ? "Set new password" : "Forgot your password?"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {token
              ? "Enter your new password below."
              : "Enter your email and we'll send you a reset link."}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-5 sm:p-8 shadow-sm">
          {token ? (
            <SetNewPasswordForm token={token} />
          ) : (
            <RequestResetForm />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
