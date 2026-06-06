import { db } from "@/lib/db";
import {
  filterAttemptsByDays,
  computeSubjectBreakdown,
  computeTypeBreakdown,
  deriveInsights,
  type AttemptRecord,
  type SubjectBreakdown,
  type TypeBreakdown,
  type Insight,
} from "@/lib/progress-insights";

export interface PersonalBest {
  gameId: string;
  gameName: string;
  gameType: string;
  bestScore: number;
  achievedAt: Date;
  totalAttempts: number;
}

export interface TrendPoint {
  date: Date;
  scorePercentage: number;
  gameName: string;
}

export interface RecentAttempt {
  id: string;
  gameName: string;
  gameType: string;
  scorePercentage: number;
  timeTaken: number;
  createdAt: Date;
}

export interface ProgressData {
  personalBests: PersonalBest[];
  trend: TrendPoint[];
  recentAttempts: RecentAttempt[];
  subjectBreakdown: SubjectBreakdown[];
  typeBreakdown: TypeBreakdown[];
  insights: Insight[];
  summary: {
    totalAttempts: number;
    averageScore: number;
    gamesPlayed: number;
  };
}

/** Raw attempt records (date-filtered) for CSV export. */
export async function getAttemptRecordsForExport(
  userId: string,
  days: number | null = null,
): Promise<AttemptRecord[]> {
  const attempts = await db.gameAttempt.findMany({
    where: { userId },
    include: { game: { select: { name: true, gameType: true, subject: true } } },
    orderBy: { createdAt: "desc" },
  });
  const records: AttemptRecord[] = attempts.map((a) => ({
    scorePercentage: a.scorePercentage,
    timeTaken: a.timeTaken,
    createdAt: a.createdAt,
    gameName: a.game.name,
    gameType: a.game.gameType,
    subject: a.game.subject,
  }));
  return filterAttemptsByDays(records, days);
}

export async function getProgressData(
  userId: string,
  days: number | null = null,
): Promise<ProgressData> {
  const allAttempts = await db.gameAttempt.findMany({
    where: { userId },
    include: { game: { select: { id: true, name: true, gameType: true, subject: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Date-filter using the tested pure helper, keeping the game relation handy.
  const records: (AttemptRecord & { id: string; gameId: string })[] = allAttempts.map((a) => ({
    id: a.id,
    gameId: a.gameId,
    scorePercentage: a.scorePercentage,
    timeTaken: a.timeTaken,
    createdAt: a.createdAt,
    gameName: a.game.name,
    gameType: a.game.gameType,
    subject: a.game.subject,
  }));
  const filtered = filterAttemptsByDays(records, days) as typeof records;
  const attempts = filtered.map((r) => ({
    id: r.id,
    gameId: r.gameId,
    scorePercentage: r.scorePercentage,
    timeTaken: r.timeTaken,
    createdAt: r.createdAt,
    game: { name: r.gameName, gameType: r.gameType },
  }));

  // Personal bests: max score per game + attempt count
  const gameMap = new Map<
    string,
    { gameName: string; gameType: string; bestScore: number; achievedAt: Date; count: number }
  >();

  for (const attempt of attempts) {
    const existing = gameMap.get(attempt.gameId);
    if (!existing) {
      gameMap.set(attempt.gameId, {
        gameName: attempt.game.name,
        gameType: attempt.game.gameType,
        bestScore: attempt.scorePercentage,
        achievedAt: attempt.createdAt,
        count: 1,
      });
    } else {
      existing.count++;
      if (attempt.scorePercentage > existing.bestScore) {
        existing.bestScore = attempt.scorePercentage;
        existing.achievedAt = attempt.createdAt;
      }
    }
  }

  const personalBests: PersonalBest[] = Array.from(gameMap.entries()).map(
    ([gameId, data]) => ({
      gameId,
      gameName: data.gameName,
      gameType: data.gameType,
      bestScore: data.bestScore,
      achievedAt: data.achievedAt,
      totalAttempts: data.count,
    })
  );

  // Trend: last 30 attempts in chronological order
  const trend: TrendPoint[] = attempts.slice(-30).map((a) => ({
    date: a.createdAt,
    scorePercentage: a.scorePercentage,
    gameName: a.game.name,
  }));

  // Recent 10 attempts (newest first)
  const recentAttempts: RecentAttempt[] = [...attempts]
    .reverse()
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      gameName: a.game.name,
      gameType: a.game.gameType,
      scorePercentage: a.scorePercentage,
      timeTaken: a.timeTaken,
      createdAt: a.createdAt,
    }));

  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.scorePercentage, 0) / totalAttempts
        )
      : 0;
  const gamesPlayed = gameMap.size;

  return {
    personalBests,
    trend,
    recentAttempts,
    subjectBreakdown: computeSubjectBreakdown(filtered),
    typeBreakdown: computeTypeBreakdown(filtered),
    insights: deriveInsights(filtered),
    summary: { totalAttempts, averageScore, gamesPlayed },
  };
}
