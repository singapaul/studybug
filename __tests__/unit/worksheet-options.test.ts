import { describe, it, expect } from 'vitest'
import {
  YEAR_GROUPS,
  KEY_STAGES,
  QUESTION_TYPE_OPTIONS,
  MARKING_MODE_OPTIONS,
  DIFFERENTIATION_OPTIONS,
  EXAM_BOARD_OPTIONS,
} from '@/lib/worksheet-options'
import { QUESTION_TYPES } from '@/types/worksheet'

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

  it('exposes an option for every question type', () => {
    expect(QUESTION_TYPE_OPTIONS).toHaveLength(QUESTION_TYPES.length)
    const optionValues = QUESTION_TYPE_OPTIONS.map((o) => o.value).sort()
    expect(optionValues).toEqual([...QUESTION_TYPES].sort())
  })

  it('exposes exam board options including "none"', () => {
    expect(EXAM_BOARD_OPTIONS.map((o) => o.value)).toContain('none')
    expect(EXAM_BOARD_OPTIONS.map((o) => o.value)).toContain('AQA')
  })

  it('exposes 4 marking modes', () => {
    expect(MARKING_MODE_OPTIONS).toHaveLength(4)
  })

  it('exposes 2 differentiation modes', () => {
    expect(DIFFERENTIATION_OPTIONS).toHaveLength(2)
  })
})
