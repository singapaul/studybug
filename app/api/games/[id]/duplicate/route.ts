import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import {
  getAuthenticatedUser,
  enforceOwnership,
  isPro,
  FREE_GAME_LIMIT,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req);
    const { id } = await params;

    const game = await db.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = enforceOwnership(game, userId);
    if (forbidden) return forbidden;

    if (!isPro(plan)) {
      const count = await db.game.count({ where: { userId } });
      if (count >= FREE_GAME_LIMIT) {
        return NextResponse.json(
          { error: "Free plan game limit reached", code: "GAME_LIMIT_REACHED" },
          { status: 403 }
        );
      }
    }

    const copy = await db.game.create({
      data: {
        userId,
        name: `${game.name} (copy)`,
        gameType: game.gameType,
        gameData: game.gameData as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(
      { game: { ...copy, gameData: JSON.stringify(copy.gameData) } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("POST /api/games/[id]/duplicate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
