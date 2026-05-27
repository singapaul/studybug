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
      return NextResponse.json({ error: 'Pro plan required', code: 'PRO_REQUIRED' }, { status: 403 })
    }

    const worksheet = await db.worksheet.findUnique({ where: { id } })
    if (!worksheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const forbidden = enforceOwnership(worksheet, userId)
    if (forbidden) return forbidden

    const shareToken = worksheet.shareToken ?? crypto.randomUUID()
    const updated = await db.worksheet.update({ where: { id }, data: { shareToken } })

    return NextResponse.json({ shareToken: updated.shareToken })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('POST /api/worksheets/[id]/share error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function deleteHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const worksheet = await db.worksheet.findUnique({ where: { id } })
    if (!worksheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const forbidden = enforceOwnership(worksheet, userId)
    if (forbidden) return forbidden

    await db.worksheet.update({ where: { id }, data: { shareToken: null } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('DELETE /api/worksheets/[id]/share error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/:id/share')
export const DELETE = withLogging(deleteHandler, 'DELETE /api/worksheets/:id/share')
