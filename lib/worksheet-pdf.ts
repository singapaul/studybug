import type { GeneratedWorksheet, Question, QuestionType, WorksheetTable } from '@/types/worksheet'

export type PdfVariant = 'student' | 'answers'

export interface PdfQuestion {
  id: string
  number: number
  type: QuestionType
  text: string
  marksLabel: string
  tierLabel: string | null
  options?: string[]
  matchLeft?: string[]
  matchRight?: string[]
  orderItems?: string[]
  table?: WorksheetTable
  answer?: string
}

export interface PdfSection {
  title: string
  instructions: string
  questions: PdfQuestion[]
}

export interface PdfModel {
  variant: PdfVariant
  title: string
  metaLine: string
  examBoardLine: string | null
  vocab: { term: string; definition: string }[]
  sections: PdfSection[]
  extension: string
}

export function formatMarks(marks: number): string {
  return `[${marks} mark${marks === 1 ? '' : 's'}]`
}

function tierLabel(difficulty: Question['difficulty']): string | null {
  if (difficulty === 'support') return 'Support'
  if (difficulty === 'stretch') return 'Stretch'
  return null
}

/** Stable, deterministic display order that avoids revealing the answer sequence/pairing. */
function sortedForDisplay(items: string[]): string[] {
  return [...items].sort((a, b) => a.localeCompare(b))
}

/** For the student copy, blank out any cell marked with the [blank] token. */
function studentTable(table: WorksheetTable): WorksheetTable {
  return {
    headers: table.headers,
    rows: table.rows.map((row) => row.map((cell) => (cell === '[blank]' ? '' : cell))),
  }
}

function buildQuestion(q: Question, number: number, variant: PdfVariant): PdfQuestion {
  const base: PdfQuestion = {
    id: q.id,
    number,
    type: q.type,
    text: q.text,
    marksLabel: formatMarks(q.marks),
    tierLabel: tierLabel(q.difficulty),
  }

  if (q.type === 'multipleChoice' && q.options) base.options = q.options
  if (q.type === 'ordering' && q.items) base.orderItems = sortedForDisplay(q.items)
  if (q.type === 'matching' && q.pairs) {
    base.matchLeft = q.pairs.map((p) => p.left)
    base.matchRight = sortedForDisplay(q.pairs.map((p) => p.right))
  }
  if (q.type === 'tableCompletion' && q.table) {
    base.table = variant === 'student' ? studentTable(q.table) : q.table
  }
  if (variant === 'answers') base.answer = q.answer

  return base
}

export function buildPdfModel(worksheet: GeneratedWorksheet, variant: PdfVariant): PdfModel {
  const metaLine = [
    [worksheet.subject, worksheet.yearGroup, worksheet.level].filter(Boolean).join(' · '),
    `${worksheet.totalMarks} marks total`,
  ]
    .filter(Boolean)
    .join(' · ')

  const examBoardLine =
    worksheet.examBoard && worksheet.examBoard !== 'none'
      ? [worksheet.examBoard, (worksheet.specPoints ?? []).join(', ')].filter(Boolean).join(' — ')
      : null

  return {
    variant,
    title: worksheet.title,
    metaLine,
    examBoardLine,
    vocab: worksheet.vocabularyBox,
    sections: worksheet.sections.map((s) => ({
      title: s.title,
      instructions: s.instructions,
      questions: s.questions.map((q, i) => buildQuestion(q, i + 1, variant)),
    })),
    extension: worksheet.extensionTask,
  }
}
