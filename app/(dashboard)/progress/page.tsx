import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Lock, Trophy, TrendingUp, Clock, Target, Lightbulb, Download, BookOpen, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplateName } from "@/lib/game-templates";
import { GameType } from "@/types/game";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getProgressData } from "@/lib/progress-data";

export const metadata: Metadata = {
  title: "Progress",
};

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "all", label: "All time" },
] as const;

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const plan = (session.user as { plan?: string }).plan ?? "free";
  const isPro = plan === "pro";

  const { days: daysParam } = await searchParams;
  const activeRange = daysParam === "7" || daysParam === "30" ? daysParam : "all";
  const days = activeRange === "all" ? null : Number(activeRange);

  if (!isPro) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">Progress</h1>
        <p className="text-muted-foreground mb-8">Track your performance over time.</p>

        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-6">
              <Lock className="h-12 w-12 text-muted-foreground/50" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Progress Tracking is a Pro Feature</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Upgrade to Pro to unlock your personal bests, score trends, and full
            attempt history across all your games.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/#pricing">Upgrade to Pro</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/games">Back to Games</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { personalBests, trend, recentAttempts, summary, subjectBreakdown, typeBreakdown, insights } =
    await getProgressData(session.user.id, days);

  if (summary.totalAttempts === 0 && activeRange === "all") {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Progress</h1>
        <p className="text-muted-foreground mb-8">Track your performance over time.</p>
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-6">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">No data yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Play some games to start tracking your progress.
          </p>
          <Button asChild>
            <Link href="/games">Play a Game</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Build trend bar chart data (CSS only)
  const maxScore = 100;
  const trendMax = Math.max(...trend.map((t) => t.scorePercentage), 1);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">Progress</h1>
          <p className="text-muted-foreground">Your performance across all games.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range filter (server-rendered via query param) */}
          <div className="inline-flex rounded-lg border p-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <Button
                key={r.value}
                asChild
                size="sm"
                variant="ghost"
                className={cn("h-8 px-3 text-xs", activeRange === r.value && "bg-primary/10 text-primary")}
              >
                <Link href={`/progress?days=${r.value}`}>{r.label}</Link>
              </Button>
            ))}
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/progress/export?days=${activeRange}`}>
              <Download className="h-4 w-4 mr-2" /> Export
            </a>
          </Button>
        </div>
      </div>

      {summary.totalAttempts === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground mb-8">
          No attempts in this range. Try a wider date range.
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/40">
                <Lightbulb className="h-4 w-4 text-foreground" />
              </div>
              <CardTitle className="text-base">Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      insight.type === "strength" && "bg-primary",
                      insight.type === "weakness" && "bg-destructive",
                      insight.type === "trend" && "bg-secondary",
                    )}
                  />
                  {insight.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Attempts
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-blue-100">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAttempts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {summary.gamesPlayed} game{summary.gamesPlayed !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-green-100">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Games Played
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-yellow-100">
              <Trophy className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.gamesPlayed}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique games attempted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Score trend */}
        {trend.length > 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-100">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Score Trend</CardTitle>
                  <CardDescription>Your last {trend.length} attempts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-end gap-1 h-24"
                role="img"
                aria-label={`Score trend across your last ${trend.length} attempts`}
              >
                {trend.map((point, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-primary/80 rounded-t transition-all"
                    style={{ height: `${(point.scorePercentage / maxScore) * 100}%` }}
                    title={`${point.gameName}: ${point.scorePercentage}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Oldest</span>
                <span>Latest</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal bests */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-100">
                <Trophy className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-base">Personal Bests</CardTitle>
                <CardDescription>Highest score achieved per game</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {personalBests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {personalBests.map((pb) => (
                  <div key={pb.gameId} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{pb.gameName}</p>
                      <p className="text-xs text-muted-foreground">
                        {pb.totalAttempts} attempt{pb.totalAttempts !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <Badge
                      variant={pb.bestScore >= 80 ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {pb.bestScore}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Breakdowns by subject and game type */}
      {(subjectBreakdown.length > 0 || typeBreakdown.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-100">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">By Subject</CardTitle>
                  <CardDescription>Average score per subject</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {subjectBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {subjectBreakdown.map((s) => (
                    <div key={s.subject}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium truncate">{s.subject}</span>
                        <span className="text-muted-foreground shrink-0">
                          {s.averageScore}% · {s.attempts} attempt{s.attempts !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.averageScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <Gamepad2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">By Game Type</CardTitle>
                  <CardDescription>Average score per game type</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {typeBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {typeBreakdown.map((t) => (
                    <div key={t.gameType}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium truncate">{getTemplateName(t.gameType as GameType)}</span>
                        <span className="text-muted-foreground shrink-0">
                          {t.averageScore}% · {t.attempts} attempt{t.attempts !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-secondary" style={{ width: `${t.averageScore}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent attempts table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base">Recent Attempts</CardTitle>
              <CardDescription>Your last {recentAttempts.length} game sessions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {recentAttempts.map((attempt) => (
              <div key={attempt.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{attempt.gameName}</p>
                  <Badge
                    variant={attempt.scorePercentage >= 80 ? "default" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {attempt.scorePercentage}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(attempt.timeTaken)}
                  </span>
                  <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Game</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Score</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    Time
                  </th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{attempt.gameName}</td>
                    <td className="py-2.5 text-right">
                      <Badge
                        variant={attempt.scorePercentage >= 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {attempt.scorePercentage}%
                      </Badge>
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {formatTime(attempt.timeTaken)}
                    </td>
                    <td className="py-2.5 text-right text-muted-foreground">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
