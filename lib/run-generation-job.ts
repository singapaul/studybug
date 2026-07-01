// Core AI-generation logic, shared by the standalone Netlify background worker
// (netlify/functions/generate-background.mts) and the inline dev fallback in
// the enqueue routes. Uses RELATIVE imports only, so it bundles cleanly into a
// standalone Netlify Function (the `@/` tsconfig alias isn't resolved there).
import Anthropic from '@anthropic-ai/sdk'
import { jsonrepair } from 'jsonrepair'
import { z } from 'zod'
import { db } from './db'
import { logEvent } from './logger'
import { parseGeneratedWorksheet, parseBlueprint, QuestionSchema } from '../types/worksheet'
import { parseGeneratedContent } from './game-parse'

const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 8000

type Stage = 'llm_call' | 'parse' | 'db'

/** Parse one refined question; the model returns a single question object. */
function parseOneQuestion(json: string) {
  return QuestionSchema.parse(JSON.parse(json))
}

/** Parse a list of added questions; accepts a bare array or { questions: [...] }. */
function parseQuestionList(json: string) {
  const raw = JSON.parse(json)
  const arr = Array.isArray(raw) ? raw : raw.questions
  return z.array(QuestionSchema).parse(arr)
}

function parserForKind(kind: string): (json: string) => unknown {
  switch (kind) {
    case 'worksheet': return parseGeneratedWorksheet
    case 'remix-extract': return parseBlueprint
    case 'game': return parseGeneratedContent
    case 'question-regen': return parseOneQuestion
    case 'questions-add': return parseQuestionList
    default: throw new Error(`Unknown job kind: ${kind}`)
  }
}

function parseByKind(kind: string, raw: string) {
  const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  const json = match ? match[0].trim() : raw.trim()
  const parse = parserForKind(kind)
  try {
    return parse(json)
  } catch {
    // repair-then-parse: salvage a near-valid response (trailing commas,
    // truncated/unclosed braces) instead of discarding a paid-for call.
    return parse(jsonrepair(json))
  }
}

/**
 * Run a pending GenerationJob to a terminal state (complete | failed).
 * Idempotent: claims the job atomically so a Netlify retry can't double-process
 * (and double-charge) it. Never throws — failures are recorded on the job row.
 */
export async function runGenerationJob(jobId: string): Promise<void> {
  // Claim the job so a retry / concurrent invocation can't process it twice.
  const claimed = await db.generationJob.updateMany({
    where: { id: jobId, status: 'pending' },
    data: { status: 'running' },
  })
  if (claimed.count === 0) return

  const job = await db.generationJob.findUnique({ where: { id: jobId } })
  if (!job) return

  const start = Date.now()
  await logEvent({ event: 'generation_started', jobId, kind: job.kind, userId: job.userId })

  let stage: Stage = 'llm_call'
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
    const client = new Anthropic({ apiKey })

    const llmStart = Date.now()
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: job.systemPrompt,
      messages: [{ role: 'user', content: job.userMessage }],
    })
    const llmDuration = Date.now() - llmStart
    const block = message.content[0]
    if (!block || block.type !== 'text') throw new Error('Unexpected response type')

    stage = 'parse'
    const result = parseByKind(job.kind, block.text)

    stage = 'db'
    await db.generationJob.update({
      where: { id: job.id },
      data: { status: 'complete', result: result as object, error: null, failureStage: null },
    })
    // Quota is consumed only on success — failures never burn the daily limit.
    await db.generationLog.create({ data: { userId: job.userId, kind: job.kind } })

    await logEvent({
      event: 'generation_completed',
      jobId,
      kind: job.kind,
      userId: job.userId,
      llm_duration_ms: llmDuration,
      total_duration_ms: Date.now() - start,
      input_tokens: message.usage?.input_tokens,
      output_tokens: message.usage?.output_tokens,
      stop_reason: message.stop_reason,
    })
  } catch (err) {
    const e = err as Error
    // Always drive the job to a terminal state so the client poll doesn't hang.
    try {
      await db.generationJob.update({
        where: { id: job.id },
        data: { status: 'failed', error: e?.message ?? 'Generation failed', failureStage: stage },
      })
    } catch {
      // best-effort; the log below still records the failure
    }
    await logEvent({
      event: 'generation_failed',
      jobId,
      kind: job.kind,
      userId: job.userId,
      stage,
      reason: e?.message,
      total_duration_ms: Date.now() - start,
    })
  }
}
