import {
  QuestionType,
  MarkingMode,
  DifferentiationMode,
  EXAM_BOARDS,
  ExamBoard,
} from '@/types/worksheet'

export const YEAR_GROUPS = [
  'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6',
  'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13',
] as const

export const KEY_STAGES = ['KS1', 'KS2', 'KS3', 'KS4', 'GCSE', 'A-Level'] as const

interface QuestionTypeOption {
  value: QuestionType
  label: string
  description: string
}

export const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  { value: 'multipleChoice', label: 'Multiple Choice', description: '3–4 options, one correct.' },
  { value: 'shortAnswer', label: 'Short Answer', description: '1–2 sentence written response.' },
  { value: 'extendedResponse', label: 'Extended Response', description: 'Paragraph with mark scheme.' },
  { value: 'trueFalse', label: 'True / False', description: 'Statement with T/F.' },
  { value: 'fillInTheBlank', label: 'Fill in the Blank', description: 'Sentence with [blank] markers.' },
  { value: 'matching', label: 'Matching', description: 'Match terms to definitions.' },
  { value: 'ordering', label: 'Ordering', description: 'Put items in the correct sequence.' },
  { value: 'tableCompletion', label: 'Table Completion', description: 'Fill in missing cells in a table.' },
]

interface ExamBoardOption {
  value: ExamBoard
  label: string
}

export const EXAM_BOARD_OPTIONS: ExamBoardOption[] = [
  { value: 'none', label: 'No specific board' },
  { value: 'AQA', label: 'AQA' },
  { value: 'Edexcel', label: 'Edexcel' },
  { value: 'OCR', label: 'OCR' },
  { value: 'WJEC', label: 'WJEC' },
]

export { EXAM_BOARDS }

interface MarkingModeOption {
  value: MarkingMode
  label: string
  description: string
}

export const MARKING_MODE_OPTIONS: MarkingModeOption[] = [
  { value: 'markSchemeWithPoints', label: 'Mark Scheme with Points', description: 'One idea per mark.' },
  { value: 'answersOnly', label: 'Answers Only', description: 'Minimal answers, no marks breakdown.' },
  { value: 'detailedExemplar', label: 'Detailed Exemplar', description: 'Worked example for each answer.' },
  { value: 'none', label: 'No Mark Scheme', description: 'Worksheet only — teacher will mark separately.' },
]

interface DifferentiationOption {
  value: DifferentiationMode
  label: string
  description: string
}

export const DIFFERENTIATION_OPTIONS: DifferentiationOption[] = [
  { value: 'mixedAbility', label: 'Mixed Ability', description: 'Tiered support / core / stretch questions for a mixed class.' },
  { value: 'higher', label: 'Higher', description: 'Whole worksheet pitched at the more demanding band.' },
  { value: 'foundation', label: 'Foundation', description: 'Whole worksheet accessible and scaffolded.' },
]
