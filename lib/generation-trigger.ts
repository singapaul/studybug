import { db } from './db'
import { runGenerationJob } from './run-generation-job'

export const DAILY_LIMIT = 10

// AI refinements (regenerate-question, add-questions) are cheap, per-worksheet
// polish actions — they get their own generous cap and never touch the 10/day.
export const REFINE_DAILY_LIMIT = 50
export const REFINE_KINDS = ['question-regen', 'questions-add'] as const

/**
 * Today's usage = completed generations + currently in-flight jobs, so a burst
 * of rapid submits can't blow past the daily limit before any job completes.
 */
export async function countUsedToday(userId: string, kind: string): Promise<number> {
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  const [completed, inFlight] = await Promise.all([
    db.generationLog.count({ where: { userId, kind, createdAt: { gte: todayMidnight } } }),
    db.generationJob.count({
      where: {
        userId,
        kind,
        status: { in: ['pending', 'running'] },
        createdAt: { gte: todayMidnight },
      },
    }),
  ])
  return completed + inFlight
}

/** Today's refinement usage across both refine kinds (completed + in-flight). */
export async function countRefinesToday(userId: string): Promise<number> {
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)
  const kind = { in: [...REFINE_KINDS] }
  const [completed, inFlight] = await Promise.all([
    db.generationLog.count({ where: { userId, kind, createdAt: { gte: todayMidnight } } }),
    db.generationJob.count({
      where: { userId, kind, status: { in: ['pending', 'running'] }, createdAt: { gte: todayMidnight } },
    }),
  ])
  return completed + inFlight
}

/**
 * Kick off generation for a pending job.
 * - Deployed (Netlify): POST the background worker and return immediately (202).
 * - Local dev: there is no functions endpoint, so run the job inline.
 * If the trigger fails, the job is marked failed so the client poll doesn't hang.
 */
export async function dispatchGeneration(jobId: string): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    await runGenerationJob(jobId)
    return
  }

  const base = process.env.URL ?? process.env.NEXT_PUBLIC_APP_URL
  if (!base) {
    // No base URL to reach the function — fall back to inline rather than hang.
    await runGenerationJob(jobId)
    return
  }

  const secret = process.env.GENERATION_TRIGGER_SECRET
  try {
    await fetch(`${base}/.netlify/functions/generate-background`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(secret ? { 'x-generation-trigger': secret } : {}),
      },
      body: JSON.stringify({ jobId }),
    })
  } catch (err) {
    console.error('[dispatchGeneration] trigger failed:', err)
    await db.generationJob.update({
      where: { id: jobId },
      data: { status: 'failed', error: 'Could not start generation', failureStage: 'llm_call' },
    })
  }
}
