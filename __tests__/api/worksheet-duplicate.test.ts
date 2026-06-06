import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({
  db: { worksheet: { findUnique: vi.fn(), create: vi.fn() } },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.worksheet as {
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

const PRO_SESSION = { user: { id: 'user-1', plan: 'pro' } }
const FREE_SESSION = { user: { id: 'user-1', plan: 'free' } }
const OTHER_SESSION = { user: { id: 'user-2', plan: 'pro' } }

const SAMPLE = {
  id: 'ws-1',
  userId: 'user-1',
  title: 'Cells',
  topic: 'Cells',
  subject: 'Biology',
  yearGroup: 'Year 9',
  level: 'GCSE',
  content: { title: 'Cells', sections: [] },
  shareToken: 'tok-123',
  folderId: 'folder-1',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function req() {
  return new NextRequest('http://localhost/api/worksheets/ws-1/duplicate', { method: 'POST' })
}
const PARAMS = { params: Promise.resolve({ id: 'ws-1' }) }

beforeEach(() => vi.clearAllMocks())

describe('POST /api/worksheets/[id]/duplicate', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { POST } = await import('@/app/api/worksheets/[id]/duplicate/route')
    expect((await POST(req(), PARAMS)).status).toBe(401)
  })

  it('returns 403 for non-Pro users', async () => {
    mockAuth.mockResolvedValue(FREE_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE)
    const { POST } = await import('@/app/api/worksheets/[id]/duplicate/route')
    expect((await POST(req(), PARAMS)).status).toBe(403)
  })

  it('returns 403 when user does not own the worksheet', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE)
    const { POST } = await import('@/app/api/worksheets/[id]/duplicate/route')
    expect((await POST(req(), PARAMS)).status).toBe(403)
  })

  it('creates a copy with "(copy)" title, copied content, same folder, and no share token', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE)
    mockDb.create.mockResolvedValue({ ...SAMPLE, id: 'ws-2', title: 'Cells (copy)', shareToken: null })
    const { POST } = await import('@/app/api/worksheets/[id]/duplicate/route')
    const res = await POST(req(), PARAMS)
    expect(res.status).toBe(201)
    const call = mockDb.create.mock.calls[0][0]
    expect(call.data.title).toBe('Cells (copy)')
    expect(call.data.content).toEqual(SAMPLE.content)
    expect(call.data.folderId).toBe('folder-1')
    expect(call.data.shareToken ?? null).toBeNull()
    expect(call.data.userId).toBe('user-1')
  })
})
