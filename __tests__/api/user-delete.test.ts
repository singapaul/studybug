import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({ db: { user: { delete: vi.fn() } } }))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.user as { delete: ReturnType<typeof vi.fn> }

function req() {
  return new NextRequest('http://localhost/api/user', { method: 'DELETE' })
}

beforeEach(() => vi.clearAllMocks())

describe('DELETE /api/user', () => {
  it('returns 401 without a session', async () => {
    mockAuth.mockResolvedValue(null)
    const { DELETE } = await import('@/app/api/user/route')
    expect((await DELETE(req())).status).toBe(401)
    expect(mockDb.delete).not.toHaveBeenCalled()
  })

  it('deletes the authenticated user and returns success', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
    mockDb.delete.mockResolvedValue({ id: 'user-1' })
    const { DELETE } = await import('@/app/api/user/route')
    const res = await DELETE(req())
    expect(res.status).toBe(200)
    expect(mockDb.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
