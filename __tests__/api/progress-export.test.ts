import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({ db: { gameAttempt: { findMany: vi.fn() } } }))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.gameAttempt as { findMany: ReturnType<typeof vi.fn> }

const PRO = { user: { id: 'user-1', plan: 'pro' } }
const FREE = { user: { id: 'user-1', plan: 'free' } }

function req(qs = '') {
  return new NextRequest(`http://localhost/api/progress/export${qs}`)
}

beforeEach(() => vi.clearAllMocks())

describe('GET /api/progress/export', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/progress/export/route')
    expect((await GET(req())).status).toBe(401)
  })

  it('returns 403 for non-Pro users', async () => {
    mockAuth.mockResolvedValue(FREE)
    const { GET } = await import('@/app/api/progress/export/route')
    expect((await GET(req())).status).toBe(403)
  })

  it('returns CSV with a header and a row per attempt for Pro users', async () => {
    mockAuth.mockResolvedValue(PRO)
    mockDb.findMany.mockResolvedValue([
      {
        scorePercentage: 80,
        timeTaken: 30000,
        createdAt: new Date('2026-01-10T00:00:00Z'),
        game: { name: 'Cells', gameType: 'FLASHCARDS', subject: 'Biology' },
      },
    ])
    const { GET } = await import('@/app/api/progress/export/route')
    const res = await GET(req('?days=all'))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('text/csv')
    const body = await res.text()
    expect(body.split('\n')[0]).toBe('Game,Subject,Type,Score (%),Time (s),Date')
    expect(body).toContain('Cells')
  })
})
