import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { GameType } from '@prisma/client'
import type {
  FlashcardsGameData,
  PairsGameData,
  MultipleChoiceGameData,
  SplatGameData,
  SwipeGameData,
  FillInTheBlankGameData,
  SpeedRoundGameData,
  AnagramGameData,
} from '@/types/game'

type Params = { params: Promise<{ id: string }> }

function csvCell(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return `"${escaped}"`
}

function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\n')
}

async function getHandler(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await getAuthenticatedUser(req)
    const { id } = await params

    const game = await db.game.findUnique({ where: { id } })
    if (!game) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const forbidden = enforceOwnership(game, userId)
    if (forbidden) return forbidden

    const data = game.gameData as Record<string, unknown>
    let csv = ''

    switch (game.gameType) {
      case GameType.FLASHCARDS: {
        const { cards } = data as unknown as FlashcardsGameData
        csv = buildCsv([
          ['front', 'back'],
          ...cards.map((c) => [c.front, c.back]),
        ])
        break
      }
      case GameType.PAIRS: {
        const { items } = data as unknown as PairsGameData
        csv = buildCsv([
          ['left', 'right'],
          ...items.map((i) => [i.leftText, i.rightText]),
        ])
        break
      }
      case GameType.MULTIPLE_CHOICE: {
        const { questions } = data as unknown as MultipleChoiceGameData
        csv = buildCsv([
          ['question', 'correct_answer', 'option_2', 'option_3', 'option_4'],
          ...questions.map((q) => {
            const correct = q.options.find((o) => o.isCorrect)?.text ?? ''
            const wrong = q.options.filter((o) => !o.isCorrect).map((o) => o.text)
            return [q.question, correct, wrong[0] ?? '', wrong[1] ?? '', wrong[2] ?? '']
          }),
        ])
        break
      }
      case GameType.FILL_IN_THE_BLANK: {
        const { items } = data as unknown as FillInTheBlankGameData
        csv = buildCsv([
          ['sentence', 'answer'],
          ...items.map((i) => [i.sentence, i.answer]),
        ])
        break
      }
      case GameType.SPEED_ROUND:
      case GameType.SPLAT: {
        const { items } = data as unknown as SpeedRoundGameData
        csv = buildCsv([
          ['question', 'answer'],
          ...items.map((i) => [i.question, i.answer]),
        ])
        break
      }
      case GameType.SWIPE: {
        const { items } = data as unknown as SwipeGameData
        csv = buildCsv([
          ['statement', 'is_correct', 'explanation'],
          ...items.map((i) => [i.statement, i.isCorrect ? 'true' : 'false', i.explanation ?? '']),
        ])
        break
      }
      case GameType.ANAGRAM: {
        const { items } = data as unknown as AnagramGameData
        csv = buildCsv([
          ['word', 'hint'],
          ...items.map((i) => [i.word, i.hint ?? '']),
        ])
        break
      }
      default:
        return NextResponse.json({ error: 'Export not supported for this game type' }, { status: 400 })
    }

    const safeName = game.name.replace(/[^a-z0-9_\- ]/gi, '_')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeName}.csv"`,
      },
    })
  } catch (err) {
    if (err instanceof NextResponse) return err
    console.error('GET /api/games/[id]/export error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withLogging(getHandler, 'GET /api/games/:id/export')
