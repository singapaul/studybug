import { Axiom } from '@axiomhq/js'

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
})

export const AXIOM_DATASET = process.env.AXIOM_DATASET ?? 'studybug-production'

/**
 * Ingest a single structured event to Axiom. No-ops when AXIOM_TOKEN is unset,
 * and never throws — logging must not break the request or background job.
 * Safe to call from anywhere, including standalone Netlify functions that
 * cannot use the withLogging route wrapper.
 */
export async function logEvent(fields: Record<string, unknown>): Promise<void> {
  if (!process.env.AXIOM_TOKEN) return
  try {
    axiom.ingest(AXIOM_DATASET, [{ _time: new Date().toISOString(), ...fields }])
    await axiom.flush()
  } catch {
    // swallow — observability is best-effort
  }
}
