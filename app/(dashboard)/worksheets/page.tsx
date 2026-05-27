'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Search, Loader2 } from 'lucide-react'
import { useWorksheets, useDeleteWorksheet, useRenameWorksheet } from '@/hooks/use-worksheets'
import { usePlan } from '@/hooks/use-plan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { WorksheetCard } from '@/components/worksheets/WorksheetCard'
import { WorksheetShareModal } from '@/components/worksheets/WorksheetShareModal'
import type { WorksheetSummary } from '@/types/worksheet'

export default function WorksheetsPage() {
  const { data, isLoading, isError } = useWorksheets()
  const { isPro } = usePlan()
  const { mutate: deleteWorksheet } = useDeleteWorksheet()
  const { mutateAsync: renameWorksheet } = useRenameWorksheet()

  const [search, setSearch] = useState('')
  const [renameTarget, setRenameTarget] = useState<WorksheetSummary | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [shareTarget, setShareTarget] = useState<WorksheetSummary | null>(null)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (isError) {
    return (
      <div className="p-4 sm:p-6 text-center text-muted-foreground">
        Failed to load worksheets. Please refresh.
      </div>
    )
  }

  const worksheets = data ?? []
  const filtered = worksheets.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.topic.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleRenameConfirm() {
    if (!renameTarget) return
    try {
      await renameWorksheet({ id: renameTarget.id, title: renameValue.trim() })
      toast.success('Worksheet renamed')
      setRenameTarget(null)
    } catch (err) {
      toast.error('Rename failed')
      console.error(err)
    }
  }

  function handleDelete(w: WorksheetSummary) {
    if (!confirm(`Delete "${w.title}"? This cannot be undone.`)) return
    deleteWorksheet(w.id, {
      onSuccess: () => toast.success('Worksheet deleted'),
      onError: () => toast.error('Delete failed'),
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Worksheets</h1>
        {isPro && (
          <Button asChild>
            <Link href="/worksheets/new">
              <Plus className="h-4 w-4 mr-2" /> New worksheet
            </Link>
          </Button>
        )}
      </div>

      {!isPro && (
        <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
          <h2 className="font-semibold mb-1">Worksheet generation is a Pro feature</h2>
          <p className="text-sm text-muted-foreground mb-4">Upgrade to generate, save, and share worksheets.</p>
          <Button asChild>
            <Link href="/settings">Upgrade to Pro</Link>
          </Button>
        </div>
      )}

      {isPro && worksheets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-1">No worksheets yet</h2>
          <p className="text-sm text-muted-foreground mb-4">Generate your first worksheet to get started.</p>
          <Button asChild>
            <Link href="/worksheets/new">Generate worksheet</Link>
          </Button>
        </div>
      )}

      {isPro && worksheets.length > 0 && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or topic"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No worksheets match your search.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((w) => (
                <WorksheetCard
                  key={w.id}
                  worksheet={w}
                  onRename={() => {
                    setRenameTarget(w)
                    setRenameValue(w.title)
                  }}
                  onShare={() => setShareTarget(w)}
                  onDelete={() => handleDelete(w)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename worksheet</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={200} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRenameConfirm} disabled={!renameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {shareTarget && (
        <WorksheetShareModal
          open
          onOpenChange={(open) => !open && setShareTarget(null)}
          worksheetId={shareTarget.id}
          worksheetTitle={shareTarget.title}
          shareToken={shareTarget.shareToken}
        />
      )}
    </div>
  )
}
