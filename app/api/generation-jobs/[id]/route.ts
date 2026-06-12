import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser, enforceOwnership } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'

async function getHandler(req: NextRequest, { params }: { params: { id: string } }) {
  let userId: string
  try {
    ;({ userId } = await getAuthenticatedUser(req))
  } catch (err) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const job = await db.generationJob.findUnique({ where: { id: params.id } })
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ownershipError = enforceOwnership(job, userId)
  if (ownershipError) return ownershipError

  return NextResponse.json({
    kind: job.kind,
    status: job.status,
    result: job.status === 'complete' ? job.result : undefined,
    error: job.status === 'failed' ? job.error : undefined,
  })
}

export const GET = withLogging(getHandler, 'GET /api/generation-jobs/[id]')
