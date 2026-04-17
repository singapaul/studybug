import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getAuthenticatedUser,
  isPro,
  FREE_GAME_LIMIT,
  FREE_GAME_TYPES,
} from "@/lib/api-helpers";
import { GameType, Prisma } from "@prisma/client";
import { withLogging } from "@/lib/with-logging";

async function getHandler(req: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser(req);

    const games = await db.game.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      games: games.map((g) => ({
        ...g,
        gameData: JSON.stringify(g.gameData),
      })),
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/games error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req);

    const body = await req.json();
    const { name, gameType, gameData, subject } = body as {
      name: string;
      gameType: GameType;
      gameData: unknown;
      subject?: string;
    };

    if (!name || !gameType || gameData === undefined) {
      return NextResponse.json(
        { error: "name, gameType, and gameData are required" },
        { status: 400 }
      );
    }

    if (!isPro(plan)) {
      if (!FREE_GAME_TYPES.includes(gameType)) {
        return NextResponse.json(
          {
            error: "This game type requires a Pro plan",
            code: "GAME_TYPE_RESTRICTED",
          },
          { status: 403 }
        );
      }

      const count = await db.game.count({ where: { userId } });
      if (count >= FREE_GAME_LIMIT) {
        return NextResponse.json(
          {
            error: "Free plan game limit reached",
            code: "GAME_LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    const game = await db.game.create({
      data: { userId, name, gameType, gameData: gameData as Prisma.InputJsonValue, subject: subject ?? null },
    });

    return NextResponse.json(
      { game: { ...game, gameData: JSON.stringify(game.gameData) } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("POST /api/games error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withLogging(getHandler, "GET /api/games");
export const POST = withLogging(postHandler, "POST /api/games");
