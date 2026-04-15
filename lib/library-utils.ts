import {
  GameType,
  FlashcardsGameData,
  PairsGameData,
  MultipleChoiceGameData,
  SpeedRoundGameData,
  AnagramGameData,
  FillInTheBlankGameData,
} from '@/types/game'

export interface LibraryItem {
  term: string
  definition: string
  sentence?: string
}

// Minimum items required per game type (mirrors GameTemplate.minItems)
const MIN_ITEMS: Record<string, number> = {
  [GameType.FLASHCARDS]: 2,
  [GameType.PAIRS]: 3,
  [GameType.MULTIPLE_CHOICE]: 4, // needs 4 for distractors
  [GameType.SPEED_ROUND]: 3,
  [GameType.ANAGRAM]: 3,
  [GameType.FILL_IN_THE_BLANK]: 2,
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function toFlashcardsData(items: LibraryItem[]): FlashcardsGameData {
  return {
    cards: items.map((item) => ({
      id: crypto.randomUUID(),
      front: item.term,
      back: item.definition,
    })),
  }
}

export function toPairsData(items: LibraryItem[]): PairsGameData {
  return {
    items: items.map((item) => ({
      id: crypto.randomUUID(),
      leftText: item.term,
      rightText: item.definition,
    })),
  }
}

export function toMultipleChoiceData(items: LibraryItem[]): MultipleChoiceGameData {
  const definitions = items.map((i) => i.definition)

  return {
    questions: items.map((item) => {
      // 3 distractors: other definitions, shuffled, take first 3
      const distractors = shuffle(definitions.filter((d) => d !== item.definition)).slice(0, 3)
      const options = shuffle([
        { id: crypto.randomUUID(), text: item.definition, isCorrect: true },
        ...distractors.map((d) => ({ id: crypto.randomUUID(), text: d, isCorrect: false })),
      ])
      return {
        id: crypto.randomUUID(),
        question: `What is "${item.term}"?`,
        options,
      }
    }),
  }
}

export function toSpeedRoundData(items: LibraryItem[]): SpeedRoundGameData {
  return {
    timeLimit: 60,
    items: items.map((item) => ({
      id: crypto.randomUUID(),
      question: `What is "${item.term}"?`,
      answer: item.definition,
    })),
  }
}

export function toAnagramData(items: LibraryItem[]): AnagramGameData {
  // Anagram only works for single-word terms
  const singleWordItems = items.filter((i) => !i.term.includes(' '))
  return {
    items: singleWordItems.map((item) => ({
      id: crypto.randomUUID(),
      word: item.term,
      hint: item.definition,
    })),
  }
}

export function toFillInTheBlankData(items: LibraryItem[]): FillInTheBlankGameData {
  // Only items that have a sentence field
  const itemsWithSentence = items.filter((i) => !!i.sentence)
  return {
    items: itemsWithSentence.map((item) => ({
      id: crypto.randomUUID(),
      sentence: item.sentence!,
      answer: item.term,
    })),
  }
}

/**
 * Returns the game types that have enough items to be playable.
 * Swipe is excluded — library items don't have true/false statements.
 * Splat is excluded — requires a different data format.
 */
export function availableGameTypes(items: LibraryItem[]): GameType[] {
  const anagramCount = items.filter((i) => !i.term.includes(' ')).length
  const fillCount = items.filter((i) => !!i.sentence).length

  const checks: [GameType, number][] = [
    [GameType.FLASHCARDS, items.length],
    [GameType.PAIRS, items.length],
    [GameType.MULTIPLE_CHOICE, items.length],
    [GameType.SPEED_ROUND, items.length],
    [GameType.ANAGRAM, anagramCount],
    [GameType.FILL_IN_THE_BLANK, fillCount],
  ]

  return checks
    .filter(([type, count]) => count >= (MIN_ITEMS[type] ?? 2))
    .map(([type]) => type)
}
