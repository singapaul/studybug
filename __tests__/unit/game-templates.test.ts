import { describe, it, expect } from 'vitest'
import { getTemplateByType, getTemplateColor, getTemplateIcon, getTemplateName, GAME_TEMPLATES } from '@/lib/game-templates'
import { GameType } from '@/types/game'

describe('GAME_TEMPLATES', () => {
  it('has an entry for every GameType', () => {
    const types = Object.values(GameType)
    types.forEach((type) => {
      expect(GAME_TEMPLATES.find((t) => t.type === type)).toBeDefined()
    })
  })
})

describe('getTemplateByType', () => {
  it('returns the correct template for FLASHCARDS', () => {
    const t = getTemplateByType(GameType.FLASHCARDS)
    expect(t?.type).toBe(GameType.FLASHCARDS)
    expect(t?.name).toBe('Flashcards')
    expect(t?.minItems).toBe(5)
  })

  it('returns the correct template for PAIRS', () => {
    const t = getTemplateByType(GameType.PAIRS)
    expect(t?.type).toBe(GameType.PAIRS)
    expect(t?.minItems).toBe(3)
  })

  it('returns undefined for an unknown type', () => {
    expect(getTemplateByType('UNKNOWN' as GameType)).toBeUndefined()
  })
})

describe('getTemplateColor', () => {
  it('returns a colour class for a known type', () => {
    expect(getTemplateColor(GameType.PAIRS)).toMatch(/^bg-/)
  })

  it('falls back to bg-gray-500 for an unknown type', () => {
    expect(getTemplateColor('UNKNOWN' as GameType)).toBe('bg-gray-500')
  })
})

describe('getTemplateIcon', () => {
  it('returns an icon string for a known type', () => {
    expect(getTemplateIcon(GameType.SPLAT)).toBeTruthy()
  })

  it('falls back to Gamepad2 for an unknown type', () => {
    expect(getTemplateIcon('UNKNOWN' as GameType)).toBe('Gamepad2')
  })
})

describe('getTemplateName', () => {
  it('returns the name for a known type', () => {
    expect(getTemplateName(GameType.SWIPE)).toBe('Swipe')
  })

  it('falls back to the raw type string for unknown', () => {
    expect(getTemplateName('UNKNOWN' as GameType)).toBe('UNKNOWN')
  })
})
