import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Params = { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params

    const game = await db.game.findUnique({ where: { shareToken: token } })
    if (!game) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      game: { ...game, gameData: JSON.stringify(game.gameData) },
    })
  } catch (err) {
    console.error('GET /api/games/share/[token] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
