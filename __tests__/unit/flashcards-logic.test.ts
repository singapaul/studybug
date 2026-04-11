import { describe, it, expect } from 'vitest'
import { computeFlashcardsScore, shuffleArray } from '@/lib/game-logic/flashcards'

describe('computeFlashcardsScore', () => {
  it('returns 100% when all cards are known', () => {
    const progress = [
      { cardId: '1', known: true, viewed: true },
      { cardId: '2', known: true, viewed: true },
    ]
    expect(computeFlashcardsScore(progress)).toBe(100)
  })

  it('returns 50% when half are known', () => {
    const progress = [
      { cardId: '1', known: true, viewed: true },
      { cardId: '2', known: false, viewed: true },
    ]
    expect(computeFlashcardsScore(progress)).toBe(50)
  })

  it('returns 0% when none are known', () => {
    const progress = [
      { cardId: '1', known: false, viewed: true },
      { cardId: '2', known: false, viewed: true },
    ]
    expect(computeFlashcardsScore(progress)).toBe(0)
  })

  it('returns 0% for empty progress', () => {
    expect(computeFlashcardsScore([])).toBe(0)
  })
})

describe('shuffleArray', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffleArray(arr)).toHaveLength(5)
  })

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(shuffleArray(arr).sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    const original = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(original)
  })
})
