import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withLogging } from '@/lib/with-logging'

export const dynamic = 'force-dynamic'

async function getHandler(_req: NextRequest) {
  const subjects = await db.librarySubject.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { topics: true } },
    },
  })

  return NextResponse.json({
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      icon: s.icon,
      color: s.color,
      isFree: s.isFree,
      sortOrder: s.sortOrder,
      topicCount: s._count.topics,
    })),
  })
}

export const GET = withLogging(getHandler, 'GET /api/library')
