import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthenticatedUser, enforceOwnership } from "@/lib/api-helpers";
import { withLogging } from "@/lib/with-logging";

type Params = { params: Promise<{ id: string }> };

async function getHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req);
    const { id } = await params;

    const game = await db.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = enforceOwnership(game, userId);
    if (forbidden) return forbidden;

    return NextResponse.json({
      game: { ...game, gameData: JSON.stringify(game.gameData) },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("GET /api/games/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function patchHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req);
    const { id } = await params;

    const game = await db.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = enforceOwnership(game, userId);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { name, gameData } = body as { name?: string; gameData?: unknown };

    const updated = await db.game.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(gameData != null && { gameData: gameData as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json({
      game: { ...updated, gameData: JSON.stringify(updated.gameData) },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("PATCH /api/games/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function deleteHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req);
    const { id } = await params;

    const game = await db.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const forbidden = enforceOwnership(game, userId);
    if (forbidden) return forbidden;

    await db.game.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error("DELETE /api/games/[id] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const GET = withLogging(getHandler, "GET /api/games/[id]");
export const PATCH = withLogging(patchHandler, "PATCH /api/games/[id]");
export const DELETE = withLogging(deleteHandler, "DELETE /api/games/[id]");
