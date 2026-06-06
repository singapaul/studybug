import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({
  db: {
    worksheetFolder: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.worksheetFolder as Record<string, ReturnType<typeof vi.fn>>

const SESSION = { user: { id: 'user-1', plan: 'pro' } }
const OTHER = { user: { id: 'user-2', plan: 'pro' } }
const FOLDER = { id: 'f1', userId: 'user-1', name: 'Biology', createdAt: new Date() }

function jsonReq(url: string, method = 'GET', body?: unknown) {
  return new NextRequest(url, {
    method,
    ...(body && { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('GET /api/worksheet-folders', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { GET } = await import('@/app/api/worksheet-folders/route')
    expect((await GET(jsonReq('http://localhost/api/worksheet-folders'))).status).toBe(401)
  })

  it('lists the current user folders', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.findMany.mockResolvedValue([FOLDER])
    const { GET } = await import('@/app/api/worksheet-folders/route')
    const res = await GET(jsonReq('http://localhost/api/worksheet-folders'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.folders).toHaveLength(1)
    expect(mockDb.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    )
  })
})

describe('POST /api/worksheet-folders', () => {
  it('creates a folder for the user', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.create.mockResolvedValue(FOLDER)
    const { POST } = await import('@/app/api/worksheet-folders/route')
    const res = await POST(jsonReq('http://localhost/api/worksheet-folders', 'POST', { name: 'Biology' }))
    expect(res.status).toBe(201)
    expect(mockDb.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: 'user-1', name: 'Biology' } }),
    )
  })

  it('rejects an empty name', async () => {
    mockAuth.mockResolvedValue(SESSION)
    const { POST } = await import('@/app/api/worksheet-folders/route')
    const res = await POST(jsonReq('http://localhost/api/worksheet-folders', 'POST', { name: '' }))
    expect(res.status).toBe(400)
  })
})

describe('PATCH/DELETE /api/worksheet-folders/[id]', () => {
  const PARAMS = { params: Promise.resolve({ id: 'f1' }) }

  it('renames an owned folder', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.findUnique.mockResolvedValue(FOLDER)
    mockDb.update.mockResolvedValue({ ...FOLDER, name: 'Chemistry' })
    const { PATCH } = await import('@/app/api/worksheet-folders/[id]/route')
    const res = await PATCH(jsonReq('http://localhost/api/worksheet-folders/f1', 'PATCH', { name: 'Chemistry' }), PARAMS)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.folder.name).toBe('Chemistry')
  })

  it('returns 403 when renaming a folder owned by another user', async () => {
    mockAuth.mockResolvedValue(OTHER)
    mockDb.findUnique.mockResolvedValue(FOLDER)
    const { PATCH } = await import('@/app/api/worksheet-folders/[id]/route')
    const res = await PATCH(jsonReq('http://localhost/api/worksheet-folders/f1', 'PATCH', { name: 'X' }), PARAMS)
    expect(res.status).toBe(403)
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('deletes an owned folder (worksheets unfiled via SetNull)', async () => {
    mockAuth.mockResolvedValue(SESSION)
    mockDb.findUnique.mockResolvedValue(FOLDER)
    mockDb.delete.mockResolvedValue(FOLDER)
    const { DELETE } = await import('@/app/api/worksheet-folders/[id]/route')
    const res = await DELETE(jsonReq('http://localhost/api/worksheet-folders/f1', 'DELETE'), PARAMS)
    expect(res.status).toBe(204)
    expect(mockDb.delete).toHaveBeenCalledWith({ where: { id: 'f1' } })
  })
})
