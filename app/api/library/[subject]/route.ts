import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withLogging } from '@/lib/with-logging'

async function getHandler(
  _req: NextRequest,
  { params }: { params: { subject: string } },
) {
  const subject = await db.librarySubject.findUnique({
    where: { slug: params.subject },
    include: {
      topics: {
        orderBy: { sortOrder: 'asc' },
        include: {
          decks: {
            select: { id: true, itemCount: true, tags: true },
          },
        },
      },
    },
  })

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  return NextResponse.json({
    subject: {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      icon: subject.icon,
      color: subject.color,
      isFree: subject.isFree,
      topics: subject.topics.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        sortOrder: t.sortOrder,
        deck: t.decks[0]
          ? { id: t.decks[0].id, itemCount: t.decks[0].itemCount, tags: t.decks[0].tags }
          : null,
      })),
    },
  })
}

export const GET = withLogging(getHandler, 'GET /api/library/:subject')
