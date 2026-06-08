import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))
vi.mock('@/lib/db', () => ({
  db: { user: { findUnique: vi.fn(), update: vi.fn() } },
}))
vi.mock('@/lib/stripe', () => ({
  stripe: { checkout: { sessions: { retrieve: vi.fn() } } },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

const mockGetSession = auth.api.getSession as ReturnType<typeof vi.fn>
const mockFindUnique = db.user.findUnique as ReturnType<typeof vi.fn>
const mockUpdate = db.user.update as ReturnType<typeof vi.fn>
const mockRetrieve = stripe.checkout.sessions.retrieve as ReturnType<typeof vi.fn>

const SESSION = { user: { id: 'user-1' } }
const USER = { id: 'user-1', stripeCustomerId: 'cus_123' }

function req(url: string) {
  return new NextRequest(url)
}

beforeEach(() => vi.clearAllMocks())

describe('GET /api/stripe/checkout/success', () => {
  it('redirects unauthenticated users to /sign-in', async () => {
    mockGetSession.mockResolvedValue(null)
    const { GET } = await import('@/app/api/stripe/checkout/success/route')
    const res = await GET(req('http://localhost/api/stripe/checkout/success?session_id=cs_1'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/sign-in')
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('grants Pro and redirects to dashboard when session is paid and owned', async () => {
    mockGetSession.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue(USER)
    mockRetrieve.mockResolvedValue({ payment_status: 'paid', customer: 'cus_123', metadata: null })
    const { GET } = await import('@/app/api/stripe/checkout/success/route')
    const res = await GET(req('http://localhost/api/stripe/checkout/success?session_id=cs_1'))
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'user-1' }, data: { plan: 'pro' } })
    expect(res.headers.get('location')).toContain('/dashboard?upgrade=success')
  })

  it('does NOT grant Pro when the session is not paid, but still redirects to success', async () => {
    mockGetSession.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue(USER)
    mockRetrieve.mockResolvedValue({ payment_status: 'unpaid', customer: 'cus_123', metadata: null })
    const { GET } = await import('@/app/api/stripe/checkout/success/route')
    const res = await GET(req('http://localhost/api/stripe/checkout/success?session_id=cs_1'))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/dashboard?upgrade=success')
  })

  it('does NOT grant Pro when the session is owned by another user', async () => {
    mockGetSession.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue(USER)
    mockRetrieve.mockResolvedValue({ payment_status: 'paid', customer: 'cus_other', metadata: { userId: 'user-2' } })
    const { GET } = await import('@/app/api/stripe/checkout/success/route')
    const res = await GET(req('http://localhost/api/stripe/checkout/success?session_id=cs_1'))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/dashboard?upgrade=success')
  })

  it('falls through to success redirect when Stripe retrieve throws', async () => {
    mockGetSession.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue(USER)
    mockRetrieve.mockRejectedValue(new Error('Stripe down'))
    const { GET } = await import('@/app/api/stripe/checkout/success/route')
    const res = await GET(req('http://localhost/api/stripe/checkout/success?session_id=cs_1'))
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/dashboard?upgrade=success')
  })

  it('redirects to success without calling Stripe when session_id is missing', async () => {
    mockGetSession.mockResolvedValue(SESSION)
    mockFindUnique.mockResolvedValue(USER)
    const { GET } = await import('@/app/api/stripe/checkout/success/route')
    const res = await GET(req('http://localhost/api/stripe/checkout/success'))
    expect(mockRetrieve).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(res.headers.get('location')).toContain('/dashboard?upgrade=success')
  })
})
