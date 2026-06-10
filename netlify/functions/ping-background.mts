// THROWAWAY verification function — delete once WS2a is confirmed.
//
// Proves two risky assumptions before we build the real worker on top:
//   1. Background Functions actually run on this (free) Netlify plan.
//   2. Prisma's query engine is bundled correctly for the function runtime.
//
// Trigger after deploy:  curl -X POST https://studybug.io/.netlify/functions/ping-background
// Then check Axiom for a `ping_background` event with ok:true and a user_count.
//
// Netlify Functions v2: the `-background` filename suffix makes this async —
// it returns 202 immediately and may run for up to 15 minutes.
import { db } from '../../lib/db'
import { logEvent } from '../../lib/logger'

const handler = async (_req: Request) => {
  const start = Date.now()
  try {
    const userCount = await db.user.count()
    await logEvent({
      event: 'ping_background',
      ok: true,
      user_count: userCount,
      duration_ms: Date.now() - start,
    })
  } catch (err) {
    const e = err as Error
    await logEvent({
      event: 'ping_background',
      ok: false,
      error_name: e?.name,
      error_message: e?.message,
      error_stack: e?.stack,
      duration_ms: Date.now() - start,
    })
  }
}

export default handler
