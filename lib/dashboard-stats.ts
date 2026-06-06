import { db } from "@/lib/db";
import { Game } from "@prisma/client";

export interface DashboardStats {
  totalGames: number;
  recentGames: Pick<Game, "id" | "name" | "gameType" | "updatedAt">[];
  totalAttempts: number;
  averageScore: number;
  totalWorksheets: number;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [totalGames, recentGames, attemptStats, totalWorksheets] = await Promise.all([
    db.game.count({ where: { userId } }),
    db.game.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, name: true, gameType: true, updatedAt: true },
    }),
    db.gameAttempt.aggregate({
      where: { userId },
      _count: { id: true },
      _avg: { scorePercentage: true },
    }),
    db.worksheet.count({ where: { userId } }),
  ]);

  return {
    totalGames,
    recentGames,
    totalAttempts: attemptStats._count.id,
    averageScore: Math.round(attemptStats._avg.scorePercentage ?? 0),
    totalWorksheets,
  };
}
