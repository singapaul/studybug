import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import CreateGamePage from '@/app/(dashboard)/games/create/page'
import { UpgradeModalProvider } from '@/components/upgrade/upgrade-modal-provider'
import { GameType } from '@/types/game'
import { GAME_TEMPLATES } from '@/lib/game-templates'

const mockPush = vi.fn()

// CreateGamePage uses <PremiumGate>, which reads the upgrade-modal context.
const renderPage = () =>
  render(
    React.createElement(UpgradeModalProvider, null, React.createElement(CreateGamePage))
  )

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/games/create',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

describe('Create game type selection page', () => {
  it('renders a card for each game type', () => {
    renderPage()
    GAME_TEMPLATES.forEach((t) => {
      expect(screen.getByText(t.name)).toBeInTheDocument()
    })
  })

  it('clicking a game type card navigates to the builder', async () => {
    renderPage()
    const flashcardsCard = screen.getByText('Flashcards').closest('[data-testid]') ??
      screen.getByText('Flashcards').closest('button') ??
      screen.getByText('Flashcards').closest('[role="button"]')

    // Find button by game type
    const buttons = screen.getAllByRole('button')
    const flashcardsButton = buttons.find((b) => b.textContent?.includes('Flashcards'))
    expect(flashcardsButton).toBeDefined()

    await userEvent.click(flashcardsButton!)
    expect(mockPush).toHaveBeenCalledWith(`/games/build/${GameType.FLASHCARDS}`)
  })

  it('shows the description for each game type', () => {
    renderPage()
    // At least one template description should be visible
    expect(screen.getByText(/flip cards to study/i)).toBeInTheDocument()
  })
})
