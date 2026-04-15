import { describe, it, expect } from 'vitest'
import { checkAnswer, parseSentenceParts } from '@/lib/game-logic/fill-in-the-blank'

describe('checkAnswer', () => {
  it('returns true for exact match', () => {
    expect(checkAnswer('Paris', 'Paris')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(checkAnswer('paris', 'Paris')).toBe(true)
    expect(checkAnswer('PARIS', 'Paris')).toBe(true)
  })

  it('trims whitespace from user input', () => {
    expect(checkAnswer('  Paris  ', 'Paris')).toBe(true)
  })

  it('returns false for wrong answer', () => {
    expect(checkAnswer('London', 'Paris')).toBe(false)
  })

  it('returns false for empty input', () => {
    expect(checkAnswer('', 'Paris')).toBe(false)
  })
})

describe('parseSentenceParts', () => {
  it('splits a sentence on the [blank] marker', () => {
    const { before, after } = parseSentenceParts('The capital of France is [blank] in Europe')
    expect(before).toBe('The capital of France is ')
    expect(after).toBe(' in Europe')
  })

  it('handles [blank] at the end', () => {
    const { before, after } = parseSentenceParts('The answer is [blank]')
    expect(before).toBe('The answer is ')
    expect(after).toBe('')
  })

  it('handles [blank] at the start', () => {
    const { before, after } = parseSentenceParts('[blank] is the capital of France')
    expect(before).toBe('')
    expect(after).toBe(' is the capital of France')
  })
})
