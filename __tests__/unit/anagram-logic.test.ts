import { describe, it, expect } from 'vitest'
import { scramble, checkAnagram } from '@/lib/game-logic/anagram'

describe('scramble', () => {
  it('returns the same letters in a different order', () => {
    const word = 'elephant'
    const letters = scramble(word)
    expect(letters).toHaveLength(word.length)
    expect([...letters].sort().join('')).toBe([...word].sort().join(''))
  })

  it('returns an array of individual letter strings', () => {
    const letters = scramble('cat')
    letters.forEach((l) => expect(l).toHaveLength(1))
  })

  it('handles single-letter words without infinite loop', () => {
    const letters = scramble('a')
    expect(letters).toEqual(['a'])
  })
})

describe('checkAnagram', () => {
  it('returns true when selected letters match the word', () => {
    expect(checkAnagram(['c', 'a', 't'], 'cat')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(checkAnagram(['C', 'A', 'T'], 'cat')).toBe(true)
    expect(checkAnagram(['c', 'a', 't'], 'CAT')).toBe(true)
  })

  it('returns false when letters are in wrong order', () => {
    expect(checkAnagram(['t', 'a', 'c'], 'cat')).toBe(false)
  })

  it('returns false when wrong letters are selected', () => {
    expect(checkAnagram(['d', 'o', 'g'], 'cat')).toBe(false)
  })

  it('returns false when empty selection', () => {
    expect(checkAnagram([], 'cat')).toBe(false)
  })
})
