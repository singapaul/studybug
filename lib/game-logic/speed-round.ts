import { SpeedRoundItem } from '@/types/game'

export interface QuestionWithOptions {
  id: string
  question: string
  answer: string
  options: string[]
}

export function buildRound(items: SpeedRoundItem[]): QuestionWithOptions[] {
  const allAnswers = items.map((it) => it.answer)

  return items.map((item) => {
    const distractors = item.distractors?.length
      ? item.distractors
      : allAnswers.filter((a) => a !== item.answer)

    // Pick 3 distractors (or fewer if not enough)
    const shuffled = [...distractors].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, 3)

    // Build 4 options and shuffle them
    const options = [item.answer, ...picked].sort(() => Math.random() - 0.5)

    return { id: item.id, question: item.question, answer: item.answer, options }
  })
}

export function computeSpeedScore(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}
