import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  UpgradeModalProvider,
} from '@/components/upgrade/upgrade-modal-provider'
import { UpgradeToProButton } from '@/components/upgrade/upgrade-cta'
import { PRO_BENEFITS } from '@/components/upgrade/upgrade-modal'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('Shared upgrade modal', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('is hidden until a CTA opens it, then shows the benefit list and price', async () => {
    render(
      React.createElement(
        UpgradeModalProvider,
        null,
        React.createElement(UpgradeToProButton, { feature: 'Worksheets' })
      )
    )

    // Closed initially — benefits not in the DOM.
    expect(screen.queryByText(PRO_BENEFITS[0])).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /upgrade to pro/i }))

    // Contextual headline + every benefit + price + proceed CTA.
    expect(screen.getByText('Unlock Worksheets with Pro')).toBeInTheDocument()
    PRO_BENEFITS.forEach((benefit) => {
      expect(screen.getByText(benefit)).toBeInTheDocument()
    })
    expect(screen.getByText('£5')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /proceed to checkout/i })
    ).toBeInTheDocument()
  })

  it('proceed starts a Stripe checkout session', async () => {
    const assign = vi.fn()
    // jsdom's window.location.href is not writable; stub the setter.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        set href(url: string) {
          assign(url)
        },
      },
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ url: 'https://checkout.stripe.test/session' }) })
    vi.stubGlobal('fetch', fetchMock)

    render(
      React.createElement(
        UpgradeModalProvider,
        null,
        React.createElement(UpgradeToProButton, {})
      )
    )

    await userEvent.click(screen.getByRole('button', { name: /upgrade to pro/i }))
    await userEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }))

    expect(fetchMock).toHaveBeenCalledWith('/api/stripe/checkout', { method: 'POST' })
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.test/session')
  })
})
