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
import { CreditCard, Activity, ArrowUpRight, Gamepad2, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { UpgradeBanner } from "./upgrade-banner";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getTemplateName } from "@/lib/game-templates";
import { GameType } from "@prisma/client";
import { FREE_GAME_LIMIT } from "@/lib/api-helpers";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const plan = (session.user as { plan?: string }).plan ?? "free";
  const isPro = plan === "pro";
  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const resolvedParams = await searchParams;

  const stats = await getDashboardStats(session.user.id);
  const nearLimit = !isPro && stats.totalGames >= FREE_GAME_LIMIT - 1;

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
          Here&apos;s an overview of your games and progress.
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
      {resolvedParams.upgrade === "success" && (
        <Suspense>
          <UpgradeBanner currentPlan={plan} />
        </Suspense>
      )}

      {/* Contextual upgrade banner for free users at/near game limit */}
      {nearLimit && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900">
              {stats.totalGames >= FREE_GAME_LIMIT
                ? "You've reached the free plan game limit"
                : "You're almost at the free plan game limit"}
            </p>
            <p className="text-sm text-amber-700">
              Upgrade to Pro for unlimited games and all game types.
            </p>
          </div>
          <Button asChild size="sm" variant="default">
            <Link href="/#pricing">Upgrade</Link>
          </Button>
        </div>
      )}

      {/* General upgrade banner for free users (only when not near limit) */}
      {!isPro && !nearLimit && (
        <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Upgrade to Pro</p>
            <p className="text-sm text-muted-foreground">
              Unlock all game types, unlimited games, and progress tracking.
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
              Games
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isPro ? "Unlimited" : `${stats.totalGames} / ${FREE_GAME_LIMIT} on free plan`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attempts
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalAttempts > 0
                ? `Avg score: ${stats.averageScore}%`
                : "Play a game to start tracking"}
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

      {/* Recent Games + Quick actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Games</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link href="/games">View all</Link>
              </Button>
            </div>
            <CardDescription>Your most recently updated games.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Gamepad2 className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No games yet.</p>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href="/games/create">Create your first game</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{game.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTemplateName(game.gameType as unknown as GameType)} ·{" "}
                        {new Date(game.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Jump to key areas of your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/games/create"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium">Create a new game</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              href="/progress"
              className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
            >
              <span className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                View progress
                {!isPro && (
                  <Badge variant="secondary" className="text-xs">Pro</Badge>
                )}
              </span>
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
      </div>
    </div>
  );
}
