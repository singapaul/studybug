import { describe, it, expect } from 'vitest'
import { computeSplatScore, generateWrongAnswers } from '@/lib/game-logic/splat'

describe('computeSplatScore', () => {
  it('awards base 100 points for a correct answer', () => {
    const score = computeSplatScore(true, 5000, 10000)
    expect(score).toBeGreaterThanOrEqual(100)
  })

  it('awards more points for faster answers', () => {
    const slow = computeSplatScore(true, 9000, 10000)
    const fast = computeSplatScore(true, 1000, 10000)
    expect(fast).toBeGreaterThan(slow)
  })

  it('deducts 10 points for a wrong answer', () => {
    expect(computeSplatScore(false, 5000, 10000)).toBe(-10)
  })

  it('score is never negative for a correct answer', () => {
    expect(computeSplatScore(true, 10000, 10000)).toBeGreaterThanOrEqual(0)
  })
})

describe('generateWrongAnswers', () => {
  it('returns the requested count of wrong answers', () => {
    const pool = ['a', 'b', 'c', 'd', 'e']
    const correct = 'x'
    const wrong = generateWrongAnswers(pool, correct, 3)
    expect(wrong).toHaveLength(3)
  })

  it('never includes the correct answer', () => {
    const pool = ['a', 'b', 'c', 'd', 'e']
    const correct = 'a'
    const wrong = generateWrongAnswers(pool, correct, 3)
    expect(wrong).not.toContain(correct)
  })

  it('returns unique answers', () => {
    const pool = ['a', 'b', 'c', 'd', 'e']
    const wrong = generateWrongAnswers(pool, 'x', 3)
    expect(new Set(wrong).size).toBe(wrong.length)
  })
})
