import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  getAuthenticatedUser,
  isPro,
  FREE_GAME_LIMIT,
  FREE_GAME_TYPES,
} from '@/lib/api-helpers'
import { GameType } from '@prisma/client'
import { LibraryItem } from '@/lib/library-utils'
import {
  toFlashcardsData,
  toPairsData,
  toMultipleChoiceData,
  toSpeedRoundData,
  toAnagramData,
  toFillInTheBlankData,
} from '@/lib/library-utils'

export async function POST(
  req: NextRequest,
  { params }: { params: { subject: string; topic: string } },
) {
  let userId: string
  let plan: string
  try {
    ;({ userId, plan } = await getAuthenticatedUser(req))
  } catch (err) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { gameType, gameName } = body as { gameType?: GameType; gameName?: string }

  if (!gameType) {
    return NextResponse.json({ error: 'gameType is required' }, { status: 400 })
  }

  // Find the subject
  const subject = await db.librarySubject.findUnique({
    where: { slug: params.subject },
  })
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 404 })
  }

  // Find the topic + deck
  const topic = await db.libraryTopic.findUnique({
    where: { subjectId_slug: { subjectId: subject.id, slug: params.topic } },
    include: { decks: true },
  })
  if (!topic || topic.decks.length === 0) {
    return NextResponse.json({ error: 'Topic or deck not found' }, { status: 404 })
  }

  const deck = topic.decks[0]
  const items = deck.items as unknown as LibraryItem[]

  // Derive game data for the chosen type
  let gameData: object
  switch (gameType) {
    case GameType.FLASHCARDS:
      gameData = toFlashcardsData(items)
      break
    case GameType.PAIRS:
      gameData = toPairsData(items)
      break
    case GameType.MULTIPLE_CHOICE:
      gameData = toMultipleChoiceData(items)
      break
    case GameType.SPEED_ROUND:
      gameData = toSpeedRoundData(items)
      break
    case GameType.ANAGRAM:
      gameData = toAnagramData(items)
      break
    case GameType.FILL_IN_THE_BLANK:
      gameData = toFillInTheBlankData(items)
      break
    default:
      return NextResponse.json(
        { error: `Game type ${gameType} is not supported for library decks` },
        { status: 400 },
      )
  }

  // Apply free tier restrictions
  if (!isPro(plan)) {
    if (!FREE_GAME_TYPES.includes(gameType)) {
      return NextResponse.json(
        { error: 'This game type requires a Pro plan', code: 'GAME_TYPE_RESTRICTED' },
        { status: 403 },
      )
    }

    const count = await db.game.count({ where: { userId } })
    if (count >= FREE_GAME_LIMIT) {
      return NextResponse.json(
        { error: 'Free plan game limit reached', code: 'GAME_LIMIT_REACHED' },
        { status: 403 },
      )
    }
  }

  const name = gameName ?? `${subject.name}: ${topic.name}`

  const game = await db.game.create({
    data: {
      userId,
      name,
      gameType,
      gameData,
      sourceLibraryDeckId: deck.id,
    },
  })

  return NextResponse.json(
    { game: { ...game, gameData: JSON.stringify(game.gameData) } },
    { status: 201 },
  )
}
