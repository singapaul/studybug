import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({ db: { worksheet: { findMany: vi.fn() } } }))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.worksheet as { findMany: ReturnType<typeof vi.fn> }

const SESSION = { user: { id: 'user-1', plan: 'pro' } }

beforeEach(() => vi.clearAllMocks())

describe('GET /api/worksheets — folder filtering', () => {
  it('lists all worksheets when no folder filter is given', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.findMany.mockResolvedValue([])
    const { GET } = await import('@/app/api/worksheets/route')
    await GET(new NextRequest('http://localhost/api/worksheets'))
    expect(mockDb.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    )
  })

  it('filters to a specific folder', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.findMany.mockResolvedValue([])
    const { GET } = await import('@/app/api/worksheets/route')
    await GET(new NextRequest('http://localhost/api/worksheets?folderId=f1'))
    expect(mockDb.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', folderId: 'f1' } }),
    )
  })

  it('filters to unfiled worksheets (folderId is null)', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.findMany.mockResolvedValue([])
    const { GET } = await import('@/app/api/worksheets/route')
    await GET(new NextRequest('http://localhost/api/worksheets?folderId=unfiled'))
    expect(mockDb.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', folderId: null } }),
    )
  })
})
