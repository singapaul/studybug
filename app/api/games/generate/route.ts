import { NextRequest, NextResponse } from 'next/server'
import { extractText, getDocumentProxy } from 'unpdf'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { DAILY_LIMIT, countUsedToday, dispatchGeneration } from '@/lib/generation-trigger'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TEXT_LENGTH = 50_000
const KIND = 'game'

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

  try {
    const usedToday = await countUsedToday(userId, KIND)
    if (usedToday >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: 'Daily generation limit reached (10/day). Resets at midnight.', code: 'GENERATION_LIMIT_REACHED' },
        { status: 429 },
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
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
    }

    // Extract text
    let extractedText: string
    try {
      if (contentType === 'application/pdf') {
        // unpdf ships a serverless pdfjs build (no DOMMatrix/canvas deps).
        const data = new Uint8Array(await file.arrayBuffer())
        const pdf = await getDocumentProxy(data)
        const { text } = await extractText(pdf, { mergePages: true })
        extractedText = text
      } else {
        const buffer = Buffer.from(await file.arrayBuffer())
        extractedText = buffer.toString('utf-8')
      }
    } catch {
      return NextResponse.json({ error: 'Failed to read file content' }, { status: 400 })
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'No readable text found in the file' }, { status: 400 })
    }

    const textForPrompt = extractedText.slice(0, MAX_TEXT_LENGTH)
    const userMessage = topic
      ? `Topic focus: ${topic}\n\nTEXT:\n${textForPrompt}`
      : `TEXT:\n${textForPrompt}`
    const systemPrompt = buildSystemPrompt(selectedGameTypes)

    // Enqueue: persist the built prompt and hand off to the background worker.
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
    console.error('[games/generate] enqueue failed:', err)
    return NextResponse.json({ error: 'Could not start generation. Please try again.' }, { status: 500 })
  }
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

  const usedToday = await countUsedToday(userId, KIND)
  return NextResponse.json({
    usedToday,
    remainingToday: Math.max(0, DAILY_LIMIT - usedToday),
    dailyLimit: DAILY_LIMIT,
  })
}

export const POST = withLogging(postHandler, 'POST /api/games/generate')
export const GET = withLogging(getHandler, 'GET /api/games/generate')
