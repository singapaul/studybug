import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { buildAddQuestionsPrompt } from '@/lib/worksheet-prompts'
import { REFINE_DAILY_LIMIT, countRefinesToday, dispatchGeneration } from '@/lib/generation-trigger'
import { QUESTION_TYPES, MARKING_MODES, type ExamBoard } from '@/types/worksheet'

type Params = { params: Promise<{ id: string }> }
const KIND = 'questions-add'

const BodySchema = z.object({
  count: z.coerce.number().int().min(1).max(10),
  questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1),
  markingMode: z.enum(MARKING_MODES).optional(),
})

type WorksheetContent = {
  examBoard?: ExamBoard
  sections?: { questions?: { text?: string }[] }[]
}

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

    const content = worksheet.content as WorksheetContent
    const existingTexts = (content?.sections ?? [])
      .flatMap((s) => s.questions ?? [])
      .map((q) => q.text)
      .filter(Boolean)
      .slice(0, 40)

    const systemPrompt = buildAddQuestionsPrompt({
      yearGroup: worksheet.yearGroup,
      markingMode: parsed.data.markingMode ?? 'markSchemeWithPoints',
      examBoard: content?.examBoard,
      count: parsed.data.count,
      questionTypes: parsed.data.questionTypes,
    })
    const userMessage = [
      `Worksheet context — Topic: ${worksheet.topic}; Subject: ${worksheet.subject ?? ''}; Year: ${worksheet.yearGroup}; Level: ${worksheet.level}.`,
      existingTexts.length
        ? `Existing questions (do NOT duplicate):\n${existingTexts.map((t) => `- ${t}`).join('\n')}`
        : 'This worksheet has no questions yet.',
      `Add ${parsed.data.count} new question(s).`,
    ].join('\n\n')

    const job = await db.generationJob.create({ data: { userId, kind: KIND, systemPrompt, userMessage } })
    await dispatchGeneration(job.id)
    return NextResponse.json({ jobId: job.id })
  } catch (err) {
    console.error('[worksheets/add-questions] failed:', err)
    return NextResponse.json({ error: 'Could not start refinement. Please try again.' }, { status: 500 })
  }
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/:id/add-questions')
