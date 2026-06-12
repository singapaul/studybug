import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getAuthenticatedUser, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { SavedWorksheetContentSchema } from '@/types/worksheet'

type Params = { params: Promise<{ id: string }> }

const PatchSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    content: z.unknown().optional(),
    // null moves the worksheet out of any folder ("unfiled").
    folderId: z.string().min(1).nullable().optional(),
    isFavourite: z.boolean().optional(),
    tags: z.array(z.string().min(1).max(40)).max(20).optional(),
  })
  .refine(
    (d) =>
      d.title !== undefined ||
      d.content !== undefined ||
      d.folderId !== undefined ||
      d.isFavourite !== undefined ||
      d.tags !== undefined,
    { message: 'Provide a field to update' },
  )

async function getHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const worksheet = await db.worksheet.findUnique({ where: { id } })
    if (!worksheet) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const forbidden = enforceOwnership(worksheet, userId)
    if (forbidden) return forbidden

    return NextResponse.json({ worksheet })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('GET /api/worksheets/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function patchHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const existing = await db.worksheet.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const forbidden = enforceOwnership(existing, userId)
    if (forbidden) return forbidden

    const parsed = PatchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
    }

    const data: Prisma.WorksheetUpdateInput = {}

    if (parsed.data.content !== undefined) {
      const contentResult = SavedWorksheetContentSchema.safeParse(parsed.data.content)
      if (!contentResult.success) {
        return NextResponse.json(
          { error: 'Invalid worksheet content', issues: contentResult.error.issues },
          { status: 400 },
        )
      }
      const content = contentResult.data
      // Recompute totalMarks server-side so it always reflects the questions.
      content.totalMarks = content.sections.reduce(
        (sum, section) => sum + section.questions.reduce((s, q) => s + q.marks, 0),
        0,
      )
      data.content = content as unknown as Prisma.InputJsonValue
      // Keep the denormalized list columns in sync with the edited content.
      data.title = content.title
      data.topic = content.topic
      data.subject = content.subject || null
      data.yearGroup = content.yearGroup
      data.level = content.level
    }

    // An explicit title override (e.g. inline rename) wins over content.title.
    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title
    }

    if (parsed.data.folderId !== undefined) {
      data.folder = parsed.data.folderId
        ? { connect: { id: parsed.data.folderId } }
        : { disconnect: true }
    }

    if (parsed.data.isFavourite !== undefined) data.isFavourite = parsed.data.isFavourite
    if (parsed.data.tags !== undefined) data.tags = parsed.data.tags

    const worksheet = await db.worksheet.update({ where: { id }, data })

    return NextResponse.json({ worksheet })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('PATCH /api/worksheets/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function deleteHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const existing = await db.worksheet.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const forbidden = enforceOwnership(existing, userId)
    if (forbidden) return forbidden

    await db.worksheet.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('DELETE /api/worksheets/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withLogging(getHandler, 'GET /api/worksheets/:id')
export const PATCH = withLogging(patchHandler, 'PATCH /api/worksheets/:id')
export const DELETE = withLogging(deleteHandler, 'DELETE /api/worksheets/:id')
