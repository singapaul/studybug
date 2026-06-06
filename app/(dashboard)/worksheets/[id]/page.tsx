'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Pencil, Share2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  useWorksheet,
  useDeleteWorksheet,
} from '@/hooks/use-worksheets'
import { WorksheetPreview } from '@/components/worksheets/WorksheetPreview'
import { WorksheetShareModal } from '@/components/worksheets/WorksheetShareModal'
import { WorksheetDownloadButton } from '@/components/worksheets/WorksheetDownloadButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorksheetDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: worksheet, isLoading, isError } = useWorksheet(id)
  const { mutate: deleteWorksheet } = useDeleteWorksheet()
  const [shareOpen, setShareOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (isError || !worksheet) {
    return (
      <div className="p-4 sm:p-6 text-center text-muted-foreground">
        Worksheet not found.
      </div>
    )
  }

  function handleDelete() {
    if (!worksheet) return
    if (!confirm(`Delete "${worksheet.title}"? This cannot be undone.`)) return
    deleteWorksheet(worksheet.id, {
      onSuccess: () => {
        toast.success('Worksheet deleted')
        router.push('/worksheets')
      },
      onError: () => toast.error('Delete failed'),
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2 print:hidden">
        <Button variant="ghost" size="icon" onClick={() => router.push('/worksheets')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{worksheet.title}</h1>
        <Button variant="outline" asChild>
          <Link href={`/worksheets/${worksheet.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Link>
        </Button>
        <WorksheetDownloadButton worksheet={worksheet.content} filenameBase={worksheet.title} />
        <Button variant="outline" onClick={() => setShareOpen(true)}>
          <Share2 className="h-4 w-4 mr-2" /> Share
        </Button>
        <Button variant="ghost" onClick={handleDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </Button>
      </div>

      <WorksheetPreview worksheet={worksheet.content} />

      <WorksheetShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        worksheetId={worksheet.id}
        worksheetTitle={worksheet.title}
        shareToken={worksheet.shareToken}
      />
    </div>
  )
}
