import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { parseGeneratedWorksheet } from '@/types/worksheet'

const SaveSchema = z.object({
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(200),
  subject: z.string().max(100).optional().nullable(),
  yearGroup: z.string().min(1).max(40),
  level: z.string().min(1).max(40),
  content: z.unknown(),
})

async function getHandler(req: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser(req)

    const folderId = req.nextUrl.searchParams.get('folderId')
    const where: { userId: string; folderId?: string | null } = { userId }
    if (folderId === 'unfiled') where.folderId = null
    else if (folderId) where.folderId = folderId

    const worksheets = await db.worksheet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, topic: true, subject: true,
        yearGroup: true, level: true, shareToken: true, folderId: true,
        createdAt: true, updatedAt: true,
      },
    })
    return NextResponse.json({ worksheets })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('GET /api/worksheets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function postHandler(req: NextRequest) {
  try {
    const { userId, plan } = await getAuthenticatedUser(req)

    if (!isPro(plan)) {
      return NextResponse.json({ error: 'Pro plan required', code: 'PRO_REQUIRED' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = SaveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid worksheet payload', issues: parsed.error.issues },
        { status: 400 },
      )
    }

    // Validate the content shape matches our worksheet schema.
    let content
    try {
      content = parseGeneratedWorksheet(JSON.stringify(parsed.data.content))
    } catch (err) {
      console.error('POST /api/worksheets content validation error:', err)
      return NextResponse.json({ error: 'Invalid worksheet content shape' }, { status: 400 })
    }

    const worksheet = await db.worksheet.create({
      data: {
        userId,
        title: parsed.data.title,
        topic: parsed.data.topic,
        subject: parsed.data.subject ?? null,
        yearGroup: parsed.data.yearGroup,
        level: parsed.data.level,
        content: content as unknown as Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({ worksheet }, { status: 201 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('POST /api/worksheets error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withLogging(getHandler, 'GET /api/worksheets')
export const POST = withLogging(postHandler, 'POST /api/worksheets')
