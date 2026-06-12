import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { buildQuestionRegenPrompt } from '@/lib/worksheet-prompts'
import { REFINE_DAILY_LIMIT, countRefinesToday, dispatchGeneration } from '@/lib/generation-trigger'
import { QuestionSchema, MARKING_MODES, type ExamBoard } from '@/types/worksheet'

type Params = { params: Promise<{ id: string }> }
const KIND = 'question-regen'

const BodySchema = z.object({
  question: z.unknown(),
  instruction: z.string().max(500).optional(),
  markingMode: z.enum(MARKING_MODES).optional(),
})

async function postHandler(req: NextRequest, { params }: Params) {
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
    const { id } = await params
    const worksheet = await db.worksheet.findUnique({ where: { id } })
    if (!worksheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const forbidden = enforceOwnership(worksheet, userId)
    if (forbidden) return forbidden

    if ((await countRefinesToday(userId)) >= REFINE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily refinement limit reached. Resets at midnight.', code: 'GENERATION_LIMIT_REACHED' },
        { status: 429 },
      )
    }

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
    }
    const question = QuestionSchema.safeParse(parsed.data.question)
    if (!question.success) {
      return NextResponse.json({ error: 'Invalid question', issues: question.error.issues }, { status: 400 })
    }

    const examBoard = (worksheet.content as { examBoard?: ExamBoard })?.examBoard
    const systemPrompt = buildQuestionRegenPrompt({
      yearGroup: worksheet.yearGroup,
      markingMode: parsed.data.markingMode ?? 'markSchemeWithPoints',
      examBoard,
    })
    const userMessage = [
      `Worksheet context — Topic: ${worksheet.topic}; Subject: ${worksheet.subject ?? ''}; Year: ${worksheet.yearGroup}; Level: ${worksheet.level}.`,
      `Existing question (regenerate this one):\n${JSON.stringify(question.data)}`,
      `Instruction: ${parsed.data.instruction || 'Produce a fresh alternative of similar difficulty and marks.'}`,
    ].join('\n\n')

    const job = await db.generationJob.create({ data: { userId, kind: KIND, systemPrompt, userMessage } })
    await dispatchGeneration(job.id)
    return NextResponse.json({ jobId: job.id })
  } catch (err) {
    console.error('[worksheets/regenerate-question] failed:', err)
    return NextResponse.json({ error: 'Could not start refinement. Please try again.' }, { status: 500 })
  }
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/:id/regenerate-question')
