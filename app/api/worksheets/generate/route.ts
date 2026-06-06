import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { PDFParse } from 'pdf-parse'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { buildSystemPrompt } from '@/lib/worksheet-prompts'
import {
  parseGeneratedWorksheet,
  QUESTION_TYPES,
  MARKING_MODES,
  DIFFERENTIATION_MODES,
  EXAM_BOARDS,
  type QuestionType,
  type MarkingMode,
  type DifferentiationMode,
  type ExamBoard,
} from '@/types/worksheet'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TEXT_LENGTH = 50_000
const DAILY_LIMIT = 10
const MODEL = 'claude-haiku-4-5-20251001'
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

  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const usedToday = await db.generationLog.count({
    where: { userId, kind: KIND, createdAt: { gte: todayMidnight } },
  })

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

  // Optional file extraction
  let sourceText = body.pastedText.trim()
  const file = form.get('file')
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
    }
    const contentType = file.type
    if (contentType !== 'application/pdf' && contentType !== 'text/plain') {
      return NextResponse.json(
        { error: 'Only PDF and plain text files are supported' },
        { status: 400 },
      )
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      if (contentType === 'application/pdf') {
        const parser = new PDFParse({ data: buffer })
        const data = await parser.getText()
        sourceText = [sourceText, data.text].filter(Boolean).join('\n\n')
      } else {
        sourceText = [sourceText, buffer.toString('utf-8')].filter(Boolean).join('\n\n')
      }
    } catch {
      return NextResponse.json({ error: 'Failed to read file content' }, { status: 400 })
    }
  }

  const truncatedSource = sourceText.slice(0, MAX_TEXT_LENGTH)
  const hasSource = truncatedSource.trim().length > 0

  const systemPrompt = buildSystemPrompt({
    questionTypes: body.questionTypes as QuestionType[],
    markingMode: body.markingMode as MarkingMode,
    differentiation: body.differentiation as DifferentiationMode,
    yearGroup: body.yearGroup,
    hasSource,
    examBoard: body.examBoard as ExamBoard,
  })

  const userMessage = [
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

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let generatedContent: string
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    generatedContent = block.text
  } catch (err) {
    console.error('[worksheets/generate] Claude API error:', err)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }

  const jsonMatch = generatedContent.match(/\{[\s\S]*\}/)
  const json = jsonMatch ? jsonMatch[0] : generatedContent.trim()

  let worksheet
  try {
    worksheet = parseGeneratedWorksheet(json)
  } catch (err) {
    console.error('[worksheets/generate] JSON parse failed:', err)
    console.error('[worksheets/generate] Raw response (truncated):', generatedContent.slice(0, 500))
    return NextResponse.json(
      { error: 'AI returned unexpected content. Please try again.' },
      { status: 500 },
    )
  }

  await db.generationLog.create({ data: { userId, kind: KIND } })

  return NextResponse.json({
    worksheet,
    usedToday: usedToday + 1,
    remainingToday: DAILY_LIMIT - (usedToday + 1),
  })
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

  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  const usedToday = await db.generationLog.count({
    where: { userId, kind: KIND, createdAt: { gte: todayMidnight } },
  })

  return NextResponse.json({
    usedToday,
    remainingToday: Math.max(0, DAILY_LIMIT - usedToday),
    dailyLimit: DAILY_LIMIT,
  })
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/generate')
export const GET = withLogging(getHandler, 'GET /api/worksheets/generate')
