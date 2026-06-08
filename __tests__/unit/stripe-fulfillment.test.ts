import { describe, it, expect } from 'vitest'
import { isPaidAndOwned } from '@/lib/stripe-fulfillment'

const USER = { id: 'user-1', stripeCustomerId: 'cus_123' }

describe('isPaidAndOwned', () => {
  it('grants when paid and customer matches the user', () => {
    const session = { payment_status: 'paid', customer: 'cus_123', metadata: null }
    expect(isPaidAndOwned(session, USER)).toBe(true)
  })

  it('grants when paid and metadata.userId matches the user', () => {
    const session = { payment_status: 'paid', customer: 'cus_other', metadata: { userId: 'user-1' } }
    expect(isPaidAndOwned(session, USER)).toBe(true)
  })

  it('rejects when payment_status is not paid', () => {
    const session = { payment_status: 'unpaid', customer: 'cus_123', metadata: null }
    expect(isPaidAndOwned(session, USER)).toBe(false)
  })

  it('rejects when neither customer nor metadata matches the user', () => {
    const session = { payment_status: 'paid', customer: 'cus_other', metadata: { userId: 'user-2' } }
    expect(isPaidAndOwned(session, USER)).toBe(false)
  })

  it('rejects when the user has no stripeCustomerId and metadata does not match', () => {
    const session = { payment_status: 'paid', customer: 'cus_123', metadata: null }
    expect(isPaidAndOwned(session, { id: 'user-1', stripeCustomerId: null })).toBe(false)
  })

  it('rejects when customer is an expanded object (not a string id) and metadata does not match', () => {
    const session = { payment_status: 'paid', customer: { id: 'cus_123' }, metadata: null }
    expect(isPaidAndOwned(session, USER)).toBe(false)
  })
})
