import { describe, it, expect } from 'vitest'
import { computePairsStars, isPairsComplete } from '@/lib/game-logic/pairs'

describe('isPairsComplete', () => {
  it('returns true when all pairs are matched', () => {
    const matched = new Set(['p1', 'p2', 'p3'])
    expect(isPairsComplete(matched, 3)).toBe(true)
  })

  it('returns false when some pairs are unmatched', () => {
    const matched = new Set(['p1'])
    expect(isPairsComplete(matched, 3)).toBe(false)
  })

  it('returns false for empty set', () => {
    expect(isPairsComplete(new Set(), 3)).toBe(false)
  })
})

describe('computePairsStars', () => {
  it('gives 3 stars for perfect efficiency (minimum moves)', () => {
    // min moves = number of pairs; perfect = 100% efficiency
    expect(computePairsStars(3, 3)).toBe(3)
  })

  it('gives 2 stars for good efficiency', () => {
    // 3 pairs, 5 moves: efficiency = 3/5 = 60%
    expect(computePairsStars(5, 3)).toBe(2)
  })

  it('gives 1 star for poor efficiency', () => {
    // 3 pairs, 12 moves: efficiency = 3/12 = 25%
    expect(computePairsStars(12, 3)).toBe(1)
  })

  it('gives at least 1 star regardless of moves', () => {
    expect(computePairsStars(1000, 3)).toBeGreaterThanOrEqual(1)
  })
})
