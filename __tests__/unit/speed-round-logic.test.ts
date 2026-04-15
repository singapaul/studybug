import { describe, it, expect } from 'vitest'
import { buildRound, computeSpeedScore } from '@/lib/game-logic/speed-round'
import { SpeedRoundItem } from '@/types/game'

const ITEMS: SpeedRoundItem[] = Array.from({ length: 10 }, (_, i) => ({
  id: `item-${i}`,
  question: `Question ${i}`,
  answer: `Answer ${i}`,
}))

describe('buildRound', () => {
  it('returns one entry per item', () => {
    const round = buildRound(ITEMS)
    expect(round).toHaveLength(ITEMS.length)
  })

  it('each entry has 4 options', () => {
    const round = buildRound(ITEMS)
    round.forEach((q) => expect(q.options).toHaveLength(4))
  })

  it('each entry includes the correct answer as one of the options', () => {
    const round = buildRound(ITEMS)
    round.forEach((q, i) => {
      expect(q.options).toContain(ITEMS[i].answer)
    })
  })

  it('preserves question and answer on each entry', () => {
    const round = buildRound(ITEMS)
    expect(round[0].question).toBe(ITEMS[0].question)
    expect(round[0].answer).toBe(ITEMS[0].answer)
  })
})

describe('computeSpeedScore', () => {
  it('returns 100 when all correct', () => {
    expect(computeSpeedScore(10, 10)).toBe(100)
  })

  it('returns 0 when none correct', () => {
    expect(computeSpeedScore(0, 10)).toBe(0)
  })

  it('returns 50 for half correct', () => {
    expect(computeSpeedScore(5, 10)).toBe(50)
  })

  it('returns 0 when total is 0', () => {
    expect(computeSpeedScore(0, 0)).toBe(0)
  })
})
