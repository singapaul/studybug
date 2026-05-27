import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { PDFParse } from 'pdf-parse'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TEXT_LENGTH = 50_000
const DAILY_LIMIT = 10
const MODEL = 'claude-haiku-4-5-20251001'

const ALL_GAME_TYPES = ['flashcards', 'pairs', 'multipleChoice', 'fillInTheBlank', 'speedRound'] as const
type GameTypeKey = typeof ALL_GAME_TYPES[number]

const TYPE_SCHEMA: Record<GameTypeKey, string> = {
  flashcards: `"flashcards": [{ "id": "1", "front": "...", "back": "..." }]`,
  pairs: `"pairs": [{ "id": "1", "leftText": "...", "rightText": "..." }]`,
  multipleChoice: `"multipleChoice": [{ "id": "1", "question": "...", "options": [{ "id": "o1", "text": "...", "isCorrect": true }, { "id": "o2", "text": "...", "isCorrect": false }, { "id": "o3", "text": "...", "isCorrect": false }, { "id": "o4", "text": "...", "isCorrect": false }] }]`,
  fillInTheBlank: `"fillInTheBlank": [{ "id": "1", "sentence": "The [blank] is ...", "answer": "..." }]`,
  speedRound: `"speedRound": [{ "id": "1", "question": "...", "answer": "..." }]`,
}

const TYPE_RULES: Record<GameTypeKey, string> = {
  flashcards: '- flashcards: front = question/term, back = answer/definition',
  pairs: '- pairs: leftText = term, rightText = matching definition or translation',
  multipleChoice: '- multipleChoice: exactly 4 options, exactly one isCorrect:true',
  fillInTheBlank: '- fillInTheBlank: every sentence MUST contain exactly one [blank] marker; answer = the word that fills the blank',
  speedRound: '- speedRound: short question, concise 1-5 word answer',
}

function buildSystemPrompt(selectedTypes: GameTypeKey[]): string {
  const selected = new Set(selectedTypes)
  const schemaLines = ALL_GAME_TYPES.map(t =>
    selected.has(t) ? `  ${TYPE_SCHEMA[t]}` : `  "${t}": []`
  )
  const rules = selectedTypes.map(t => TYPE_RULES[t])
  return `You are a study game generator. Given source text, extract key knowledge and return structured study content as JSON.

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
${schemaLines.join(',\n')}
}

Rules:
- Aim for 10+ items per type where the content supports it
${rules.join('\n')}
- Return empty array [] for any type that the content cannot support`
}

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

  // Rate limit check — count today's generations for this user
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const usedToday = await db.generationLog.count({
    where: { userId, kind: 'game', createdAt: { gte: todayMidnight } },
  })

  if (usedToday >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: 'Daily generation limit reached (10/day). Resets at midnight.', code: 'GENERATION_LIMIT_REACHED' },
      { status: 429 }
    )
  }

  // Parse multipart form
  let file: File | null = null
  let topic = ''
  let selectedGameTypes: GameTypeKey[]
  try {
    const form = await req.formData()
    file = form.get('file') as File | null
    topic = (form.get('topic') as string | null) ?? ''
    const gameTypesParam = (form.get('gameTypes') as string | null) ?? ''
    const requested = gameTypesParam
      ? gameTypesParam.split(',').map(s => s.trim()).filter((s): s is GameTypeKey =>
          (ALL_GAME_TYPES as readonly string[]).includes(s)
        )
      : [...ALL_GAME_TYPES]
    selectedGameTypes = requested.length > 0 ? requested : [...ALL_GAME_TYPES]
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const contentType = file.type
  if (contentType !== 'application/pdf' && contentType !== 'text/plain') {
    return NextResponse.json(
      { error: 'Only PDF and plain text files are supported' },
      { status: 400 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
  }

  // Extract text
  let extractedText: string
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    if (contentType === 'application/pdf') {
      const parser = new PDFParse({ data: buffer })
      const data = await parser.getText()
      extractedText = data.text
    } else {
      extractedText = buffer.toString('utf-8')
    }
  } catch {
    return NextResponse.json({ error: 'Failed to read file content' }, { status: 400 })
  }

  if (!extractedText.trim()) {
    return NextResponse.json({ error: 'No readable text found in the file' }, { status: 400 })
  }

  // Truncate
  const textForPrompt = extractedText.slice(0, MAX_TEXT_LENGTH)

  // Build user message
  const userMessage = topic
    ? `Topic focus: ${topic}\n\nTEXT:\n${textForPrompt}`
    : `TEXT:\n${textForPrompt}`

  // Call Claude Haiku
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const systemPrompt = buildSystemPrompt(selectedGameTypes)
  console.log('[generate] Selected game types:', selectedGameTypes)

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
    console.log('[generate] Raw Claude response (first 300 chars):', generatedContent.slice(0, 300))
  } catch (err) {
    console.error('[generate] Claude API error:', err)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }

  // Extract JSON — grabs the outermost {...} block, fence-agnostic
  const jsonMatch = generatedContent.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  const json = jsonMatch ? jsonMatch[0].trim() : generatedContent.trim()
  console.log('[generate] Extracted JSON string (first 300 chars):', json.slice(0, 300))

  // Parse and validate with Zod
  let parsed: ReturnType<typeof parseGeneratedContent>
  try {
    parsed = parseGeneratedContent(json)
  } catch (err) {
    console.error('[generate] JSON parse failed. Full raw response:', generatedContent)
    console.error('[generate] Parse error:', err)
    return NextResponse.json({ error: 'AI returned unexpected content. Please try again.' }, { status: 500 })
  }

  // Log the generation
  await db.generationLog.create({ data: { userId, kind: 'game' } })

  return NextResponse.json({
    ...parsed,
    usedToday: usedToday + 1,
    remainingToday: DAILY_LIMIT - (usedToday + 1),
  })
}

// GET — return today's usage count
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
    where: { userId, kind: 'game', createdAt: { gte: todayMidnight } },
  })

  return NextResponse.json({
    usedToday,
    remainingToday: Math.max(0, DAILY_LIMIT - usedToday),
    dailyLimit: DAILY_LIMIT,
  })
}

// ── Zod schemas ────────────────────────────────────────────────────────────────

const FlashcardSchema = z.object({
  id: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
})

const PairSchema = z.object({
  id: z.string(),
  leftText: z.string().min(1),
  rightText: z.string().min(1),
})

const MultipleChoiceOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
})

const MultipleChoiceSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  options: z.array(MultipleChoiceOptionSchema).length(4),
})

const FillInTheBlankSchema = z.object({
  id: z.string(),
  sentence: z.string().refine(s => s.includes('[blank]'), { message: 'Missing [blank]' }),
  answer: z.string().min(1),
})

const SpeedRoundSchema = z.object({
  id: z.string(),
  question: z.string().min(1),
  answer: z.string().min(1),
})

const GeneratedContentSchema = z.object({
  flashcards: z.array(z.unknown()),
  pairs: z.array(z.unknown()),
  multipleChoice: z.array(z.unknown()),
  fillInTheBlank: z.array(z.unknown()),
  speedRound: z.array(z.unknown()),
})

// ── Parser ─────────────────────────────────────────────────────────────────────

function parseItems<T>(items: unknown[], schema: z.ZodType<T>, label: string): T[] {
  return items.flatMap((item, i) => {
    const result = schema.safeParse(item)
    if (!result.success) {
      console.warn(`[generate] Skipping malformed ${label}[${i}]:`, result.error.issues)
      return []
    }
    return [result.data]
  })
}

function parseGeneratedContent(json: string) {
  const raw = JSON.parse(json)

  const topLevel = GeneratedContentSchema.parse({
    flashcards: Array.isArray(raw.flashcards) ? raw.flashcards : [],
    pairs: Array.isArray(raw.pairs) ? raw.pairs : [],
    multipleChoice: Array.isArray(raw.multipleChoice) ? raw.multipleChoice : [],
    fillInTheBlank: Array.isArray(raw.fillInTheBlank) ? raw.fillInTheBlank : [],
    speedRound: Array.isArray(raw.speedRound) ? raw.speedRound : [],
  })

  return {
    flashcards: parseItems(topLevel.flashcards, FlashcardSchema, 'flashcard'),
    pairs: parseItems(topLevel.pairs, PairSchema, 'pair'),
    multipleChoice: parseItems(topLevel.multipleChoice, MultipleChoiceSchema, 'multipleChoice'),
    fillInTheBlank: parseItems(topLevel.fillInTheBlank, FillInTheBlankSchema, 'fillInTheBlank'),
    speedRound: parseItems(topLevel.speedRound, SpeedRoundSchema, 'speedRound'),
  }
}

export const POST = withLogging(postHandler, 'POST /api/games/generate')
export const GET = withLogging(getHandler, 'GET /api/games/generate')
