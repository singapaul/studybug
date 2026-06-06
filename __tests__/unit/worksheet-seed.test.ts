import { describe, it, expect } from 'vitest'
import { libraryDeckToSeed, gameToSeed } from '@/lib/worksheet-seed'
import { GameType } from '@/types/game'

describe('libraryDeckToSeed', () => {
  it('uses the deck name as topic and lists term/definition lines', () => {
    const seed = libraryDeckToSeed(
      {
        id: 'd1',
        name: 'Cell Biology',
        description: null,
        tags: [],
        itemCount: 2,
        items: [
          { term: 'Nucleus', definition: 'Controls the cell' },
          { term: 'Osmosis', definition: 'Water movement', sentence: 'Water moves by osmosis.' },
        ],
      },
      'Biology',
    )
    expect(seed.topic).toBe('Cell Biology')
    expect(seed.subject).toBe('Biology')
    expect(seed.pastedText).toContain('Nucleus: Controls the cell')
    expect(seed.pastedText).toContain('Osmosis: Water movement')
    expect(seed.pastedText).toContain('Water moves by osmosis.')
  })
})

describe('gameToSeed', () => {
  it('converts flashcards to front/back lines', () => {
    const seed = gameToSeed({
      name: 'French Verbs',
      subject: 'French',
      gameType: GameType.FLASHCARDS,
      gameData: { cards: [{ id: '1', front: 'manger', back: 'to eat' }] },
    })
    expect(seed.topic).toBe('French Verbs')
    expect(seed.subject).toBe('French')
    expect(seed.pastedText).toContain('manger: to eat')
  })

  it('converts multiple choice to question + correct answer', () => {
    const seed = gameToSeed({
      name: 'Quiz',
      subject: null,
      gameType: GameType.MULTIPLE_CHOICE,
      gameData: {
        questions: [
          {
            id: 'q1',
            question: 'Capital of France?',
            options: [
              { id: 'a', text: 'Paris', isCorrect: true },
              { id: 'b', text: 'Lyon', isCorrect: false },
            ],
          },
        ],
      },
    })
    expect(seed.subject).toBeUndefined()
    expect(seed.pastedText).toContain('Capital of France?')
    expect(seed.pastedText).toContain('Paris')
  })

  it('converts fill-in-the-blank items', () => {
    const seed = gameToSeed({
      name: 'Gaps',
      subject: 'Science',
      gameType: GameType.FILL_IN_THE_BLANK,
      gameData: { items: [{ id: '1', sentence: 'The [blank] is the powerhouse.', answer: 'mitochondria' }] },
    })
    expect(seed.pastedText).toContain('powerhouse')
    expect(seed.pastedText).toContain('mitochondria')
  })

  it('produces a non-empty seed for every game type', () => {
    const samples: { type: GameType; data: unknown }[] = [
      { type: GameType.PAIRS, data: { items: [{ id: '1', leftText: 'A', rightText: 'B' }] } },
      { type: GameType.SPLAT, data: { items: [{ id: '1', question: 'Q', answer: 'A' }] } },
      { type: GameType.SWIPE, data: { items: [{ id: '1', statement: 'S', isCorrect: true }] } },
      { type: GameType.SPEED_ROUND, data: { timeLimit: 60, items: [{ id: '1', question: 'Q', answer: 'A' }] } },
      { type: GameType.ANAGRAM, data: { items: [{ id: '1', word: 'cat' }] } },
    ]
    for (const s of samples) {
      const seed = gameToSeed({ name: 'G', subject: null, gameType: s.type, gameData: s.data as never })
      expect(seed.pastedText.length).toBeGreaterThan(0)
    }
  })
})
