// Shared background worker for AI generation (worksheets + games).
//
// Standalone Netlify Background Function: the `-background` filename suffix
// makes it return 202 immediately and run up to 15 minutes — well clear of the
// 10s sync-function cap that was killing in-request generation.
//
// Thin wrapper: auth + body parse, then delegate to the shared core so the same
// logic also runs inline in local dev. Relative import keeps the bundle alias-free.
import { runGenerationJob } from '../../lib/run-generation-job'

const handler = async (req: Request) => {
  // Auth: only our enqueue routes know the shared secret. /.netlify/functions/*
  // is publicly reachable, and this worker spends money + writes the DB.
  const secret = process.env.GENERATION_TRIGGER_SECRET
  if (secret && req.headers.get('x-generation-trigger') !== secret) {
    return new Response('forbidden', { status: 403 })
  }

  let jobId: string | undefined
  try {
    ;({ jobId } = (await req.json()) as { jobId?: string })
  } catch {
    return new Response('bad request', { status: 400 })
  }
  if (!jobId) return new Response('missing jobId', { status: 400 })

  await runGenerationJob(jobId)
  return new Response('ok', { status: 200 })
}

export default handler
