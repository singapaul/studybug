import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withLogging } from '@/lib/with-logging'

async function getHandler(
  _req: NextRequest,
  { params }: { params: { subject: string; topic: string } },
) {
  const subject = await db.librarySubject.findUnique({
    where: { slug: params.subject },
  })

  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  const topic = await db.libraryTopic.findUnique({
    where: { subjectId_slug: { subjectId: subject.id, slug: params.topic } },
    include: {
      decks: true,
    },
  })

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  const deck = topic.decks[0] ?? null

  return NextResponse.json({
    subject: {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      icon: subject.icon,
      color: subject.color,
      isFree: subject.isFree,
    },
    topic: {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
    },
    deck: deck
      ? {
          id: deck.id,
          name: deck.name,
          description: deck.description,
          items: deck.items,
          tags: deck.tags,
          itemCount: deck.itemCount,
        }
      : null,
  })
}

export const GET = withLogging(getHandler, 'GET /api/library/:subject/:topic')
