import { z } from 'zod'

// Extracted from app/api/games/generate so both the enqueue route and the
// standalone background worker can parse generated game content.

const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
})

const PairSchema = z.object({
  id: z.string(),
  leftText: z.string().min(1),
  rightText: z.string().min(1),
})

const MultipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
})

const MultipleChoiceSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(MultipleChoiceOptionSchema).length(4),
})

const FillInTheBlankSchema = z.object({
  id: z.string(),
  sentence: z.string().refine((s) => s.includes('[blank]'), { message: 'Missing [blank]' }),
  answer: z.string().min(1),
})

const SpeedRoundSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  answer: z.string().min(1),
})

function parseItems<T>(items: unknown[], schema: z.ZodType<T>, label: string): T[] {
  return items.flatMap((item, i) => {
    const result = schema.safeParse(item)
    if (!result.success) {
      console.warn(`[game-parse] Skipping malformed ${label}[${i}]:`, result.error.issues)
      return []
    }
    return [result.data]
  })
}

export function parseGeneratedContent(json: string) {
  const raw = JSON.parse(json)

  return {
    flashcards: parseItems(
      Array.isArray(raw.flashcards) ? raw.flashcards : [],
      FlashcardSchema,
      'flashcard',
    ),
    pairs: parseItems(Array.isArray(raw.pairs) ? raw.pairs : [], PairSchema, 'pair'),
    multipleChoice: parseItems(
      Array.isArray(raw.multipleChoice) ? raw.multipleChoice : [],
      MultipleChoiceSchema,
      'multipleChoice',
    ),
    fillInTheBlank: parseItems(
      Array.isArray(raw.fillInTheBlank) ? raw.fillInTheBlank : [],
      FillInTheBlankSchema,
      'fillInTheBlank',
    ),
    speedRound: parseItems(
      Array.isArray(raw.speedRound) ? raw.speedRound : [],
      SpeedRoundSchema,
      'speedRound',
    ),
  }
}

export type ParsedGameContent = ReturnType<typeof parseGeneratedContent>
