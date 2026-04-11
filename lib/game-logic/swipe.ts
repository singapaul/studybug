export interface SwipeRecord {
  itemId: string
  swiped: 'left' | 'right'
  correct: boolean
}

export function computeSwipeScore(records: SwipeRecord[]): {
  correctCount: number
  incorrectCount: number
  scorePercentage: number
} {
  const correctCount = records.filter((r) => r.correct).length
  const incorrectCount = records.length - correctCount
  const scorePercentage = records.length === 0 ? 0 : (correctCount / records.length) * 100
  return { correctCount, incorrectCount, scorePercentage }
}

export function applyUndo(records: SwipeRecord[]): SwipeRecord[] {
  if (records.length === 0) return []
  return records.slice(0, -1)
}
