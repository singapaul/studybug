import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import GamesPage from '@/app/(dashboard)/games/page'
import { GamesStoreProvider } from '@/context/games-store'

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

function renderWithStore(ui: React.ReactElement) {
  return render(React.createElement(GamesStoreProvider, null, ui))
}

describe('Games list page', () => {
  it('renders the page heading', () => {
    renderWithStore(React.createElement(GamesPage))
    expect(screen.getByRole('heading', { name: /my games/i })).toBeInTheDocument()
  })

  it('renders a Create Game link', () => {
    renderWithStore(React.createElement(GamesPage))
    const link = screen.getByRole('link', { name: /create game/i })
    expect(link).toHaveAttribute('href', '/games/create')
  })

  it('renders a card for each seed game', () => {
    renderWithStore(React.createElement(GamesPage))
    // Seed data has 5 games
    expect(screen.getByText('Times Tables')).toBeInTheDocument()
    expect(screen.getByText('French Vocabulary')).toBeInTheDocument()
    expect(screen.getByText('Capital Cities')).toBeInTheDocument()
    expect(screen.getByText('Algebra Basics')).toBeInTheDocument()
    expect(screen.getByText('World Capitals Quiz')).toBeInTheDocument()
  })

  it('each game card links to /games/[id]', () => {
    renderWithStore(React.createElement(GamesPage))
    const links = screen.getAllByRole('link').filter((l) =>
      (l as HTMLAnchorElement).href.includes('/games/game-')
    )
    expect(links.length).toBeGreaterThanOrEqual(5)
  })
})
