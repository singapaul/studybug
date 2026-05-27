'use client'

import Link from 'next/link'
import { FileText, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { WorksheetSummary } from '@/types/worksheet'

interface WorksheetCardProps {
  worksheet: WorksheetSummary
  onRename: () => void
  onShare: () => void
  onDelete: () => void
}

function relativeTime(iso: string): string {
  const date = new Date(iso)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export function WorksheetCard({ worksheet, onRename, onShare, onDelete }: WorksheetCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2 mb-2">
        <FileText className="h-5 w-5 text-primary shrink-0" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 -mr-1 -mt-1">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onRename}>
              <Pencil className="h-4 w-4 mr-2" /> Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link href={`/worksheets/${worksheet.id}`} className="block">
        <h3 className="font-semibold leading-tight mb-1 line-clamp-2">{worksheet.title}</h3>
        <p className="text-xs text-muted-foreground">
          {[worksheet.subject, worksheet.yearGroup, worksheet.level].filter(Boolean).join(' · ')}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {relativeTime(worksheet.createdAt)}
          {worksheet.shareToken && <span className="ml-2 inline-flex items-center text-primary"><Share2 className="h-3 w-3 mr-1" />shared</span>}
        </p>
      </Link>
    </div>
  )
}
