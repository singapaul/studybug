'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { GeneratedWorksheet } from '@/types/worksheet'
import type { PdfVariant } from '@/lib/worksheet-pdf'

interface Props {
  worksheet: GeneratedWorksheet
  /** Used to name the downloaded files. */
  filenameBase: string
  /** When set, the student copy embeds a QR code linking to the public share page. */
  shareToken?: string | null
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'worksheet'
}

type Format = 'pdf' | 'docx'

export function WorksheetDownloadButton({ worksheet, filenameBase, shareToken }: Props) {
  const [busy, setBusy] = useState(false)

  // Generate a QR (PNG data URL) to the public share page — student copy only.
  async function qrForStudent(variant: PdfVariant): Promise<string | undefined> {
    if (variant !== 'student' || !shareToken) return undefined
    const origin = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    const { default: QRCode } = await import('qrcode')
    return QRCode.toDataURL(`${origin}/worksheets/share/${shareToken}`, { margin: 1, width: 180 })
  }

  function triggerDownload(blob: Blob, ext: string, variant: PdfVariant) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slugify(filenameBase)}${variant === 'answers' ? '-answers' : ''}.${ext}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function download(variant: PdfVariant, format: Format) {
    setBusy(true)
    try {
      const qrDataUrl = await qrForStudent(variant)
      if (format === 'pdf') {
        // Loaded on demand — @react-pdf/renderer is heavy and browser-only.
        const [{ pdf }, { WorksheetPdfDocument }] = await Promise.all([
          import('@react-pdf/renderer'),
          import('@/components/worksheets/pdf/WorksheetPdf'),
        ])
        const blob = await pdf(
          <WorksheetPdfDocument worksheet={worksheet} variant={variant} qrDataUrl={qrDataUrl} />,
        ).toBlob()
        triggerDownload(blob, 'pdf', variant)
      } else {
        const { worksheetToDocxBlob } = await import('@/lib/worksheet-docx')
        const blob = await worksheetToDocxBlob(worksheet, variant, qrDataUrl)
        triggerDownload(blob, 'docx', variant)
      }
    } catch (err) {
      console.error('[worksheet export] failed:', err)
      toast.error('Export failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => download('student', 'pdf')}>Student PDF</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => download('answers', 'pdf')}>Answer key PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => download('student', 'docx')}>Student DOCX (Word)</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => download('answers', 'docx')}>Answer key DOCX (Word)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
