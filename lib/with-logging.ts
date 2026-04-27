import { NextRequest, NextResponse } from 'next/server'
import { axiom, AXIOM_DATASET } from './logger'

type Handler<C = never> = [C] extends [never]
  ? (req: NextRequest) => Promise<Response>
  : (req: NextRequest, ctx: C) => Promise<Response>

type AnyHandler = (req: NextRequest, ctx?: Record<string, unknown>) => Promise<Response>

export function withLogging<C>(handler: Handler<C>, routeName: string): Handler<C> {
  const wrapped: AnyHandler = async (req, ctx) => {
    const start = Date.now()
    const response = await (handler as AnyHandler)(req, ctx)

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
  return wrapped as Handler<C>
}
