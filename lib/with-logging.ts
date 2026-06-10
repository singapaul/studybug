import { NextRequest } from 'next/server'
import { logEvent } from './logger'

type Handler<C = never> = [C] extends [never]
  ? (req: NextRequest) => Promise<Response>
  : (req: NextRequest, ctx: C) => Promise<Response>

type AnyHandler = (req: NextRequest, ctx?: Record<string, unknown>) => Promise<Response>

export function withLogging<C>(handler: Handler<C>, routeName: string): Handler<C> {
  const wrapped: AnyHandler = async (req, ctx) => {
    const start = Date.now()
    try {
      const response = await (handler as AnyHandler)(req, ctx)
      await logEvent({
        route: routeName,
        method: req.method,
        status: response.status,
        duration_ms: Date.now() - start,
      })
      return response
    } catch (err) {
      // An unhandled throw here is exactly the case that produced the generic
      // HTML 500 in production with nothing logged. Capture it, then re-throw
      // so Next still returns its error response.
      const e = err as Error
      await logEvent({
        route: routeName,
        method: req.method,
        status: 500,
        duration_ms: Date.now() - start,
        error_name: e?.name,
        error_message: e?.message,
        error_stack: e?.stack,
      })
      throw err
    }
  }
  return wrapped as Handler<C>
}
