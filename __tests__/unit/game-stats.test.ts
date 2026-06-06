import { describe, it, expect } from 'vitest'
import { computeGameStats, type GameAttemptRecord } from '@/lib/game-stats'

function a(score: number, time: number, date: string): GameAttemptRecord {
  return { scorePercentage: score, timeTaken: time, createdAt: new Date(date) }
}

describe('computeGameStats', () => {
  it('returns zeroed stats for no attempts', () => {
    const s = computeGameStats([])
    expect(s.totalAttempts).toBe(0)
    expect(s.bestScore).toBe(0)
    expect(s.averageScore).toBe(0)
    expect(s.scoreSeries).toEqual([])
    expect(s.lastPlayed).toBeNull()
  })

  it('computes best, average and attempt count', () => {
    const s = computeGameStats([
      a(50, 20000, '2026-01-01'),
      a(90, 15000, '2026-01-02'),
      a(70, 18000, '2026-01-03'),
    ])
    expect(s.totalAttempts).toBe(3)
    expect(s.bestScore).toBe(90)
    expect(s.averageScore).toBe(70)
    expect(s.averageTimeMs).toBe(Math.round((20000 + 15000 + 18000) / 3))
  })

  it('orders the score series chronologically regardless of input order', () => {
    const s = computeGameStats([
      a(70, 1000, '2026-01-03'),
      a(50, 1000, '2026-01-01'),
      a(90, 1000, '2026-01-02'),
    ])
    expect(s.scoreSeries).toEqual([50, 90, 70])
    expect(s.lastPlayed).toEqual(new Date('2026-01-03'))
  })

  it('reports improvement as latest minus first', () => {
    const s = computeGameStats([a(40, 1000, '2026-01-01'), a(75, 1000, '2026-01-02')])
    expect(s.improvement).toBe(35)
  })
})
