import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthenticatedUser, enforceOwnership, isPro } from "@/lib/api-helpers";
import { withLogging } from "@/lib/with-logging";

type Params = { params: Promise<{ id: string }> };

async function postHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req);
    const { id: gameId } = await params;

    const game = await db.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = enforceOwnership(game, userId);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { scorePercentage, timeTaken, attemptData } = body as {
      scorePercentage: number;
      timeTaken: number;
      attemptData?: unknown;
    };

    if (
      typeof scorePercentage !== "number" ||
      scorePercentage < 0 ||
      scorePercentage > 100 ||
      !Number.isInteger(scorePercentage)
    ) {
      return NextResponse.json(
        { error: "scorePercentage must be an integer between 0 and 100" },
        { status: 400 }
      );
    }

    if (typeof timeTaken !== "number" || timeTaken < 0) {
      return NextResponse.json(
        { error: "timeTaken must be a non-negative number" },
        { status: 400 }
      );
    }

    const attempt = await db.gameAttempt.create({
      data: {
        userId,
        gameId,
        scorePercentage,
        timeTaken,
        ...(attemptData != null && { attemptData: attemptData as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json({ attempt }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("POST /api/games/[id]/attempts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req);

    if (!isPro(plan)) {
      return NextResponse.json(
        { error: "Progress history requires a Pro plan", code: "PREMIUM_REQUIRED" },
        { status: 403 }
      );
    }

    const { id: gameId } = await params;

    const game = await db.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = enforceOwnership(game, userId);
    if (forbidden) return forbidden;

    const attempts = await db.gameAttempt.findMany({
      where: { gameId, userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ attempts });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/games/[id]/attempts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withLogging(postHandler, "POST /api/games/[id]/attempts");
export const GET = withLogging(getHandler, "GET /api/games/[id]/attempts");
