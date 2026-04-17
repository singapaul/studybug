import { NextRequest, NextResponse } from 'next/server'
import { axiom, AXIOM_DATASET } from './logger'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (req: NextRequest, ctx?: any) => Promise<NextResponse>

export function withLogging(handler: Handler, routeName: string): Handler {
  return async (req: NextRequest, ctx?: unknown) => {
    const start = Date.now()
    const response = await handler(req, ctx)

    if (process.env.AXIOM_TOKEN) {
      axiom.ingest(AXIOM_DATASET, [{
        _time: new Date().toISOString(),
        route: routeName,
        method: req.method,
        status: response.status,
        duration_ms: Date.now() - start,
      }])
      await axiom.flush()
    }

    return response
  }
}
