import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthenticatedUser, isPro } from '@/lib/api-helpers'
import { withLogging } from '@/lib/with-logging'
import { buildBlueprintExtractionPrompt } from '@/lib/worksheet-prompts'
import { dispatchGeneration } from '@/lib/generation-trigger'
import { extractSourceText } from '@/lib/extract-source'

const KIND = 'remix-extract'

// Pass 1 of remix: read an uploaded worksheet/test and extract its blueprint
// (structure only). Cheap relative to generation, so it is Pro-gated but does
// NOT count against the daily worksheet-generation limit.
async function postHandler(req: NextRequest) {
  let userId: string
  let plan: string
  try {
    ;({ userId, plan } = await getAuthenticatedUser(req))
  } catch (err) {
    if (err instanceof NextResponse) return err
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isPro(plan)) {
    return NextResponse.json({ error: 'Pro plan required', code: 'PRO_REQUIRED' }, { status: 403 })
  }

  try {
    let form: FormData
    try {
      form = await req.formData()
    } catch {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const pastedText = (form.get('pastedText') as string | null) ?? ''
    const extracted = await extractSourceText(form.get('file'), pastedText)
    if ('error' in extracted) {
      return NextResponse.json({ error: extracted.error }, { status: extracted.status })
    }
    if (!extracted.text.trim()) {
      return NextResponse.json(
        { error: 'Could not read any text from the upload. Try a text-based PDF, a .docx, or paste the worksheet.' },
        { status: 400 },
      )
    }

    const systemPrompt = buildBlueprintExtractionPrompt()
    const userMessage = `WORKSHEET TO ANALYSE:\n\n${extracted.text}`

    const job = await db.generationJob.create({
      data: { userId, kind: KIND, systemPrompt, userMessage },
    })
    await dispatchGeneration(job.id)

    return NextResponse.json({ jobId: job.id })
  } catch (err) {
    console.error('[worksheets/remix/extract] enqueue failed:', err)
    return NextResponse.json({ error: 'Could not analyse the upload. Please try again.' }, { status: 500 })
  }
}

export const POST = withLogging(postHandler, 'POST /api/worksheets/remix/extract')
