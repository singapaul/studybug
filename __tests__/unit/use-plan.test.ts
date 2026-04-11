import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}))

import { useSession } from '@/lib/auth-client'
import { usePlan } from '@/hooks/use-plan'

const mockUseSession = useSession as ReturnType<typeof vi.fn>

beforeEach(() => vi.clearAllMocks())

describe('usePlan', () => {
  it('returns plan "free" and isPro false when user has no plan', () => {
    mockUseSession.mockReturnValue({ data: { user: {} } })
    const { result } = renderHook(() => usePlan())
    expect(result.current.plan).toBe('free')
    expect(result.current.isPro).toBe(false)
  })

  it('returns plan "free" and isPro false when session is null', () => {
    mockUseSession.mockReturnValue({ data: null })
    const { result } = renderHook(() => usePlan())
    expect(result.current.plan).toBe('free')
    expect(result.current.isPro).toBe(false)
  })

  it('returns plan "pro" and isPro true when user has pro plan', () => {
    mockUseSession.mockReturnValue({ data: { user: { plan: 'pro' } } })
    const { result } = renderHook(() => usePlan())
    expect(result.current.plan).toBe('pro')
    expect(result.current.isPro).toBe(true)
  })

  it('returns plan "free" and isPro false when user has free plan', () => {
    mockUseSession.mockReturnValue({ data: { user: { plan: 'free' } } })
    const { result } = renderHook(() => usePlan())
    expect(result.current.plan).toBe('free')
    expect(result.current.isPro).toBe(false)
  })
})
