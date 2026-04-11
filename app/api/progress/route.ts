import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser, isPro } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req);

    if (!isPro(plan)) {
      return NextResponse.json(
        { error: "Progress tracking requires a Pro plan", code: "PREMIUM_REQUIRED" },
        { status: 403 }
      );
    }

    const attempts = await db.gameAttempt.findMany({
      where: { userId },
      include: { game: { select: { name: true, gameType: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Personal bests: max score per game
    const bestByGame = new Map<
      string,
      { gameId: string; gameName: string; bestScore: number; achievedAt: Date }
    >();
    for (const attempt of attempts) {
      const existing = bestByGame.get(attempt.gameId);
      if (!existing || attempt.scorePercentage > existing.bestScore) {
        bestByGame.set(attempt.gameId, {
          gameId: attempt.gameId,
          gameName: attempt.game.name,
          bestScore: attempt.scorePercentage,
          achievedAt: attempt.createdAt,
        });
      }
    }
    const personalBests = Array.from(bestByGame.values());

    // Trend: last 30 attempts
    const trend = attempts.slice(-30).map((a) => ({
      date: a.createdAt,
      scorePercentage: a.scorePercentage,
      gameName: a.game.name,
    }));

    // Summary
    const totalAttempts = attempts.length;
    const averageScore =
      totalAttempts > 0
        ? Math.round(
            attempts.reduce((sum, a) => sum + a.scorePercentage, 0) / totalAttempts
          )
        : 0;
    const gamesPlayed = new Set(attempts.map((a) => a.gameId)).size;

    return NextResponse.json({
      personalBests,
      trend,
      summary: { totalAttempts, averageScore, gamesPlayed },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/progress error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
