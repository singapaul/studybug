import { describe, it, expect } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { WorksheetPdfDocument } from '@/components/worksheets/pdf/WorksheetPdf'
import type { GeneratedWorksheet } from '@/types/worksheet'

const worksheet: GeneratedWorksheet = {
  title: 'Cells',
  topic: 'Cells',
  subject: 'Biology',
  yearGroup: 'Year 9',
  level: 'GCSE',
  examBoard: 'AQA',
  specPoints: ['4.1.1'],
  teacherOverview: {
    intendedUse: '', timeEstimate: '', equipmentNeeded: [],
    differentiationNotes: { support: '', stretch: '' },
    misconceptions: [], assumptions: [], optionalChallenge: '', challengeAnswer: '',
  },
  vocabularyBox: [{ term: 'Nucleus', definition: 'Controls the cell' }],
  sections: [
    {
      title: 'Recall',
      instructions: 'Answer all',
      questions: [
        { id: 'q1', type: 'multipleChoice', text: 'Which controls the cell?', marks: 1, answer: 'Nucleus', difficulty: 'core', options: ['Nucleus', 'Wall', 'Vacuole'] },
        { id: 'q2', type: 'shortAnswer', text: 'Define osmosis', marks: 2, answer: 'Movement of water', difficulty: 'support' },
        { id: 'q3', type: 'matching', text: 'Match', marks: 2, answer: 'x', difficulty: 'core', pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }] },
        { id: 'q4', type: 'ordering', text: 'Order', marks: 1, answer: 'x', difficulty: 'stretch', items: ['First', 'Second', 'Third'] },
        { id: 'q5', type: 'tableCompletion', text: 'Fill', marks: 1, answer: 'x', difficulty: 'core', table: { headers: ['A', 'B'], rows: [['[blank]', 'y']] } },
      ],
    },
  ],
  extensionTask: 'Extra challenge',
  totalMarks: 7,
}

async function head(buf: Buffer) {
  return buf.subarray(0, 5).toString('latin1')
}

describe('WorksheetPdfDocument', () => {
  it('renders a valid student PDF covering every question type', async () => {
    const buf = await renderToBuffer(<WorksheetPdfDocument worksheet={worksheet} variant="student" />)
    expect(buf.length).toBeGreaterThan(0)
    expect(await head(buf)).toBe('%PDF-')
  })

  it('renders a valid answer-key PDF', async () => {
    const buf = await renderToBuffer(<WorksheetPdfDocument worksheet={worksheet} variant="answers" />)
    expect(buf.length).toBeGreaterThan(0)
    expect(await head(buf)).toBe('%PDF-')
  })
})
