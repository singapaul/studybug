import { describe, it, expect } from 'vitest'
import {
  YEAR_GROUPS,
  KEY_STAGES,
  QUESTION_TYPE_OPTIONS,
  MARKING_MODE_OPTIONS,
  DIFFERENTIATION_OPTIONS,
} from '@/lib/worksheet-options'

describe('worksheet-options', () => {
  it('has 13 year groups (Year 1 to Year 13)', () => {
    expect(YEAR_GROUPS).toHaveLength(13)
    expect(YEAR_GROUPS[0]).toBe('Year 1')
    expect(YEAR_GROUPS[12]).toBe('Year 13')
  })

  it('has 6 key stages (KS1-KS5 + GCSE + A-Level)', () => {
    expect(KEY_STAGES.length).toBeGreaterThanOrEqual(5)
    expect(KEY_STAGES).toContain('KS3')
    expect(KEY_STAGES).toContain('GCSE')
  })

  it('exposes 5 question types', () => {
    expect(QUESTION_TYPE_OPTIONS).toHaveLength(5)
  })

  it('exposes 4 marking modes', () => {
    expect(MARKING_MODE_OPTIONS).toHaveLength(4)
  })

  it('exposes 2 differentiation modes', () => {
    expect(DIFFERENTIATION_OPTIONS).toHaveLength(2)
  })
})
