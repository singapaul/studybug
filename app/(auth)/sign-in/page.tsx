import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your StudyBug account.",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-foreground">StudyBug</span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back
          </p>
        </div>
        <div className="bg-card border rounded-xl p-5 sm:p-8 shadow-sm">
          <Suspense>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
