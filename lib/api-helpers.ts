import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GameType } from "@prisma/client";

export const FREE_GAME_LIMIT = 3;
export const FREE_GAME_TYPES: GameType[] = [
  GameType.FLASHCARDS,
  GameType.PAIRS,
  GameType.MULTIPLE_CHOICE,
];

export function isPro(plan: string): boolean {
  return plan === "pro";
}

export async function getAuthenticatedUser(
  req: NextRequest
): Promise<{ userId: string; plan: string }> {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = (session.user as { plan?: string }).plan ?? "free";
  return { userId: session.user.id, plan };
}

export function enforceOwnership(
  resource: { userId: string },
  userId: string
): NextResponse | null {
  if (resource.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
