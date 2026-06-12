// THROWAWAY verification function — delete alongside ping-background once WS2a
// is confirmed. Unlike the -background variant, this is SYNCHRONOUS so it can
// return its result in the HTTP response (readable via curl, no Axiom needed).
// It exercises the same standalone-function Prisma bundling.
//   curl https://studybug.io/.netlify/functions/ping
import { db } from '../../lib/db'

const handler = async (_req: Request) => {
  const start = Date.now()
  try {
    const userCount = await db.user.count()
    return Response.json({
      ok: true,
      userCount,
      axiomConfigured: !!process.env.AXIOM_TOKEN,
      duration_ms: Date.now() - start,
    })
  } catch (err) {
    const e = err as Error
    return Response.json(
      {
        ok: false,
        error_name: e?.name,
        error_message: e?.message,
        axiomConfigured: !!process.env.AXIOM_TOKEN,
        duration_ms: Date.now() - start,
      },
      { status: 500 },
    )
  }
}

export default handler
