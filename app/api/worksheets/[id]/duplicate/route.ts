import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { getAuthenticatedUser, enforceOwnership, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

type Params = { params: Promise<{ id: string }> }

async function postHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req)

    if (!isPro(plan)) {
      return NextResponse.json({ error: 'Pro plan required', code: 'PRO_REQUIRED' }, { status: 403 })
    }

    const { id } = await params
    const source = await db.worksheet.findUnique({ where: { id } })
    if (!source) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const forbidden = enforceOwnership(source, userId)
    if (forbidden) return forbidden

    const worksheet = await db.worksheet.create({
      data: {
        userId,
        title: `${source.title} (copy)`,
        topic: source.topic,
        subject: source.subject,
        yearGroup: source.yearGroup,
        level: source.level,
        content: source.content as Prisma.InputJsonValue,
        folderId: source.folderId,
        // shareToken intentionally omitted — copies are private until reshared.
      },
    })

    return NextResponse.json({ worksheet }, { status: 201 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('POST /api/worksheets/[id]/duplicate error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/:id/duplicate')
