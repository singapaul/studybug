import { describe, it, expect } from 'vitest'
import { buildPdfModel, formatMarks } from '@/lib/worksheet-pdf'
import type { GeneratedWorksheet } from '@/types/worksheet'

function worksheet(overrides: Partial<GeneratedWorksheet> = {}): GeneratedWorksheet {
  return {
    title: 'Photosynthesis',
    topic: 'Photosynthesis',
    subject: 'Biology',
    yearGroup: 'Year 8',
    level: 'KS3',
    teacherOverview: {
      intendedUse: '', timeEstimate: '', equipmentNeeded: [],
      differentiationNotes: { support: '', stretch: '' },
      misconceptions: [], assumptions: [], optionalChallenge: '', challengeAnswer: '',
    },
    vocabularyBox: [{ term: 'Chlorophyll', definition: 'Green pigment' }],
    sections: [
      {
        title: 'Recall',
        instructions: 'Answer all',
        questions: [
          { id: 'q1', type: 'shortAnswer', text: 'Define photosynthesis', marks: 2, answer: 'Plants make food', difficulty: 'core' },
          { id: 'q2', type: 'ordering', text: 'Order the stages', marks: 1, answer: 'A, B, C', difficulty: 'stretch', items: ['Gamma', 'Alpha', 'Beta'] },
          { id: 'q3', type: 'tableCompletion', text: 'Complete', marks: 1, answer: 'Solid', difficulty: 'core', table: { headers: ['State'], rows: [['[blank]'], ['Liquid']] } },
        ],
      },
    ],
    extensionTask: 'Extra',
    totalMarks: 4,
    ...overrides,
  }
}

describe('formatMarks', () => {
  it('singular for 1 mark', () => {
    expect(formatMarks(1)).toBe('[1 mark]')
  })
  it('plural otherwise', () => {
    expect(formatMarks(2)).toBe('[2 marks]')
    expect(formatMarks(0)).toBe('[0 marks]')
  })
})

describe('buildPdfModel — student variant', () => {
  const model = buildPdfModel(worksheet(), 'student')

  it('numbers questions per section starting at 1', () => {
    expect(model.sections[0].questions[0].number).toBe(1)
    expect(model.sections[0].questions[1].number).toBe(2)
  })

  it('omits answers in the student variant', () => {
    expect(model.sections[0].questions[0].answer).toBeUndefined()
  })

  it('labels tier only for support/stretch', () => {
    expect(model.sections[0].questions[0].tierLabel).toBeNull()
    expect(model.sections[0].questions[1].tierLabel).toBe('Stretch')
  })

  it('shows ordering items in a deterministic shuffled (alphabetical) order, not the answer order', () => {
    expect(model.sections[0].questions[1].orderItems).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('blanks out [blank] table cells for students', () => {
    expect(model.sections[0].questions[2].table?.rows[0][0]).toBe('')
    expect(model.sections[0].questions[2].table?.rows[1][0]).toBe('Liquid')
  })

  it('builds a meta line with subject, year, level and total marks', () => {
    expect(model.metaLine).toContain('Biology')
    expect(model.metaLine).toContain('Year 8')
    expect(model.metaLine).toContain('KS3')
    expect(model.metaLine).toContain('4')
  })
})

describe('buildPdfModel — answers variant', () => {
  const model = buildPdfModel(worksheet(), 'answers')

  it('includes answers', () => {
    expect(model.sections[0].questions[0].answer).toBe('Plants make food')
  })

  it('keeps real table cell values (not blanked)', () => {
    expect(model.sections[0].questions[2].table?.rows[0][0]).toBe('[blank]')
  })
})

describe('buildPdfModel — exam board', () => {
  it('produces an exam board line when set', () => {
    const model = buildPdfModel(worksheet({ examBoard: 'AQA', specPoints: ['3.1'] }), 'student')
    expect(model.examBoardLine).toContain('AQA')
  })
  it('is null when no board', () => {
    const model = buildPdfModel(worksheet({ examBoard: 'none' }), 'student')
    expect(model.examBoardLine).toBeNull()
  })
})
