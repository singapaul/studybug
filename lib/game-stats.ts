export interface GameAttemptRecord {
  scorePercentage: number;
  timeTaken: number;
  createdAt: Date;
}

export interface GameStats {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  averageTimeMs: number;
  lastPlayed: Date | null;
  /** Scores in chronological order, for a trend chart. */
  scoreSeries: number[];
  /** Latest score minus first score. */
  improvement: number;
}

export function computeGameStats(attempts: GameAttemptRecord[]): GameStats {
  if (attempts.length === 0) {
    return {
      totalAttempts: 0,
      bestScore: 0,
      averageScore: 0,
      averageTimeMs: 0,
      lastPlayed: null,
      scoreSeries: [],
      improvement: 0,
    };
  }

  const chronological = [...attempts].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const scores = chronological.map((a) => a.scorePercentage);

  const bestScore = Math.max(...scores);
  const averageScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const averageTimeMs = Math.round(
    chronological.reduce((s, a) => s + a.timeTaken, 0) / chronological.length,
  );

  return {
    totalAttempts: attempts.length,
    bestScore,
    averageScore,
    averageTimeMs,
    lastPlayed: chronological[chronological.length - 1].createdAt,
    scoreSeries: scores,
    improvement: scores[scores.length - 1] - scores[0],
  };
}
