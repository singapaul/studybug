import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CreditCard, Users, Activity, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { UpgradeBanner } from "./upgrade-banner";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgrade?: string };
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const plan = (session.user as { plan?: string }).plan ?? "free";
  const isPro = plan === "pro";
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <Badge variant={isPro ? "default" : "secondary"} className="capitalize">
            {plan} plan
          </Badge>

        </div>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Email verification banner */}
      {!session.user.emailVerified && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 flex items-center justify-between">
          <p>Please verify your email address to secure your account.</p>
          <Link href="/verify-email" className="ml-4 font-medium underline underline-offset-4 whitespace-nowrap">
            Resend link
          </Link>
        </div>
      )}

      {/* Post-upgrade success banner */}
      {searchParams.upgrade === "success" && (
        <Suspense>
          <UpgradeBanner currentPlan={plan} />
        </Suspense>
      )}

      {/* Upgrade banner for free users */}
      {!isPro && (
        <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Upgrade to Pro</p>
            <p className="text-sm text-muted-foreground">
              Unlock unlimited projects, priority support, and more.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/#pricing">View plans</Link>
          </Button>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projects
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPro ? "Unlimited" : "Up to 3 on free plan"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPro ? "Invite your team" : "Upgrade for team access"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plan
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{plan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPro ? "Active subscription" : "Free forever"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Get started</CardTitle>
            <CardDescription>Quick links to help you get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/settings"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">Complete your profile</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            {!isPro && (
              <Link
                href="/#pricing"
                className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 p-3 hover:bg-primary/10 transition-colors"
              >
                <span className="text-sm font-medium">Upgrade to Pro</span>
                <ArrowUpRight className="h-4 w-4 text-primary" />
              </Link>
            )}
            {isPro && (
              <Link
                href="/settings?tab=billing"
                className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <span className="text-sm font-medium">Manage billing</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Your recent account activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No activity yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Actions you take will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
