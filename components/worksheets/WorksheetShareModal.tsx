'use client'

import { useState } from 'react'
import { Copy, Check, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useShareWorksheet, useUnshareWorksheet } from '@/hooks/use-worksheets'

interface WorksheetShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  worksheetId: string
  worksheetTitle: string
  shareToken: string | null
}

export function WorksheetShareModal({ open, onOpenChange, worksheetId, worksheetTitle, shareToken: initialToken }: WorksheetShareModalProps) {
  const [shareToken, setShareToken] = useState(initialToken)
  const [copied, setCopied] = useState(false)
  const { mutateAsync: share, isPending: isSharing } = useShareWorksheet()
  const { mutateAsync: unshare, isPending: isUnsharing } = useUnshareWorksheet()

  async function handleCreate() {
    try {
      const token = await share(worksheetId)
      setShareToken(token)
      toast.success('Share link created')
    } catch (err) {
      toast.error('Failed to create share link')
      console.error(err)
    }
  }

  async function handleRevoke() {
    try {
      await unshare(worksheetId)
      setShareToken(null)
      toast.success('Share link revoked')
    } catch (err) {
      toast.error('Failed to revoke share link')
      console.error(err)
    }
  }

  function handleCopy() {
    if (!shareToken) return
    const url = `${window.location.origin}/worksheets/share/${shareToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share &ldquo;{worksheetTitle}&rdquo;</DialogTitle>
        </DialogHeader>
        {shareToken ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Anyone with this link can view the worksheet &mdash; no account needed.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/worksheets/share/${shareToken}`}
              />
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={handleRevoke} disabled={isUnsharing}>
                <Trash2 className="h-4 w-4 mr-2" />
                Revoke link
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create a public link that anyone can open to view this worksheet.
            </p>
            <Button onClick={handleCreate} disabled={isSharing}>
              {isSharing ? 'Creating link...' : 'Create share link'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
