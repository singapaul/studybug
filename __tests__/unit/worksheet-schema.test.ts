import { describe, it, expect } from 'vitest'
import {
  GeneratedWorksheetSchema,
  QuestionSchema,
  SavedWorksheetContentSchema,
  parseGeneratedWorksheet,
} from '@/types/worksheet'

describe('QuestionSchema', () => {
  it('parses a valid multiple choice question', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'multipleChoice',
      text: 'What is 2+2?',
      marks: 1,
      answer: '4',
      difficulty: 'core',
      options: ['3', '4', '5', '6'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects MCQ with fewer than 2 options', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'multipleChoice',
      text: 'X',
      marks: 1,
      answer: '4',
      difficulty: 'core',
      options: ['only one'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative marks', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'shortAnswer',
      text: 'X',
      marks: -1,
      answer: 'Y',
      difficulty: 'core',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid difficulty value', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'shortAnswer',
      text: 'X',
      marks: 1,
      answer: 'Y',
      difficulty: 'extreme',
    })
    expect(result.success).toBe(false)
  })

  it('parses a valid matching question with pairs', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'matching',
      text: 'Match the term to its definition',
      marks: 4,
      answer: 'Chlorophyll→green pigment; Stomata→pores',
      difficulty: 'core',
      pairs: [
        { left: 'Chlorophyll', right: 'Green pigment' },
        { left: 'Stomata', right: 'Pores in leaves' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects a matching question without pairs', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'matching',
      text: 'Match the term to its definition',
      marks: 4,
      answer: 'x',
      difficulty: 'core',
    })
    expect(result.success).toBe(false)
  })

  it('parses a valid ordering question with items', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'ordering',
      text: 'Put the stages of mitosis in order',
      marks: 3,
      answer: 'Prophase, Metaphase, Anaphase, Telophase',
      difficulty: 'core',
      items: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an ordering question without items', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'ordering',
      text: 'Put the stages in order',
      marks: 3,
      answer: 'x',
      difficulty: 'core',
    })
    expect(result.success).toBe(false)
  })

  it('parses a valid tableCompletion question with a table', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'tableCompletion',
      text: 'Complete the table',
      marks: 2,
      answer: 'Solid, Liquid',
      difficulty: 'core',
      table: {
        headers: ['State', 'Shape'],
        rows: [
          ['[blank]', 'Fixed'],
          ['Liquid', '[blank]'],
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects a tableCompletion question without a table', () => {
    const result = QuestionSchema.safeParse({
      id: 'q1',
      type: 'tableCompletion',
      text: 'Complete the table',
      marks: 2,
      answer: 'x',
      difficulty: 'core',
    })
    expect(result.success).toBe(false)
  })
})

function validContent(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Photosynthesis basics',
    topic: 'Photosynthesis',
    subject: 'Biology',
    yearGroup: 'Year 8',
    level: 'KS3',
    teacherOverview: {
      intendedUse: 'Starter activity',
      timeEstimate: '20 minutes',
      equipmentNeeded: [],
      differentiationNotes: { support: '', stretch: '' },
      misconceptions: [],
      assumptions: [],
      optionalChallenge: '',
      challengeAnswer: '',
    },
    vocabularyBox: [{ term: 'Chlorophyll', definition: 'Green pigment' }],
    sections: [
      {
        title: 'Recall',
        instructions: 'Answer all questions',
        questions: [
          {
            id: 'q1',
            type: 'shortAnswer',
            text: 'Define photosynthesis',
            marks: 2,
            answer: 'The process by which plants make food.',
            difficulty: 'core',
          },
        ],
      },
    ],
    extensionTask: '',
    totalMarks: 2,
    ...overrides,
  }
}

describe('SavedWorksheetContentSchema', () => {
  it('accepts a fully valid worksheet', () => {
    const result = SavedWorksheetContentSchema.safeParse(validContent())
    expect(result.success).toBe(true)
  })

  it('rejects a worksheet that contains a malformed question (strict, no filtering)', () => {
    const result = SavedWorksheetContentSchema.safeParse(
      validContent({
        sections: [
          {
            title: 'Recall',
            instructions: '',
            questions: [{ id: 'q1', type: 'bogus', text: 'X', marks: 1, answer: 'Y', difficulty: 'core' }],
          },
        ],
      }),
    )
    expect(result.success).toBe(false)
  })

  it('parses optional curriculum metadata (examBoard + specPoints)', () => {
    const result = SavedWorksheetContentSchema.safeParse(
      validContent({ examBoard: 'AQA', specPoints: ['3.1.2 Photosynthesis'] }),
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.examBoard).toBe('AQA')
      expect(result.data.specPoints).toEqual(['3.1.2 Photosynthesis'])
    }
  })

  it('rejects an invalid examBoard value', () => {
    const result = SavedWorksheetContentSchema.safeParse(validContent({ examBoard: 'NotABoard' }))
    expect(result.success).toBe(false)
  })
})

describe('parseGeneratedWorksheet', () => {
  it('discards malformed questions but keeps valid ones', () => {
    const raw = JSON.stringify({
      title: 'Photosynthesis basics',
      topic: 'Photosynthesis',
      subject: 'Biology',
      yearGroup: 'Year 8',
      level: 'KS3',
      teacherOverview: {
        intendedUse: 'Starter activity',
        timeEstimate: '20 minutes',
        equipmentNeeded: [],
        differentiationNotes: { support: '', stretch: '' },
        misconceptions: [],
        assumptions: [],
        optionalChallenge: '',
        challengeAnswer: '',
      },
      vocabularyBox: [],
      sections: [{
        title: 'Recall',
        instructions: 'Answer all questions',
        questions: [
          {
            id: 'q1',
            type: 'shortAnswer',
            text: 'Define photosynthesis',
            marks: 2,
            answer: 'The process by which plants make food.',
            difficulty: 'core',
          },
          { id: 'q2', type: 'badType', text: 'X', marks: 1, answer: 'Y', difficulty: 'core' },
        ],
      }],
      extensionTask: '',
      totalMarks: 2,
    })

    const parsed = parseGeneratedWorksheet(raw)
    expect(parsed.sections[0].questions).toHaveLength(1)
    expect(parsed.sections[0].questions[0].id).toBe('q1')
  })

  it('throws if top-level shape is wrong', () => {
    expect(() => parseGeneratedWorksheet('{}')).toThrow()
  })

  it('carries optional curriculum metadata through', () => {
    const raw = JSON.stringify({
      title: 'X', topic: 'Y', subject: '', yearGroup: 'Year 1', level: 'KS1',
      teacherOverview: {
        intendedUse: '', timeEstimate: '', equipmentNeeded: [],
        differentiationNotes: { support: '', stretch: '' },
        misconceptions: [], assumptions: [],
        optionalChallenge: '', challengeAnswer: '',
      },
      vocabularyBox: [],
      sections: [],
      extensionTask: '', totalMarks: 0,
      examBoard: 'OCR', specPoints: ['1.1 Cells'],
    })

    const parsed = parseGeneratedWorksheet(raw)
    expect(parsed.examBoard).toBe('OCR')
    expect(parsed.specPoints).toEqual(['1.1 Cells'])
  })

  it('returns an empty questions array when every question is malformed', () => {
    const raw = JSON.stringify({
      title: 'X', topic: 'Y', subject: '', yearGroup: 'Year 1', level: 'KS1',
      teacherOverview: {
        intendedUse: '', timeEstimate: '', equipmentNeeded: [],
        differentiationNotes: { support: '', stretch: '' },
        misconceptions: [], assumptions: [],
        optionalChallenge: '', challengeAnswer: '',
      },
      vocabularyBox: [],
      sections: [{ title: 'S1', instructions: '', questions: [{ id: 'q1', type: 'bogus' }] }],
      extensionTask: '', totalMarks: 0,
    })

    const parsed = parseGeneratedWorksheet(raw)
    expect(parsed.sections[0].questions).toHaveLength(0)
  })
})
