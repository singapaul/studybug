import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { GamesStoreProvider } from '@/context/games-store'
import { GameType } from '@/types/game'
import { SEED_GAMES } from '@/lib/mock-data'

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

import PlayGamePage from '@/app/(dashboard)/games/[id]/page'

function renderWithStore(gameId: string) {
  mockUseParams.mockReturnValue({ id: gameId })
  return render(
    React.createElement(GamesStoreProvider, null, React.createElement(PlayGamePage))
  )
}

describe('Play game page', () => {
  it('renders the flashcards game for a FLASHCARDS game', () => {
    renderWithStore('game-1') // Times Tables — FLASHCARDS
    expect(screen.getByText(/times tables/i)).toBeInTheDocument()
  })

  it('renders the pairs game for a PAIRS game', () => {
    renderWithStore('game-2') // French Vocabulary — PAIRS
    expect(screen.getByText(/french vocabulary/i)).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown game id', () => {
    renderWithStore('does-not-exist')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
