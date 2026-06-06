import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

type Params = { params: Promise<{ id: string }> }

const PatchSchema = z.object({ name: z.string().min(1).max(100) })

async function patchHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const existing = await db.worksheetFolder.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const forbidden = enforceOwnership(existing, userId)
    if (forbidden) return forbidden

    const parsed = PatchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
    }

    const folder = await db.worksheetFolder.update({
      where: { id },
      data: { name: parsed.data.name },
    })
    return NextResponse.json({ folder })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('PATCH /api/worksheet-folders/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function deleteHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const existing = await db.worksheetFolder.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const forbidden = enforceOwnership(existing, userId)
    if (forbidden) return forbidden

    // Worksheets in this folder are unfiled automatically (folderId → null via onDelete: SetNull).
    await db.worksheetFolder.delete({ where: { id } })
    return new NextResponse(null, { status: 204 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('DELETE /api/worksheet-folders/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const PATCH = withLogging(patchHandler, 'PATCH /api/worksheet-folders/:id')
export const DELETE = withLogging(deleteHandler, 'DELETE /api/worksheet-folders/:id')
