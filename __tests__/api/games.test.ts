import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GameType } from '@prisma/client'

// Mock auth and db before importing the route handlers
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/db', () => ({
  db: {
    game: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.game as {
  findMany: ReturnType<typeof vi.fn>
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
}

function makeRequest(method = 'GET', body?: unknown, path = 'http://localhost/api/games') {
  return new NextRequest(path, {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  })
}

const FREE_SESSION = { user: { id: 'user-1', plan: 'free' } }
const PRO_SESSION = { user: { id: 'user-1', plan: 'pro' } }

const SAMPLE_GAME = {
  id: 'game-1',
  userId: 'user-1',
  name: 'My Flashcards',
  gameType: GameType.FLASHCARDS,
  gameData: { cards: [{ id: '1', front: 'A', back: 'B' }] },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── GET /api/games ───────────────────────────────────────────────────────────

describe('GET /api/games', () => {
  it('returns 401 without a session', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/games/route')
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns empty array for a new user', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findMany.mockResolvedValue([])
    const { GET } = await import('@/app/api/games/route')
    const res = await GET(makeRequest())
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.games).toEqual([])
  })

  it('returns games with gameData serialised as a string', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findMany.mockResolvedValue([SAMPLE_GAME])
    const { GET } = await import('@/app/api/games/route')
    const res = await GET(makeRequest())
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.games).toHaveLength(1)
    expect(typeof body.games[0].gameData).toBe('string')
    expect(JSON.parse(body.games[0].gameData)).toEqual(SAMPLE_GAME.gameData)
  })
})

// ─── POST /api/games ──────────────────────────────────────────────────────────

describe('POST /api/games', () => {
  it('returns 401 without a session', async () => {
    mockAuth.mockResolvedValue(null)
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(makeRequest('POST', { name: 'Test', gameType: GameType.FLASHCARDS, gameData: {} }))
    expect(res.status).toBe(401)
  })

  it('creates a flashcard game for a free user', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.count.mockResolvedValue(0)
    mockDb.create.mockResolvedValue(SAMPLE_GAME)
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(
      makeRequest('POST', {
        name: 'My Flashcards',
        gameType: GameType.FLASHCARDS,
        gameData: { cards: [] },
      })
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.game.id).toBe('game-1')
  })

  it('blocks a free user from creating a SPLAT game', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(
      makeRequest('POST', { name: 'Splat', gameType: GameType.SPLAT, gameData: {} })
    )
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('GAME_TYPE_RESTRICTED')
  })

  it('blocks a free user from creating a SWIPE game', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(
      makeRequest('POST', { name: 'Swipe', gameType: GameType.SWIPE, gameData: {} })
    )
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('GAME_TYPE_RESTRICTED')
  })

  it('blocks a free user who already has 3 games', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.count.mockResolvedValue(3)
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(
      makeRequest('POST', { name: 'Another', gameType: GameType.FLASHCARDS, gameData: {} })
    )
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('GAME_LIMIT_REACHED')
  })

  it('allows a pro user to create a SPLAT game', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.create.mockResolvedValue({ ...SAMPLE_GAME, gameType: GameType.SPLAT })
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(
      makeRequest('POST', { name: 'Splat', gameType: GameType.SPLAT, gameData: { items: [] } })
    )
    expect(res.status).toBe(201)
  })

  it('allows a pro user to create more than 3 games', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.create.mockResolvedValue(SAMPLE_GAME)
    const { POST } = await import('@/app/api/games/route')
    const res = await POST(
      makeRequest('POST', { name: 'Game 4', gameType: GameType.FLASHCARDS, gameData: {} })
    )
    expect(res.status).toBe(201)
  })
})
