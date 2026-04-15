import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Lock, Trophy, TrendingUp, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default async function ProgressPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const plan = (session.user as { plan?: string }).plan ?? "free";
  const isPro = plan === "pro";

  if (!isPro) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold mb-2">Progress</h1>
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

  const { personalBests, trend, recentAttempts, summary } = await getProgressData(
    session.user.id
  );

  if (summary.totalAttempts === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-2">Progress</h1>
      <p className="text-muted-foreground mb-8">Your performance across all games.</p>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
              <div className="flex items-end gap-1 h-24">
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
          <div className="overflow-x-auto">
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
