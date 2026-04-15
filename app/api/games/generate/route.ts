import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import pdfParse from 'pdf-parse'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TEXT_LENGTH = 50_000
const DAILY_LIMIT = 10
const MODEL = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT = `You are a study game generator. Given source text, extract key knowledge and return structured study content as JSON.

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "flashcards": [{ "id": "1", "front": "...", "back": "..." }],
  "pairs": [{ "id": "1", "leftText": "...", "rightText": "..." }],
  "multipleChoice": [{
    "id": "1",
    "question": "...",
    "options": [
      { "id": "o1", "text": "...", "isCorrect": true },
      { "id": "o2", "text": "...", "isCorrect": false },
      { "id": "o3", "text": "...", "isCorrect": false },
      { "id": "o4", "text": "...", "isCorrect": false }
    ]
  }],
  "fillInTheBlank": [{ "id": "1", "sentence": "The [blank] is ...", "answer": "..." }],
  "speedRound": [{ "id": "1", "question": "...", "answer": "..." }]
}

Rules:
- Aim for 10+ items per type where the content supports it
- flashcards: front = question/term, back = answer/definition
- pairs: leftText = term, rightText = matching definition or translation
- multipleChoice: exactly 4 options, exactly one isCorrect:true
- fillInTheBlank: every sentence MUST contain exactly one [blank] marker; answer = the word that fills the blank
- speedRound: short question, concise 1-5 word answer
- Return empty array [] for any type that the content cannot support`

export async function POST(req: NextRequest) {
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
    where: { userId, createdAt: { gte: todayMidnight } },
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
  try {
    const form = await req.formData()
    file = form.get('file') as File | null
    topic = (form.get('topic') as string | null) ?? ''
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
      const data = await pdfParse(buffer)
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

  let generatedContent: string
  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
    const block = message.content[0]
    if (block.type !== 'text') throw new Error('Unexpected response type')
    generatedContent = block.text
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'AI generation failed. Please try again.' }, { status: 500 })
  }

  // Parse JSON — strip any markdown fences if present
  let parsed: ReturnType<typeof parseGeneratedContent>
  try {
    const json = generatedContent.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    parsed = parseGeneratedContent(json)
  } catch {
    console.error('Failed to parse Claude response:', generatedContent.slice(0, 500))
    return NextResponse.json({ error: 'AI returned unexpected content. Please try again.' }, { status: 500 })
  }

  // Log the generation
  await db.generationLog.create({ data: { userId } })

  return NextResponse.json({
    ...parsed,
    usedToday: usedToday + 1,
    remainingToday: DAILY_LIMIT - (usedToday + 1),
  })
}

// GET — return today's usage count
export async function GET(req: NextRequest) {
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
    where: { userId, createdAt: { gte: todayMidnight } },
  })

  return NextResponse.json({
    usedToday,
    remainingToday: Math.max(0, DAILY_LIMIT - usedToday),
    dailyLimit: DAILY_LIMIT,
  })
}

interface GeneratedContent {
  flashcards: { id: string; front: string; back: string }[]
  pairs: { id: string; leftText: string; rightText: string }[]
  multipleChoice: {
    id: string
    question: string
    options: { id: string; text: string; isCorrect: boolean }[]
  }[]
  fillInTheBlank: { id: string; sentence: string; answer: string }[]
  speedRound: { id: string; question: string; answer: string }[]
}

function parseGeneratedContent(json: string): GeneratedContent {
  const raw = JSON.parse(json)
  return {
    flashcards: Array.isArray(raw.flashcards) ? raw.flashcards : [],
    pairs: Array.isArray(raw.pairs) ? raw.pairs : [],
    multipleChoice: Array.isArray(raw.multipleChoice) ? raw.multipleChoice : [],
    fillInTheBlank: Array.isArray(raw.fillInTheBlank) ? raw.fillInTheBlank : [],
    speedRound: Array.isArray(raw.speedRound) ? raw.speedRound : [],
  }
}
