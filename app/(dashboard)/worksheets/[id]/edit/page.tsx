'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useWorksheet, useUpdateWorksheetContent } from '@/hooks/use-worksheets'
import { WorksheetEditor } from '@/components/worksheets/WorksheetEditor'
import type { GeneratedWorksheet } from '@/types/worksheet'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorksheetEditPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: worksheet, isLoading, isError } = useWorksheet(id)
  const { mutate: updateContent, isPending } = useUpdateWorksheetContent()

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (isError || !worksheet) {
    return (
      <div className="p-4 sm:p-6 text-center text-muted-foreground">Worksheet not found.</div>
    )
  }

  function handleSave(content: GeneratedWorksheet) {
    updateContent(
      { id, content },
      {
        onSuccess: () => {
          toast.success('Worksheet saved')
          router.push(`/worksheets/${id}`)
        },
        onError: (err) =>
          toast.error(
            err.message?.includes('content')
              ? 'Some fields are incomplete — please fill every question and answer.'
              : 'Save failed',
          ),
      },
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/worksheets/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold flex-1">Edit worksheet</h1>
      </div>

      <WorksheetEditor
        worksheetId={id}
        initial={worksheet.content}
        isSaving={isPending}
        onSave={handleSave}
        onCancel={() => router.push(`/worksheets/${id}`)}
      />
    </div>
  )
}
