'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { GeneratedWorksheet } from '@/types/worksheet'
import type { PdfVariant } from '@/lib/worksheet-pdf'

interface Props {
  worksheet: GeneratedWorksheet
  /** Used to name the downloaded files. */
  filenameBase: string
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'worksheet'
}

export function WorksheetDownloadButton({ worksheet, filenameBase }: Props) {
  const [busy, setBusy] = useState(false)

  async function download(variant: PdfVariant) {
    setBusy(true)
    try {
      // Loaded on demand — @react-pdf/renderer is heavy and browser-only.
      const [{ pdf }, { WorksheetPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/worksheets/pdf/WorksheetPdf'),
      ])
      const blob = await pdf(<WorksheetPdfDocument worksheet={worksheet} variant={variant} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slugify(filenameBase)}${variant === 'answers' ? '-answers' : ''}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[worksheet pdf] export failed:', err)
      toast.error('PDF export failed')
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
        <DropdownMenuItem onSelect={() => download('student')}>Student PDF</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => download('answers')}>Answer key PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
