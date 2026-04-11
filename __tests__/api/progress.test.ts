import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GameType } from '@prisma/client'

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

vi.mock('@/lib/db', () => ({
  db: {
    gameAttempt: {
      findMany: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockFindMany = db.gameAttempt.findMany as ReturnType<typeof vi.fn>

const FREE_SESSION = { user: { id: 'user-1', plan: 'free' } }
const PRO_SESSION = { user: { id: 'user-1', plan: 'pro' } }

function makeRequest() {
  return new NextRequest('http://localhost/api/progress')
}

beforeEach(() => vi.clearAllMocks())

const ATTEMPTS = [
  {
    id: 'a1',
    gameId: 'game-1',
    scorePercentage: 80,
    timeTaken: 5000,
    createdAt: new Date('2024-01-01'),
    game: { name: 'Flashcards', gameType: GameType.FLASHCARDS },
  },
  {
    id: 'a2',
    gameId: 'game-1',
    scorePercentage: 90,
    timeTaken: 4000,
    createdAt: new Date('2024-01-02'),
    game: { name: 'Flashcards', gameType: GameType.FLASHCARDS },
  },
  {
    id: 'a3',
    gameId: 'game-2',
    scorePercentage: 70,
    timeTaken: 6000,
    createdAt: new Date('2024-01-03'),
    game: { name: 'Pairs', gameType: GameType.PAIRS },
  },
]

describe('GET /api/progress', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/progress/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 403 for free user', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    const { GET } = await import('@/app/api/progress/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('PREMIUM_REQUIRED')
  })

  it('returns progress data for pro user', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockFindMany.mockResolvedValue(ATTEMPTS)
    const { GET } = await import('@/app/api/progress/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.personalBests).toBeDefined()
    expect(body.trend).toBeDefined()
    expect(body.summary).toBeDefined()
  })

  it('computes correct personal bests (max score per game)', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockFindMany.mockResolvedValue(ATTEMPTS)
    const { GET } = await import('@/app/api/progress/route')
    const res = await GET(makeRequest())
    const body = await res.json()
    const flashcardsBest = body.personalBests.find((b: { gameId: string }) => b.gameId === 'game-1')
    expect(flashcardsBest.bestScore).toBe(90)
    const pairsBest = body.personalBests.find((b: { gameId: string }) => b.gameId === 'game-2')
    expect(pairsBest.bestScore).toBe(70)
  })

  it('computes correct summary stats', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockFindMany.mockResolvedValue(ATTEMPTS)
    const { GET } = await import('@/app/api/progress/route')
    const res = await GET(makeRequest())
    const body = await res.json()
    expect(body.summary.totalAttempts).toBe(3)
    expect(body.summary.averageScore).toBe(80) // (80+90+70)/3
    expect(body.summary.gamesPlayed).toBe(2) // 2 distinct games
  })

  it('returns trend ordered by date ascending', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockFindMany.mockResolvedValue(ATTEMPTS)
    const { GET } = await import('@/app/api/progress/route')
    const res = await GET(makeRequest())
    const body = await res.json()
    const dates = body.trend.map((t: { date: string }) => new Date(t.date).getTime())
    expect(dates).toEqual([...dates].sort((a, b) => a - b))
  })
})
