'use client'

import { use } from 'react'
import { Loader2 } from 'lucide-react'
import { useSharedWorksheet } from '@/hooks/use-worksheets'
import { WorksheetPreview } from '@/components/worksheets/WorksheetPreview'

interface PageProps {
  params: Promise<{ token: string }>
}

export default function SharedWorksheetPage({ params }: PageProps) {
  const { token } = use(params)
  const { data: worksheet, isLoading, isError } = useSharedWorksheet(token)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (isError || !worksheet) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        This worksheet does not exist or its share link has been revoked.
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <WorksheetPreview worksheet={worksheet.content} />
    </div>
  )
}
