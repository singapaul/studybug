import { describe, it, expect } from 'vitest'
import {
  GeneratedWorksheetSchema,
  QuestionSchema,
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
})
