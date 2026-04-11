import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GameType } from '@prisma/client'

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

vi.mock('@/lib/db', () => ({
  db: {
    game: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.game as {
  findUnique: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

const FREE_SESSION = { user: { id: 'user-1', plan: 'free' } }
const PRO_SESSION = { user: { id: 'user-1', plan: 'pro' } }
const OTHER_SESSION = { user: { id: 'user-2', plan: 'free' } }

const SAMPLE_GAME = {
  id: 'game-1',
  userId: 'user-1',
  name: 'My Flashcards',
  gameType: GameType.FLASHCARDS,
  gameData: { cards: [{ id: '1', front: 'A', back: 'B' }] },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

function makeRequest(method = 'GET', body?: unknown) {
  return new NextRequest('http://localhost/api/games/game-1', {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  })
}

const PARAMS = { params: Promise.resolve({ id: 'game-1' }) }

beforeEach(() => vi.clearAllMocks())

// ─── GET /api/games/[id] ──────────────────────────────────────────────────────

describe('GET /api/games/[id]', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/games/[id]/route')
    const res = await GET(makeRequest(), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 404 when game does not exist', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(null)
    const { GET } = await import('@/app/api/games/[id]/route')
    const res = await GET(makeRequest(), PARAMS)
    expect(res.status).toBe(404)
  })

  it('returns 403 when user does not own the game', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    const { GET } = await import('@/app/api/games/[id]/route')
    const res = await GET(makeRequest(), PARAMS)
    expect(res.status).toBe(403)
  })

  it('returns game with gameData as string for owner', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    const { GET } = await import('@/app/api/games/[id]/route')
    const res = await GET(makeRequest(), PARAMS)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game.id).toBe('game-1')
    expect(typeof body.game.gameData).toBe('string')
  })
})

// ─── PATCH /api/games/[id] ────────────────────────────────────────────────────

describe('PATCH /api/games/[id]', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/games/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { name: 'New Name' }), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user does not own the game', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    const { PATCH } = await import('@/app/api/games/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { name: 'New Name' }), PARAMS)
    expect(res.status).toBe(403)
  })

  it('updates game name', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    mockDb.update.mockResolvedValue({ ...SAMPLE_GAME, name: 'New Name' })
    const { PATCH } = await import('@/app/api/games/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { name: 'New Name' }), PARAMS)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game.name).toBe('New Name')
  })
})

// ─── DELETE /api/games/[id] ───────────────────────────────────────────────────

describe('DELETE /api/games/[id]', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { DELETE } = await import('@/app/api/games/[id]/route')
    const res = await DELETE(makeRequest('DELETE'), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user does not own the game', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    const { DELETE } = await import('@/app/api/games/[id]/route')
    const res = await DELETE(makeRequest('DELETE'), PARAMS)
    expect(res.status).toBe(403)
  })

  it('deletes game and returns success', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    mockDb.delete.mockResolvedValue(SAMPLE_GAME)
    const { DELETE } = await import('@/app/api/games/[id]/route')
    const res = await DELETE(makeRequest('DELETE'), PARAMS)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})

// ─── POST /api/games/[id]/duplicate ──────────────────────────────────────────

describe('POST /api/games/[id]/duplicate', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { POST } = await import('@/app/api/games/[id]/duplicate/route')
    const res = await POST(makeRequest('POST'), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user does not own the game', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    const { POST } = await import('@/app/api/games/[id]/duplicate/route')
    const res = await POST(makeRequest('POST'), PARAMS)
    expect(res.status).toBe(403)
  })

  it('returns 403 when free user is at game limit', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    mockDb.count.mockResolvedValue(3)
    const { POST } = await import('@/app/api/games/[id]/duplicate/route')
    const res = await POST(makeRequest('POST'), PARAMS)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.code).toBe('GAME_LIMIT_REACHED')
  })

  it('creates a copy with "(copy)" suffix', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_GAME)
    mockDb.count.mockResolvedValue(1)
    mockDb.create.mockResolvedValue({
      ...SAMPLE_GAME,
      id: 'game-2',
      name: 'My Flashcards (copy)',
    })
    const { POST } = await import('@/app/api/games/[id]/duplicate/route')
    const res = await POST(makeRequest('POST'), PARAMS)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.game.name).toBe('My Flashcards (copy)')
    expect(mockDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: 'My Flashcards (copy)' }),
      })
    )
  })
})
