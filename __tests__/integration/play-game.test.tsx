import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { GameType } from '@/types/game'

const mockUseParams = vi.fn(() => ({ id: 'game-1' }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/games/game-1',
  useParams: () => mockUseParams(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// sonner mock
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// framer-motion stub — avoids animation complexity in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) =>
      React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useMotionValue: () => ({ get: () => 0, set: vi.fn() }),
  useTransform: () => ({ get: () => 0 }),
  useAnimation: () => ({ start: vi.fn() }),
}))

// Mock TanStack Query hooks
vi.mock('@/hooks/use-games', () => ({
  useGame: vi.fn(),
  useSubmitAttempt: vi.fn(),
}))

import { useGame, useSubmitAttempt } from '@/hooks/use-games'
import PlayGamePage from '@/app/(dashboard)/games/[id]/page'

const mockUseGame = useGame as ReturnType<typeof vi.fn>
const mockUseSubmitAttempt = useSubmitAttempt as ReturnType<typeof vi.fn>

const GAMES: Record<string, { id: string; userId: string; name: string; gameType: GameType; gameData: string; createdAt: Date; updatedAt: Date }> = {
  'game-1': {
    id: 'game-1',
    userId: 'user-1',
    name: 'Times Tables',
    gameType: GameType.FLASHCARDS,
    gameData: JSON.stringify({
      cards: [
        { id: '1', front: '2 × 3', back: '6' },
        { id: '2', front: '3 × 3', back: '9' },
        { id: '3', front: '4 × 3', back: '12' },
        { id: '4', front: '5 × 3', back: '15' },
        { id: '5', front: '6 × 3', back: '18' },
      ],
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  'game-2': {
    id: 'game-2',
    userId: 'user-1',
    name: 'French Vocabulary',
    gameType: GameType.PAIRS,
    gameData: JSON.stringify({
      items: [
        { id: '1', leftText: 'bonjour', rightText: 'hello' },
        { id: '2', leftText: 'merci', rightText: 'thank you' },
        { id: '3', leftText: 'au revoir', rightText: 'goodbye' },
      ],
    }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseSubmitAttempt.mockReturnValue({ mutate: vi.fn() })
})

describe('Play game page', () => {
  it('renders the flashcards game for a FLASHCARDS game', () => {
    mockUseParams.mockReturnValue({ id: 'game-1' })
    mockUseGame.mockReturnValue({ data: GAMES['game-1'], isLoading: false, isError: false })
    render(React.createElement(PlayGamePage))
    expect(screen.getByText(/times tables/i)).toBeInTheDocument()
  })

  it('renders the pairs game for a PAIRS game', () => {
    mockUseParams.mockReturnValue({ id: 'game-2' })
    mockUseGame.mockReturnValue({ data: GAMES['game-2'], isLoading: false, isError: false })
    render(React.createElement(PlayGamePage))
    expect(screen.getByText(/french vocabulary/i)).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown game id', () => {
    mockUseParams.mockReturnValue({ id: 'does-not-exist' })
    mockUseGame.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    render(React.createElement(PlayGamePage))
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
