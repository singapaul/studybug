import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { getAuthenticatedUser, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

type Params = { params: Promise<{ id: string }> }

const PatchSchema = z.object({
  title: z.string().min(1).max(200),
})

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

    const worksheet = await db.worksheet.update({
      where: { id },
      data: { title: parsed.data.title },
    })

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
