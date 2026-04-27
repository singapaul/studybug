import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser, enforceOwnership, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

type Params = { params: Promise<{ id: string }> }

async function postHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req)
    const { id } = await params

    if (!isPro(plan)) {
      return NextResponse.json(
        { error: 'Pro plan required', code: 'PRO_REQUIRED' },
        { status: 403 },
      )
    }

    const game = await db.game.findUnique({ where: { id } })
    if (!game) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const forbidden = enforceOwnership(game, userId)
    if (forbidden) return forbidden

    const shareToken = crypto.randomUUID()
    const updated = await db.game.update({
      where: { id },
      data: { shareToken },
    })

    return NextResponse.json({ shareToken: updated.shareToken })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('POST /api/games/[id]/share error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function deleteHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const game = await db.game.findUnique({ where: { id } })
    if (!game) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const forbidden = enforceOwnership(game, userId)
    if (forbidden) return forbidden

    await db.game.update({ where: { id }, data: { shareToken: null } })

    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('DELETE /api/games/[id]/share error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withLogging(postHandler, 'POST /api/games/:id/share')
export const DELETE = withLogging(deleteHandler, 'DELETE /api/games/:id/share')
