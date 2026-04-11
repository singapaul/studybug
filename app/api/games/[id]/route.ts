import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedUser, enforceOwnership } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
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

export async function PATCH(req: NextRequest, { params }: Params) {
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
        ...(gameData !== undefined && { gameData }),
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

export async function DELETE(req: NextRequest, { params }: Params) {
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
