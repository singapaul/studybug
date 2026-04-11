import { db } from "@/lib/db";

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
  summary: {
    totalAttempts: number;
    averageScore: number;
    gamesPlayed: number;
  };
}

export async function getProgressData(userId: string): Promise<ProgressData> {
  const attempts = await db.gameAttempt.findMany({
    where: { userId },
    include: { game: { select: { name: true, gameType: true } } },
    orderBy: { createdAt: "asc" },
  });

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
    summary: { totalAttempts, averageScore, gamesPlayed },
  };
}
