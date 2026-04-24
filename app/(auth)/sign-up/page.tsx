import { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new StudyBug account.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-foreground">StudyBug</span>
          </Link>
          <h1 className="mt-6 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building for free
          </p>
        </div>
        <div className="bg-card border rounded-xl p-5 sm:p-8 shadow-sm">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
