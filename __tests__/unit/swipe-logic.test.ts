import { describe, it, expect } from 'vitest'
import { computeSwipeScore, applyUndo, SwipeRecord } from '@/lib/game-logic/swipe'

describe('computeSwipeScore', () => {
  it('counts correct swipes', () => {
    const records: SwipeRecord[] = [
      { itemId: '1', swiped: 'right', correct: true },
      { itemId: '2', swiped: 'left', correct: false },
      { itemId: '3', swiped: 'right', correct: true },
    ]
    const { correctCount, scorePercentage } = computeSwipeScore(records)
    expect(correctCount).toBe(2)
    expect(scorePercentage).toBeCloseTo(66.67, 0)
  })

  it('returns 100% for all correct', () => {
    const records: SwipeRecord[] = [
      { itemId: '1', swiped: 'right', correct: true },
      { itemId: '2', swiped: 'left', correct: true },
    ]
    expect(computeSwipeScore(records).scorePercentage).toBe(100)
  })

  it('returns 0% for all wrong', () => {
    const records: SwipeRecord[] = [
      { itemId: '1', swiped: 'right', correct: false },
    ]
    expect(computeSwipeScore(records).scorePercentage).toBe(0)
  })
})

describe('applyUndo', () => {
  it('removes the last record', () => {
    const records: SwipeRecord[] = [
      { itemId: '1', swiped: 'right', correct: true },
      { itemId: '2', swiped: 'left', correct: false },
    ]
    const result = applyUndo(records)
    expect(result).toHaveLength(1)
    expect(result[0].itemId).toBe('1')
  })

  it('returns empty array when undoing from empty', () => {
    expect(applyUndo([])).toEqual([])
  })
})
