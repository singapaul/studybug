import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_TEXT_LENGTH = 50_000

export const DOCX_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** Content types accepted for worksheet source uploads (generation + remix). */
export const ACCEPTED_UPLOAD_TYPES = ['application/pdf', 'text/plain', DOCX_TYPE] as const

/** Browser `accept` attribute string mirroring {@link ACCEPTED_UPLOAD_TYPES}. */
export const UPLOAD_ACCEPT_ATTR = '.pdf,.txt,.docx,application/pdf,text/plain'

export type ExtractResult = { text: string } | { error: string; status: number }

/**
 * Extract plain text from an optional uploaded file (PDF / DOCX / plain text),
 * merged after any pasted text, and truncated to {@link MAX_TEXT_LENGTH}.
 * Returns an `{ error, status }` shape for the caller to turn into a JSON response.
 */
export async function extractSourceText(file: unknown, pastedText: string): Promise<ExtractResult> {
  let sourceText = pastedText.trim()

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: 'File exceeds 10MB limit', status: 400 }
    }
    const contentType = file.type
    if (!ACCEPTED_UPLOAD_TYPES.includes(contentType as (typeof ACCEPTED_UPLOAD_TYPES)[number])) {
      return { error: 'Only PDF, Word (.docx) and plain text files are supported', status: 400 }
    }
    try {
      if (contentType === 'application/pdf') {
        // unpdf ships a serverless pdfjs build (no DOMMatrix/canvas deps).
        const data = new Uint8Array(await file.arrayBuffer())
        const pdf = await getDocumentProxy(data)
        const { text } = await extractText(pdf, { mergePages: true })
        sourceText = [sourceText, text].filter(Boolean).join('\n\n')
      } else if (contentType === DOCX_TYPE) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const { value } = await mammoth.extractRawText({ buffer })
        sourceText = [sourceText, value].filter(Boolean).join('\n\n')
      } else {
        const buffer = Buffer.from(await file.arrayBuffer())
        sourceText = [sourceText, buffer.toString('utf-8')].filter(Boolean).join('\n\n')
      }
    } catch {
      return { error: 'Failed to read file content', status: 400 }
    }
  }

  return { text: sourceText.slice(0, MAX_TEXT_LENGTH) }
}
