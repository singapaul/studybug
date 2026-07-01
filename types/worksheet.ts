import { z } from 'zod'

export const QUESTION_TYPES = [
  'multipleChoice',
  'shortAnswer',
  'extendedResponse',
  'trueFalse',
  'fillInTheBlank',
  'matching',
  'ordering',
  'tableCompletion',
] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'none'] as const
export type ExamBoard = (typeof EXAM_BOARDS)[number]

export const DIFFICULTY_TIERS = ['support', 'core', 'stretch'] as const
export type DifficultyTier = (typeof DIFFICULTY_TIERS)[number]

export const MARKING_MODES = [
  'markSchemeWithPoints',
  'answersOnly',
  'detailedExemplar',
  'none',
] as const
export type MarkingMode = (typeof MARKING_MODES)[number]

export const DIFFERENTIATION_MODES = ['mixedAbility', 'higher', 'foundation'] as const
export type DifferentiationMode = (typeof DIFFERENTIATION_MODES)[number]

export const MatchingPairSchema = z.object({
  left: z.string().min(1),
  right: z.string().min(1),
})
export type MatchingPair = z.infer<typeof MatchingPairSchema>

export const TableSchema = z.object({
  headers: z.array(z.string().min(1)).min(1),
  rows: z.array(z.array(z.string())).min(1),
})
export type WorksheetTable = z.infer<typeof TableSchema>

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(QUESTION_TYPES),
    text: z.string().min(1),
    marks: z.number().int().min(0).max(20),
    answer: z.string().min(1),
    difficulty: z.enum(DIFFICULTY_TIERS),
    options: z.array(z.string().min(1)).min(2).max(6).optional(),
    hint: z.string().optional(),
    // matching
    pairs: z.array(MatchingPairSchema).min(2).optional(),
    // ordering — items listed in the correct order; rendered shuffled
    items: z.array(z.string().min(1)).min(2).optional(),
    // tableCompletion — cells to fill marked with [blank]
    table: TableSchema.optional(),
  })
  .refine(
    (q) => q.type !== 'multipleChoice' || (q.options && q.options.length >= 2),
    { message: 'multipleChoice questions must have at least 2 options' },
  )
  .refine((q) => q.type !== 'matching' || (q.pairs && q.pairs.length >= 2), {
    message: 'matching questions must have at least 2 pairs',
  })
  .refine((q) => q.type !== 'ordering' || (q.items && q.items.length >= 2), {
    message: 'ordering questions must have at least 2 items',
  })
  .refine((q) => q.type !== 'tableCompletion' || !!q.table, {
    message: 'tableCompletion questions must have a table',
  })

export type Question = z.infer<typeof QuestionSchema>

export const VocabularyItemSchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
})
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>

export const SectionSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().default(''),
  questions: z.array(z.unknown()).default([]),
})

export const TeacherOverviewSchema = z.object({
  intendedUse: z.string().default(''),
  timeEstimate: z.string().default(''),
  equipmentNeeded: z.array(z.string()).default([]),
  differentiationNotes: z
    .object({
      support: z.string().default(''),
      stretch: z.string().default(''),
    })
    .default({ support: '', stretch: '' }),
  misconceptions: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  optionalChallenge: z.string().default(''),
  challengeAnswer: z.string().default(''),
})
export type TeacherOverview = z.infer<typeof TeacherOverviewSchema>

export const GeneratedWorksheetSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  subject: z.string().default(''),
  yearGroup: z.string().min(1),
  level: z.string().min(1),
  teacherOverview: TeacherOverviewSchema,
  vocabularyBox: z.array(z.unknown()).default([]),
  sections: z.array(SectionSchema).default([]),
  extensionTask: z.string().default(''),
  totalMarks: z.number().int().min(0).default(0),
  examBoard: z.enum(EXAM_BOARDS).optional(),
  specPoints: z.array(z.string()).optional(),
})

/**
 * Strict counterpart to {@link GeneratedWorksheetSchema}: every question and
 * vocabulary item is fully validated (no `z.unknown()` placeholders, no
 * silent filtering). Used to validate user edits before persisting them.
 */
export const StrictSectionSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().default(''),
  questions: z.array(QuestionSchema).default([]),
})

export const SavedWorksheetContentSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  subject: z.string().default(''),
  yearGroup: z.string().min(1),
  level: z.string().min(1),
  teacherOverview: TeacherOverviewSchema,
  vocabularyBox: z.array(VocabularyItemSchema).default([]),
  sections: z.array(StrictSectionSchema).default([]),
  extensionTask: z.string().default(''),
  totalMarks: z.number().int().min(0).default(0),
  examBoard: z.enum(EXAM_BOARDS).optional(),
  specPoints: z.array(z.string()).optional(),
})

/** Output of `parseGeneratedWorksheet` after per-item filtering — distinct from the schema input where `vocabularyBox` and `questions` are `unknown[]`. */
export interface GeneratedWorksheet {
  title: string
  topic: string
  subject: string
  yearGroup: string
  level: string
  teacherOverview: TeacherOverview
  vocabularyBox: VocabularyItem[]
  sections: { title: string; instructions: string; questions: Question[] }[]
  extensionTask: string
  totalMarks: number
  examBoard?: ExamBoard
  specPoints?: string[]
}

function parseItems<T>(items: unknown[], schema: z.ZodType<T>, label: string): T[] {
  return items.flatMap((item, i) => {
    const result = schema.safeParse(item)
    if (!result.success) {
      console.warn(`[worksheet] Skipping malformed ${label}[${i}]:`, result.error.issues)
      return []
    }
    return [result.data]
  })
}

export function parseGeneratedWorksheet(json: string): GeneratedWorksheet {
  const raw = JSON.parse(json)
  const top = GeneratedWorksheetSchema.parse(raw)

  const vocabularyBox = parseItems(top.vocabularyBox, VocabularyItemSchema, 'vocabularyItem')
  const sections = top.sections.map((s) => ({
    title: s.title,
    instructions: s.instructions,
    questions: parseItems(s.questions, QuestionSchema, 'question'),
  }))

  return {
    title: top.title,
    topic: top.topic,
    subject: top.subject,
    yearGroup: top.yearGroup,
    level: top.level,
    teacherOverview: top.teacherOverview,
    vocabularyBox,
    sections,
    extensionTask: top.extensionTask,
    totalMarks: top.totalMarks,
    examBoard: top.examBoard,
    specPoints: top.specPoints,
  }
}

/**
 * A "blueprint" captures the STRUCTURE of an uploaded worksheet — its sections
 * and, per question, the type, marks, difficulty and skill assessed — without
 * any question text/answers. Produced by the remix extraction pass and used to
 * drive a faithful parallel-version generation.
 */
export const BlueprintQuestionSchema = z.object({
  type: z.enum(QUESTION_TYPES),
  marks: z.number().int().min(0).max(20).catch(1),
  difficulty: z.enum(DIFFICULTY_TIERS).catch('core'),
  objective: z.string().default(''),
})
export type BlueprintQuestion = z.infer<typeof BlueprintQuestionSchema>

export const BlueprintSectionSchema = z.object({
  title: z.string().default(''),
  instructions: z.string().default(''),
  questions: z.array(BlueprintQuestionSchema).default([]),
})

export const BlueprintSchema = z.object({
  subject: z.string().default(''),
  topic: z.string().default(''),
  yearGroup: z.string().default(''),
  level: z.string().default(''),
  examBoard: z.enum(EXAM_BOARDS).optional(),
  markingMode: z.enum(MARKING_MODES).optional(),
  sections: z.array(BlueprintSectionSchema).default([]),
})
export type Blueprint = z.infer<typeof BlueprintSchema>

export function parseBlueprint(json: string): Blueprint {
  return BlueprintSchema.parse(JSON.parse(json))
}

/** Total number of questions across all sections of a blueprint. */
export function blueprintQuestionCount(bp: Blueprint): number {
  return bp.sections.reduce((n, s) => n + s.questions.length, 0)
}

/** Distinct question types present in a blueprint (for prompt type-rules). */
export function blueprintQuestionTypes(bp: Blueprint): QuestionType[] {
  const set = new Set<QuestionType>()
  bp.sections.forEach((s) => s.questions.forEach((q) => set.add(q.type)))
  return Array.from(set)
}

export interface WorksheetSummary {
  id: string
  title: string
  topic: string
  subject: string | null
  yearGroup: string
  level: string
  shareToken: string | null
  folderId: string | null
  isFavourite: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface WorksheetFolder {
  id: string
  name: string
  createdAt: string
}

export interface SavedWorksheet extends WorksheetSummary {
  content: GeneratedWorksheet
}
