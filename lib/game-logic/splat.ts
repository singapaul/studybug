/**
 * Score for a single Splat answer.
 * Correct: 100 base + speed bonus (up to 100 extra based on how quickly answered)
 * Wrong:   -10 penalty
 */
export function computeSplatScore(
  isCorrect: boolean,
  reactionMs: number,
  timeLimitMs: number
): number {
  if (!isCorrect) return -10
  const speedRatio = Math.max(0, 1 - reactionMs / timeLimitMs)
  const bonus = Math.round(speedRatio * 100)
  return 100 + bonus
}

/**
 * Pick `count` unique wrong answers from a pool, excluding the correct answer.
 */
export function generateWrongAnswers(
  pool: string[],
  correctAnswer: string,
  count: number
): string[] {
  const candidates = pool.filter((a) => a !== correctAnswer)
  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
