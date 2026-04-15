import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// next/navigation mock
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/games/build/FLASHCARDS',
  useParams: () => ({ type: 'FLASHCARDS' }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}))

// sonner mock
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { toast } from 'sonner'
import { FlashcardsBuilder } from '@/components/games/FlashcardsBuilder'
import { PairsBuilder } from '@/components/games/PairsBuilder'
import { SplatBuilder } from '@/components/games/SplatBuilder'
import { SwipeBuilder } from '@/components/games/SwipeBuilder'
import { MultipleChoiceBuilder } from '@/components/games/MultipleChoiceBuilder'
import { FillInTheBlankBuilder } from '@/components/games/FillInTheBlankBuilder'
import { SpeedRoundBuilder } from '@/components/games/SpeedRoundBuilder'
import { AnagramBuilder } from '@/components/games/AnagramBuilder'

// Helper: fill any input matching placeholder
function fillInput(placeholder: RegExp | string, value: string) {
  const el = screen.getByPlaceholderText(placeholder)
  fireEvent.change(el, { target: { value } })
}

// ----- FlashcardsBuilder -----
describe('FlashcardsBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 5 cards', async () => {
    render(React.createElement(FlashcardsBuilder, { onSave, onCancel }))
    fillInput(/biology terms/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/5 flashcards/i)))
  })

  it('calls onSave with name and game data when valid', async () => {
    render(React.createElement(FlashcardsBuilder, { onSave, onCancel }))
    // Set game name
    fireEvent.change(screen.getByPlaceholderText(/biology terms/i), { target: { value: 'My Cards' } })
    // Add 5 cards
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /add card/i }))
    }
    // Fill in all fronts and backs
    const fronts = screen.getAllByPlaceholderText(/front of card/i)
    const backs = screen.getAllByPlaceholderText(/back of card/i)
    fronts.forEach((el, i) => fireEvent.change(el, { target: { value: `Question ${i + 1}` } }))
    backs.forEach((el, i) => fireEvent.change(el, { target: { value: `Answer ${i + 1}` } }))

    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('My Cards', expect.objectContaining({
        cards: expect.arrayContaining([expect.objectContaining({ front: 'Question 1', back: 'Answer 1' })]),
      }))
    })
  })
})

// ----- PairsBuilder -----
describe('PairsBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 3 pairs', async () => {
    render(React.createElement(PairsBuilder, { onSave, onCancel }))
    fillInput(/spanish vocabulary/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/3 pairs/i)))
  })
})

// ----- SplatBuilder -----
describe('SplatBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 10 items', async () => {
    render(React.createElement(SplatBuilder, { onSave, onCancel }))
    fillInput(/math facts splat/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/10 items/i)))
  })
})

// ----- SwipeBuilder -----
describe('SwipeBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 10 items', async () => {
    render(React.createElement(SwipeBuilder, { onSave, onCancel }))
    fillInput(/history facts/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/10 items/i)))
  })
})

// ----- MultipleChoiceBuilder -----
describe('MultipleChoiceBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 5 questions', async () => {
    render(React.createElement(MultipleChoiceBuilder, { onSave, onCancel }))
    fillInput(/year 5 science quiz/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/5 questions/i)))
  })
})

// ----- FillInTheBlankBuilder -----
describe('FillInTheBlankBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 5 items', async () => {
    render(React.createElement(FillInTheBlankBuilder, { onSave, onCancel }))
    fillInput(/capital of france quiz/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/5 items/i)))
  })

  it('shows validation error when a sentence is missing [blank] marker', async () => {
    render(React.createElement(FillInTheBlankBuilder, { onSave, onCancel }))
    fireEvent.change(screen.getByPlaceholderText(/capital of france quiz/i), { target: { value: 'My Game' } })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /add item/i }))
    }
    const sentenceInputs = screen.getAllByPlaceholderText(/\[blank\]/i)
    sentenceInputs.forEach((el) => fireEvent.change(el, { target: { value: 'no marker here' } }))
    const answerInputs = screen.getAllByPlaceholderText(/correct answer/i)
    answerInputs.forEach((el) => fireEvent.change(el, { target: { value: 'answer' } }))
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/\[blank\]/i)))
  })

  it('calls onSave with name and items when valid', async () => {
    render(React.createElement(FillInTheBlankBuilder, { onSave, onCancel }))
    fireEvent.change(screen.getByPlaceholderText(/capital of france quiz/i), { target: { value: 'Blanks Game' } })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /add item/i }))
    }
    const sentenceInputs = screen.getAllByPlaceholderText(/\[blank\]/i)
    sentenceInputs.forEach((el, i) => fireEvent.change(el, { target: { value: `The [blank] is ${i + 1}` } }))
    const answerInputs = screen.getAllByPlaceholderText(/correct answer/i)
    answerInputs.forEach((el, i) => fireEvent.change(el, { target: { value: `answer${i + 1}` } }))
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Blanks Game', expect.objectContaining({
        items: expect.arrayContaining([expect.objectContaining({ sentence: expect.stringContaining('[blank]') })]),
      }))
    })
  })
})

// ----- SpeedRoundBuilder -----
describe('SpeedRoundBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 10 items', async () => {
    render(React.createElement(SpeedRoundBuilder, { onSave, onCancel }))
    fillInput(/Capital Cities Quiz/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/10 items/i)))
  })
})

// ----- AnagramBuilder -----
describe('AnagramBuilder', () => {
  const onSave = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows validation error when fewer than 5 words', async () => {
    render(React.createElement(AnagramBuilder, { onSave, onCancel }))
    fillInput(/animals quiz/i, 'My Game')
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/5 words/i)))
  })

  it('shows validation error when a word contains spaces', async () => {
    render(React.createElement(AnagramBuilder, { onSave, onCancel }))
    fireEvent.change(screen.getByPlaceholderText(/animals quiz/i), { target: { value: 'Anagram Game' } })
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole('button', { name: /add word/i }))
    }
    const wordInputs = screen.getAllByPlaceholderText(/^word$/i)
    wordInputs.forEach((el) => fireEvent.change(el, { target: { value: 'two words' } }))
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/single word/i)))
  })
})
