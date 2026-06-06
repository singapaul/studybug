import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

const CreateSchema = z.object({ name: z.string().min(1).max(100) })

async function getHandler(req: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const folders = await db.worksheetFolder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ folders })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('GET /api/worksheet-folders error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function postHandler(req: NextRequest) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const parsed = CreateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 })
    }
    const folder = await db.worksheetFolder.create({
      data: { userId, name: parsed.data.name },
    })
    return NextResponse.json({ folder }, { status: 201 })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('POST /api/worksheet-folders error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withLogging(getHandler, 'GET /api/worksheet-folders')
export const POST = withLogging(postHandler, 'POST /api/worksheet-folders')
