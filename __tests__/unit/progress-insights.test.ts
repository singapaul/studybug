import { describe, it, expect } from 'vitest'
import {
  filterAttemptsByDays,
  computeSubjectBreakdown,
  computeTypeBreakdown,
  deriveInsights,
  attemptsToCsv,
  type AttemptRecord,
} from '@/lib/progress-insights'

function att(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    scorePercentage: 50,
    timeTaken: 30000,
    createdAt: new Date('2026-01-10T00:00:00Z'),
    gameName: 'Game',
    gameType: 'FLASHCARDS',
    subject: 'Biology',
    ...overrides,
  }
}

describe('filterAttemptsByDays', () => {
  const now = new Date('2026-01-31T00:00:00Z')
  const recent = att({ createdAt: new Date('2026-01-29T00:00:00Z') })
  const old = att({ createdAt: new Date('2026-01-01T00:00:00Z') })

  it('returns all attempts when days is null', () => {
    expect(filterAttemptsByDays([recent, old], null, now)).toHaveLength(2)
  })

  it('keeps only attempts within the window', () => {
    const result = filterAttemptsByDays([recent, old], 7, now)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe(recent)
  })
})

describe('computeSubjectBreakdown', () => {
  it('groups by subject with count and rounded average', () => {
    const rows = computeSubjectBreakdown([
      att({ subject: 'Biology', scorePercentage: 80 }),
      att({ subject: 'Biology', scorePercentage: 60 }),
      att({ subject: 'Maths', scorePercentage: 90 }),
    ])
    const bio = rows.find((r) => r.subject === 'Biology')!
    expect(bio.attempts).toBe(2)
    expect(bio.averageScore).toBe(70)
    expect(rows.find((r) => r.subject === 'Maths')!.attempts).toBe(1)
  })

  it('buckets missing subject as "Uncategorised"', () => {
    const rows = computeSubjectBreakdown([att({ subject: null })])
    expect(rows[0].subject).toBe('Uncategorised')
  })

  it('sorts by average score descending', () => {
    const rows = computeSubjectBreakdown([
      att({ subject: 'Low', scorePercentage: 30 }),
      att({ subject: 'High', scorePercentage: 95 }),
    ])
    expect(rows[0].subject).toBe('High')
  })
})

describe('computeTypeBreakdown', () => {
  it('groups by game type', () => {
    const rows = computeTypeBreakdown([
      att({ gameType: 'FLASHCARDS', scorePercentage: 100 }),
      att({ gameType: 'PAIRS', scorePercentage: 50 }),
      att({ gameType: 'FLASHCARDS', scorePercentage: 80 }),
    ])
    expect(rows.find((r) => r.gameType === 'FLASHCARDS')!.attempts).toBe(2)
    expect(rows.find((r) => r.gameType === 'FLASHCARDS')!.averageScore).toBe(90)
  })
})

describe('deriveInsights', () => {
  it('flags strongest and weakest subjects (needs >= 2 attempts each)', () => {
    const attempts = [
      att({ subject: 'Biology', scorePercentage: 90 }),
      att({ subject: 'Biology', scorePercentage: 88 }),
      att({ subject: 'History', scorePercentage: 40 }),
      att({ subject: 'History', scorePercentage: 44 }),
    ]
    const insights = deriveInsights(attempts)
    const messages = insights.map((i) => i.message).join(' ')
    expect(messages).toContain('Biology')
    expect(messages).toContain('History')
  })

  it('detects an improving trend (later half scores higher)', () => {
    const attempts = [
      att({ createdAt: new Date('2026-01-01'), scorePercentage: 40 }),
      att({ createdAt: new Date('2026-01-02'), scorePercentage: 45 }),
      att({ createdAt: new Date('2026-01-03'), scorePercentage: 80 }),
      att({ createdAt: new Date('2026-01-04'), scorePercentage: 85 }),
    ]
    const insights = deriveInsights(attempts)
    expect(insights.some((i) => i.type === 'trend' && /improv/i.test(i.message))).toBe(true)
  })

  it('returns no insights for too little data', () => {
    expect(deriveInsights([att()])).toEqual([])
  })
})

describe('attemptsToCsv', () => {
  it('produces a header and one row per attempt', () => {
    const csv = attemptsToCsv([
      att({ gameName: 'Cells', subject: 'Biology', gameType: 'FLASHCARDS', scorePercentage: 80, timeTaken: 30000 }),
    ])
    const lines = csv.split('\n')
    expect(lines[0]).toBe('Game,Subject,Type,Score (%),Time (s),Date')
    expect(lines[1]).toContain('Cells')
    expect(lines[1]).toContain('Biology')
    expect(lines[1]).toContain('80')
    expect(lines[1]).toContain('30')
  })

  it('escapes commas and quotes in fields', () => {
    const csv = attemptsToCsv([att({ gameName: 'A, "B"', subject: null })])
    expect(csv.split('\n')[1]).toContain('"A, ""B"""')
    expect(csv).toContain('Uncategorised')
  })
})
