import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GameType } from '@prisma/client'

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

vi.mock('@/lib/db', () => ({
  db: {
    game: { findUnique: vi.fn() },
    gameAttempt: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockGame = db.game.findUnique as ReturnType<typeof vi.fn>
const mockAttempt = db.gameAttempt as {
  create: ReturnType<typeof vi.fn>
  findMany: ReturnType<typeof vi.fn>
}

const FREE_SESSION = { user: { id: 'user-1', plan: 'free' } }
const PRO_SESSION = { user: { id: 'user-1', plan: 'pro' } }
const OTHER_SESSION = { user: { id: 'user-2', plan: 'free' } }

const SAMPLE_GAME = {
  id: 'game-1',
  userId: 'user-1',
  gameType: GameType.FLASHCARDS,
  gameData: {},
}

const PARAMS = { params: Promise.resolve({ id: 'game-1' }) }

function makeRequest(method = 'POST', body?: unknown) {
  return new NextRequest('http://localhost/api/games/game-1/attempts', {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('POST /api/games/[id]/attempts', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { POST } = await import('@/app/api/games/[id]/attempts/route')
    const res = await POST(makeRequest('POST', { scorePercentage: 80, timeTaken: 5000 }), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 if user does not own game', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockGame.mockResolvedValue(SAMPLE_GAME)
    const { POST } = await import('@/app/api/games/[id]/attempts/route')
    const res = await POST(makeRequest('POST', { scorePercentage: 80, timeTaken: 5000 }), PARAMS)
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid scorePercentage', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockGame.mockResolvedValue(SAMPLE_GAME)
    const { POST } = await import('@/app/api/games/[id]/attempts/route')
    const res = await POST(makeRequest('POST', { scorePercentage: 150, timeTaken: 5000 }), PARAMS)
    expect(res.status).toBe(400)
  })

  it('returns 400 for negative timeTaken', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockGame.mockResolvedValue(SAMPLE_GAME)
    const { POST } = await import('@/app/api/games/[id]/attempts/route')
    const res = await POST(makeRequest('POST', { scorePercentage: 80, timeTaken: -1 }), PARAMS)
    expect(res.status).toBe(400)
  })

  it('saves attempt and returns 201 for free user', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockGame.mockResolvedValue(SAMPLE_GAME)
    mockAttempt.create.mockResolvedValue({
      id: 'attempt-1',
      userId: 'user-1',
      gameId: 'game-1',
      scorePercentage: 80,
      timeTaken: 5000,
      createdAt: new Date(),
    })
    const { POST } = await import('@/app/api/games/[id]/attempts/route')
    const res = await POST(makeRequest('POST', { scorePercentage: 80, timeTaken: 5000 }), PARAMS)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.attempt.id).toBe('attempt-1')
  })

  it('saves attempt for pro user too', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockGame.mockResolvedValue(SAMPLE_GAME)
    mockAttempt.create.mockResolvedValue({ id: 'attempt-2', scorePercentage: 95, timeTaken: 3000 })
    const { POST } = await import('@/app/api/games/[id]/attempts/route')
    const res = await POST(makeRequest('POST', { scorePercentage: 95, timeTaken: 3000 }), PARAMS)
    expect(res.status).toBe(201)
  })
})

describe('GET /api/games/[id]/attempts', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/games/[id]/attempts/route')
    const res = await GET(makeRequest('GET'), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 for free user (premium gate)', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    const { GET } = await import('@/app/api/games/[id]/attempts/route')
    const res = await GET(makeRequest('GET'), PARAMS)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('PREMIUM_REQUIRED')
  })

  it('returns 403 if pro user does not own game', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-2', plan: 'pro' } })
    mockGame.mockResolvedValue(SAMPLE_GAME)
    const { GET } = await import('@/app/api/games/[id]/attempts/route')
    const res = await GET(makeRequest('GET'), PARAMS)
    expect(res.status).toBe(403)
  })

  it('returns attempts for pro user who owns the game', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockGame.mockResolvedValue(SAMPLE_GAME)
    mockAttempt.findMany.mockResolvedValue([
      { id: 'a1', scorePercentage: 80, timeTaken: 5000, createdAt: new Date() },
    ])
    const { GET } = await import('@/app/api/games/[id]/attempts/route')
    const res = await GET(makeRequest('GET'), PARAMS)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.attempts).toHaveLength(1)
  })
})
