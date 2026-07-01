import { describe, it, expect } from 'vitest'
import {
  BlueprintSchema,
  parseBlueprint,
  blueprintQuestionCount,
  blueprintQuestionTypes,
} from '@/types/worksheet'
import { buildBlueprintExtractionPrompt, buildRemixSystemPrompt } from '@/lib/worksheet-prompts'

const SAMPLE = {
  subject: 'Biology',
  topic: 'Photosynthesis',
  yearGroup: 'Year 10',
  level: 'GCSE',
  examBoard: 'AQA',
  markingMode: 'markSchemeWithPoints',
  sections: [
    {
      title: 'Section A',
      instructions: 'Answer all questions.',
      questions: [
        { type: 'multipleChoice', marks: 1, difficulty: 'support', objective: 'identify the site of photosynthesis' },
        { type: 'shortAnswer', marks: 2, difficulty: 'core', objective: 'state the word equation' },
      ],
    },
    {
      title: 'Section B',
      instructions: '',
      questions: [
        { type: 'extendedResponse', marks: 6, difficulty: 'stretch', objective: 'explain limiting factors' },
      ],
    },
  ],
}

describe('BlueprintSchema', () => {
  it('parses a well-formed blueprint', () => {
    const bp = parseBlueprint(JSON.stringify(SAMPLE))
    expect(blueprintQuestionCount(bp)).toBe(3)
    expect(blueprintQuestionTypes(bp)).toEqual(['multipleChoice', 'shortAnswer', 'extendedResponse'])
  })

  it('falls back to defaults for a bad marks/difficulty value', () => {
    const bp = BlueprintSchema.parse({
      topic: 'X',
      sections: [{ questions: [{ type: 'shortAnswer', marks: 999, difficulty: 'nonsense', objective: '' }] }],
    })
    expect(bp.sections[0].questions[0].marks).toBe(1)
    expect(bp.sections[0].questions[0].difficulty).toBe('core')
  })

  it('defaults empty sections to no questions', () => {
    const bp = BlueprintSchema.parse({ topic: 'X' })
    expect(blueprintQuestionCount(bp)).toBe(0)
    expect(blueprintQuestionTypes(bp)).toEqual([])
  })
})

describe('remix prompts', () => {
  it('extraction prompt asks for structure only, JSON out', () => {
    const p = buildBlueprintExtractionPrompt()
    expect(p).toMatch(/blueprint/i)
    expect(p).toMatch(/Do NOT include question text/i)
    expect(p).toMatch(/nearest of the eight supported types/i)
  })

  it('remix generation prompt carries the parallel-version directive', () => {
    const p = buildRemixSystemPrompt({
      questionTypes: ['shortAnswer'],
      markingMode: 'markSchemeWithPoints',
      differentiation: 'mixedAbility',
      yearGroup: 'Year 10',
      examBoard: 'AQA',
    })
    expect(p).toMatch(/REMIX MODE/)
    expect(p).toMatch(/mirrors? this blueprint/i)
    expect(p).toMatch(/genuinely NEW question/i)
  })
})
