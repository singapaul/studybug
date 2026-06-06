import { GameType, type GameData } from '@/types/game'
import type { LibraryDeck } from '@/hooks/use-library'

export interface WorksheetSeed {
  topic: string
  subject?: string
  pastedText: string
}

const SEED_KEY = 'worksheet-seed'

/** Stash a seed before navigating to /worksheets/new (avoids long URLs). */
export function stashWorksheetSeed(seed: WorksheetSeed): void {
  if (typeof window !== 'undefined') sessionStorage.setItem(SEED_KEY, JSON.stringify(seed))
}

/** Read and clear a stashed seed. Returns null if none/invalid. */
export function takeWorksheetSeed(): WorksheetSeed | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(SEED_KEY)
  if (!raw) return null
  sessionStorage.removeItem(SEED_KEY)
  try {
    return JSON.parse(raw) as WorksheetSeed
  } catch {
    return null
  }
}

/** Build source text from a library deck so a worksheet can be generated from it. */
export function libraryDeckToSeed(deck: LibraryDeck, subject?: string): WorksheetSeed {
  const lines = deck.items.map((item) => {
    const base = `${item.term}: ${item.definition}`
    return item.sentence ? `${base} — ${item.sentence}` : base
  })
  return {
    topic: deck.name,
    subject: subject || undefined,
    pastedText: lines.join('\n'),
  }
}

interface GameLike {
  name: string
  subject?: string | null
  gameType: GameType
  gameData: GameData
}

/** Build source text from a user's game so a worksheet can be generated from it. */
export function gameToSeed(game: GameLike): WorksheetSeed {
  const lines = gameDataToLines(game.gameType, game.gameData)
  return {
    topic: game.name,
    subject: game.subject || undefined,
    pastedText: lines.join('\n'),
  }
}

function gameDataToLines(type: GameType, data: GameData): string[] {
  switch (type) {
    case GameType.FLASHCARDS:
      return 'cards' in data ? data.cards.map((c) => `${c.front}: ${c.back}`) : []
    case GameType.PAIRS:
      return 'items' in data ? (data.items as { leftText: string; rightText: string }[]).map((i) => `${i.leftText}: ${i.rightText}`) : []
    case GameType.MULTIPLE_CHOICE:
      return 'questions' in data
        ? data.questions.map((q) => {
            const correct = q.options.find((o) => o.isCorrect)?.text ?? ''
            return `${q.question} (answer: ${correct})`
          })
        : []
    case GameType.SPLAT:
    case GameType.SPEED_ROUND:
      return 'items' in data ? (data.items as { question: string; answer: string }[]).map((i) => `${i.question}: ${i.answer}`) : []
    case GameType.SWIPE:
      return 'items' in data
        ? (data.items as { statement: string; isCorrect: boolean }[]).map((i) => `${i.statement} (${i.isCorrect ? 'True' : 'False'})`)
        : []
    case GameType.FILL_IN_THE_BLANK:
      return 'items' in data
        ? (data.items as { sentence: string; answer: string }[]).map((i) => `${i.sentence} (answer: ${i.answer})`)
        : []
    case GameType.ANAGRAM:
      return 'items' in data
        ? (data.items as { word: string; hint?: string }[]).map((i) => (i.hint ? `${i.word} — ${i.hint}` : i.word))
        : []
    default:
      return []
  }
}
