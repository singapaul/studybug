import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withLogging } from '@/lib/with-logging'

type Params = { params: Promise<{ token: string }> }

async function getHandler(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params
    const worksheet = await db.worksheet.findUnique({ where: { shareToken: token } })
    if (!worksheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ worksheet })
  } catch (err) {
    console.error('GET /api/worksheets/share/[token] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withLogging(getHandler, 'GET /api/worksheets/share/:token')
