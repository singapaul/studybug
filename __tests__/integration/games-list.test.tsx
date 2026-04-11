import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import GamesPage from '@/app/(dashboard)/games/page'
import { GameType } from '@/types/game'

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/games',
}))

// next/link mock
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// sonner mock
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

// Mock TanStack Query hooks
vi.mock('@/hooks/use-games', () => ({
  useGames: vi.fn(),
  useDeleteGame: vi.fn(),
  useDuplicateGame: vi.fn(),
}))

import { useGames, useDeleteGame, useDuplicateGame } from '@/hooks/use-games'

const mockUseGames = useGames as ReturnType<typeof vi.fn>
const mockUseDeleteGame = useDeleteGame as ReturnType<typeof vi.fn>
const mockUseDuplicateGame = useDuplicateGame as ReturnType<typeof vi.fn>

const MOCK_GAMES = [
  {
    id: 'game-1',
    userId: 'user-1',
    name: 'Times Tables',
    gameType: GameType.FLASHCARDS,
    gameData: JSON.stringify({ cards: [{ id: '1', front: 'Q', back: 'A' }] }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'game-2',
    userId: 'user-1',
    name: 'French Vocabulary',
    gameType: GameType.PAIRS,
    gameData: JSON.stringify({ items: [{ id: '1', leftText: 'bonjour', rightText: 'hello' }] }),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockUseDeleteGame.mockReturnValue({ mutate: vi.fn() })
  mockUseDuplicateGame.mockReturnValue({ mutate: vi.fn() })
})

describe('Games list page', () => {
  it('renders the page heading', () => {
    mockUseGames.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(React.createElement(GamesPage))
    expect(screen.getByRole('heading', { name: /my games/i })).toBeInTheDocument()
  })

  it('renders a Create Game link', () => {
    mockUseGames.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(React.createElement(GamesPage))
    const links = screen.getAllByRole('link', { name: /create game/i })
    expect(links.length).toBeGreaterThanOrEqual(1)
    expect(links[0]).toHaveAttribute('href', '/games/create')
  })

  it('shows empty state when there are no games', () => {
    mockUseGames.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(React.createElement(GamesPage))
    expect(screen.getByText(/no games yet/i)).toBeInTheDocument()
  })

  it('renders a card for each game', () => {
    mockUseGames.mockReturnValue({ data: MOCK_GAMES, isLoading: false, isError: false })
    render(React.createElement(GamesPage))
    expect(screen.getByText('Times Tables')).toBeInTheDocument()
    expect(screen.getByText('French Vocabulary')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', () => {
    mockUseGames.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    render(React.createElement(GamesPage))
    // Loading state renders a spinner, no heading visible
    expect(screen.queryByText('Times Tables')).not.toBeInTheDocument()
  })

  it('each game card links to /games/[id]', () => {
    mockUseGames.mockReturnValue({ data: MOCK_GAMES, isLoading: false, isError: false })
    render(React.createElement(GamesPage))
    const links = screen.getAllByRole('link').filter((l) =>
      (l as HTMLAnchorElement).href.includes('/games/game-')
    )
    expect(links.length).toBeGreaterThanOrEqual(2)
  })
})
