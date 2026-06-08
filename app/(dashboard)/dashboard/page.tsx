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
import { ArrowRight, ArrowUpRight, BookOpen, Gamepad2, TrendingUp, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { UpgradeBanner } from "./upgrade-banner";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getTemplateName } from "@/lib/game-templates";
import { GameType } from "@/types/game";
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
    <div className="p-4 sm:p-8">
      {/* Email verification banner */}
      {!session.user.emailVerified && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 flex items-center justify-between">
          <p>Please verify your email address to secure your account.</p>
          <Link href="/verify-email" className="ml-4 font-medium underline underline-offset-4 whitespace-nowrap">
            Resend link
          </Link>
        </div>
      )}

      {/* Post-checkout banner (success or cancelled) */}
      {(resolvedParams.upgrade === "success" || resolvedParams.upgrade === "cancelled") && (
        <Suspense>
          <UpgradeBanner currentPlan={plan} status={resolvedParams.upgrade as "success" | "cancelled"} />
        </Suspense>
      )}

      {/* Hero gradient section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-primary p-8 text-white mb-8">
        {/* Decorative circles */}
        <div className="hidden sm:block absolute -top-6 -right-6 h-36 w-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="hidden sm:block absolute -bottom-8 -left-8 h-52 w-52 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative">
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-white/80 text-sm mb-6">Ready to create something great?</p>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-bold">{stats.totalGames}</p>
              <p className="text-xs text-white/80">Games</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              <p className="text-xs text-white/80">Attempts</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-bold capitalize">{plan}</p>
              <p className="text-xs text-white/80">Plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual upgrade banner for free users at/near game limit */}
      {nearLimit && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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

      {/* Quick action cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 mb-8">
        <Link
          href="/games/create"
          className="group block rounded-xl border-2 border-transparent bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <Gamepad2 className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </div>
          <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            Create a Game
          </h2>
          <p className="text-sm text-muted-foreground">
            Build a new interactive game from scratch or use a template.
          </p>
        </Link>

        <Link
          href="/library"
          className="group block rounded-xl border-2 border-transparent bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </div>
          <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            Browse Library
          </h2>
          <p className="text-sm text-muted-foreground">
            Explore pre-built revision decks across popular GCSE subjects.
          </p>
        </Link>

        <Link
          href="/progress"
          className="group block rounded-xl border-2 border-transparent bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </div>
          <h2 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
            View Progress
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your scores, personal bests, and game history.
            {!isPro && <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>}
          </p>
        </Link>
      </div>

      {/* Two-column: Recent Games + Getting Started */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Recent Games</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
              <Link href="/games">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-5 mb-4">
                  <Gamepad2 className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium mb-1">No games yet</p>
                <p className="text-xs text-muted-foreground mb-4">Create your first game to get started</p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/games/create">Create your first game</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recentGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{game.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTemplateName(game.gameType as GameType)} ·{" "}
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
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Getting Started</CardTitle>
            </div>
            <CardDescription>Complete these steps to get the most out of StudyBug.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Create a game",
                  desc: "Pick a game type and add your content.",
                  href: "/games/create",
                  done: stats.totalGames > 0,
                },
                {
                  step: 2,
                  title: "Play it",
                  desc: "Test yourself and track your score.",
                  href: "/games",
                  done: stats.totalAttempts > 0,
                },
                isPro
                  ? {
                      step: 3,
                      title: "Generate a worksheet",
                      desc: "Turn any topic into a printable worksheet.",
                      href: "/worksheets/new",
                      done: stats.totalWorksheets > 0,
                    }
                  : {
                      step: 3,
                      title: "Unlock Pro features",
                      desc: "Worksheets, progress tracking, and every game type.",
                      href: "/#pricing",
                      done: false,
                    },
              ].map(({ step, title, desc, href, done }) => (
                <Link
                  key={step}
                  href={href}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
