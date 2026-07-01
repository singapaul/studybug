import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { buildSystemPrompt, buildRemixSystemPrompt } from '@/lib/worksheet-prompts'
import { DAILY_LIMIT, countUsedToday, dispatchGeneration } from '@/lib/generation-trigger'
import { extractSourceText, MAX_TEXT_LENGTH } from '@/lib/extract-source'
import {
  QUESTION_TYPES,
  MARKING_MODES,
  DIFFERENTIATION_MODES,
  EXAM_BOARDS,
  BlueprintSchema,
  blueprintQuestionTypes,
  type QuestionType,
  type MarkingMode,
  type DifferentiationMode,
  type ExamBoard,
} from '@/types/worksheet'

const KIND = 'worksheet'

const RequestSchema = z.object({
  topic: z.string().min(1).max(200),
  subject: z.string().max(100).optional().default(''),
  yearGroup: z.string().min(1).max(40),
  level: z.string().min(1).max(40),
  learningObjectives: z.string().max(2000).optional().default(''),
  priorKnowledge: z.string().max(2000).optional().default(''),
  numQuestions: z.coerce.number().int().min(3).max(20).default(8),
  questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1).default(['shortAnswer']),
  markingMode: z.enum(MARKING_MODES).default('markSchemeWithPoints'),
  differentiation: z.enum(DIFFERENTIATION_MODES).default('mixedAbility'),
  examBoard: z.enum(EXAM_BOARDS).optional().default('none'),
  pastedText: z.string().max(MAX_TEXT_LENGTH).optional().default(''),
  // Remix mode: JSON-encoded blueprint whose structure the new worksheet mirrors.
  blueprint: z.string().max(MAX_TEXT_LENGTH).optional().default(''),
})

async function postHandler(req: NextRequest) {
  let userId: string
  let plan: string
  try {
    ;({ userId, plan } = await getAuthenticatedUser(req))
  } catch (err) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isPro(plan)) {
    return NextResponse.json({ error: 'Pro plan required', code: 'PRO_REQUIRED' }, { status: 403 })
  }

  try {
    const usedToday = await countUsedToday(userId, KIND)
    if (usedToday >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: 'Daily worksheet generation limit reached (10/day). Resets at midnight.',
          code: 'GENERATION_LIMIT_REACHED',
        },
        { status: 429 },
      )
    }

    let form: FormData
    try {
      form = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const questionTypesRaw = (form.get('questionTypes') as string | null) ?? ''
    const field = (name: string) => form.get(name) ?? undefined
    const rawFields: Record<string, unknown> = {
      topic: field('topic'),
      subject: field('subject'),
      yearGroup: field('yearGroup'),
      level: field('level'),
      learningObjectives: field('learningObjectives'),
      priorKnowledge: field('priorKnowledge'),
      numQuestions: field('numQuestions'),
      markingMode: field('markingMode'),
      differentiation: field('differentiation'),
      examBoard: field('examBoard'),
      pastedText: field('pastedText'),
      blueprint: field('blueprint'),
      questionTypes: questionTypesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    }

    const parsedReq = RequestSchema.safeParse(rawFields)
    if (!parsedReq.success) {
      return NextResponse.json(
        { error: 'Invalid request', issues: parsedReq.error.issues },
        { status: 400 },
      )
    }
    const body = parsedReq.data

    // Remix mode: a valid blueprint drives the structure (per-question type /
    // marks / difficulty / objective); the form fields override topic / year /
    // differentiation / marking / exam board.
    const remixBlueprint = body.blueprint
      ? BlueprintSchema.safeParse((() => { try { return JSON.parse(body.blueprint) } catch { return null } })())
      : null
    const blueprint = remixBlueprint?.success ? remixBlueprint.data : null

    let systemPrompt: string
    let userMessage: string

    if (blueprint) {
      const questionTypes = blueprintQuestionTypes(blueprint)
      systemPrompt = buildRemixSystemPrompt({
        questionTypes: questionTypes.length ? questionTypes : (body.questionTypes as QuestionType[]),
        markingMode: body.markingMode as MarkingMode,
        differentiation: body.differentiation as DifferentiationMode,
        yearGroup: body.yearGroup,
        examBoard: body.examBoard as ExamBoard,
      })
      userMessage = [
        `Topic: ${body.topic}`,
        body.subject && `Subject: ${body.subject}`,
        `Year group: ${body.yearGroup}`,
        `Level: ${body.level}`,
        body.learningObjectives && `Learning objectives:\n${body.learningObjectives}`,
        `\nBLUEPRINT (mirror this structure exactly; write brand-new questions):\n${JSON.stringify(blueprint, null, 2)}`,
      ]
        .filter(Boolean)
        .join('\n\n')
    } else {
      // Optional file / pasted-text source extraction (PDF / DOCX / text).
      const extracted = await extractSourceText(form.get('file'), body.pastedText)
      if ('error' in extracted) {
        return NextResponse.json({ error: extracted.error }, { status: extracted.status })
      }
      const truncatedSource = extracted.text
      const hasSource = truncatedSource.trim().length > 0

      systemPrompt = buildSystemPrompt({
        questionTypes: body.questionTypes as QuestionType[],
        markingMode: body.markingMode as MarkingMode,
        differentiation: body.differentiation as DifferentiationMode,
        yearGroup: body.yearGroup,
        hasSource,
        examBoard: body.examBoard as ExamBoard,
      })

      userMessage = [
        `Topic: ${body.topic}`,
        body.subject && `Subject: ${body.subject}`,
        `Year group: ${body.yearGroup}`,
        `Level: ${body.level}`,
        body.learningObjectives && `Learning objectives:\n${body.learningObjectives}`,
        body.priorKnowledge && `Prior knowledge assumed:\n${body.priorKnowledge}`,
        `Aim for around ${body.numQuestions} questions in total.`,
        hasSource && `\nSOURCE MATERIAL:\n${truncatedSource}`,
      ]
        .filter(Boolean)
        .join('\n\n')
    }

    // Enqueue: persist the built prompt and hand off to the background worker.
    // Generation itself runs there (up to 15 min), beyond the 10s function cap.
    const job = await db.generationJob.create({
      data: { userId, kind: KIND, systemPrompt, userMessage },
    })
    await dispatchGeneration(job.id)

    return NextResponse.json({
      jobId: job.id,
      usedToday: usedToday + 1,
      remainingToday: DAILY_LIMIT - (usedToday + 1),
    })
  } catch (err) {
    // Top-level guard: any unhandled error returns JSON, never a bare HTML 500.
    console.error('[worksheets/generate] enqueue failed:', err)
    return NextResponse.json({ error: 'Could not start generation. Please try again.' }, { status: 500 })
  }
}

async function getHandler(req: NextRequest) {
  let userId: string
  let plan: string
  try {
    ;({ userId, plan } = await getAuthenticatedUser(req))
  } catch (err) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isPro(plan)) {
    return NextResponse.json({ usedToday: 0, remainingToday: 0, dailyLimit: DAILY_LIMIT })
  }

  const usedToday = await countUsedToday(userId, KIND)
  return NextResponse.json({
    usedToday,
    remainingToday: Math.max(0, DAILY_LIMIT - usedToday),
    dailyLimit: DAILY_LIMIT,
  })
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/generate')
export const GET = withLogging(getHandler, 'GET /api/worksheets/generate')
