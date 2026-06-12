'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, FileText, Search, Folder, FolderPlus, Inbox, Layers, Star,
  MoreHorizontal, Pencil, Trash2, Trash,
} from 'lucide-react'
import {
  useWorksheets, useDeleteWorksheet, useRenameWorksheet,
  useWorksheetFolders, useCreateFolder, useRenameFolder, useDeleteFolder,
  useMoveWorksheet, useDuplicateWorksheet, useToggleFavourite, useUpdateWorksheetTags,
} from '@/hooks/use-worksheets'
import { usePlan } from '@/hooks/use-plan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { WorksheetCard } from '@/components/worksheets/WorksheetCard'
import { WorksheetShareModal } from '@/components/worksheets/WorksheetShareModal'
import { EmptyState } from '@/components/ui/empty-state'
import { CardGridSkeleton } from '@/components/skeletons'
import { YEAR_GROUPS } from '@/lib/worksheet-options'
import type { WorksheetSummary, WorksheetFolder } from '@/types/worksheet'

type SortKey = 'newest' | 'title' | 'subject' | 'yearGroup' | 'level'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'subject', label: 'Subject' },
  { value: 'yearGroup', label: 'Year group' },
  { value: 'level', label: 'Level' },
]

function compareWorksheets(a: WorksheetSummary, b: WorksheetSummary, sort: SortKey): number {
  switch (sort) {
    case 'title':
      return a.title.localeCompare(b.title)
    case 'subject':
      return (a.subject ?? '').localeCompare(b.subject ?? '')
    case 'yearGroup':
      return YEAR_GROUPS.indexOf(a.yearGroup as (typeof YEAR_GROUPS)[number]) -
        YEAR_GROUPS.indexOf(b.yearGroup as (typeof YEAR_GROUPS)[number])
    case 'level':
      return a.level.localeCompare(b.level)
    default:
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  }
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-auto min-w-[130px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{`All ${label}`}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

export default function WorksheetsPage() {
  const { isPro } = usePlan()
  const [activeFolder, setActiveFolder] = useState<string | undefined>(undefined) // undefined=all, 'unfiled', or id

  const { data, isLoading, isError } = useWorksheets(activeFolder)
  const { data: folders = [] } = useWorksheetFolders()
  const { mutate: deleteWorksheet, mutateAsync: deleteWorksheetAsync } = useDeleteWorksheet()
  const { mutateAsync: renameWorksheet } = useRenameWorksheet()
  const { mutate: duplicateWorksheet } = useDuplicateWorksheet()
  const { mutate: moveWorksheet } = useMoveWorksheet()
  const { mutate: toggleFavourite } = useToggleFavourite()
  const { mutateAsync: updateTags } = useUpdateWorksheetTags()
  const { mutateAsync: createFolder } = useCreateFolder()
  const { mutateAsync: renameFolder } = useRenameFolder()
  const { mutate: deleteFolder } = useDeleteFolder()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [favouritesOnly, setFavouritesOnly] = useState(false)
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [tagsTarget, setTagsTarget] = useState<WorksheetSummary | null>(null)
  const [tagsValue, setTagsValue] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renameTarget, setRenameTarget] = useState<WorksheetSummary | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [shareTarget, setShareTarget] = useState<WorksheetSummary | null>(null)
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderRenameTarget, setFolderRenameTarget] = useState<WorksheetFolder | null>(null)
  const [folderRenameValue, setFolderRenameValue] = useState('')

  if (!isPro) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Worksheets</h1>
        <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center">
          <h2 className="font-semibold mb-1">Worksheet generation is a Pro feature</h2>
          <p className="text-sm text-muted-foreground mb-4">Upgrade to generate, save, and share worksheets.</p>
          <Button asChild><Link href="/settings">Upgrade to Pro</Link></Button>
        </div>
      </div>
    )
  }

  const worksheets = data ?? []

  // Distinct filter options derived from the loaded worksheets.
  const uniq = (vals: (string | null)[]) =>
    Array.from(new Set(vals.filter((v): v is string => !!v))).sort()
  const subjectOptions = uniq(worksheets.map((w) => w.subject))
  const yearOptions = uniq(worksheets.map((w) => w.yearGroup))
  const levelOptions = uniq(worksheets.map((w) => w.level))
  const tagOptions = uniq(worksheets.flatMap((w) => w.tags))

  const filtered = worksheets
    .filter((w) =>
      w.title.toLowerCase().includes(search.toLowerCase()) ||
      w.topic.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((w) => !favouritesOnly || w.isFavourite)
    .filter((w) => subjectFilter === 'all' || w.subject === subjectFilter)
    .filter((w) => yearFilter === 'all' || w.yearGroup === yearFilter)
    .filter((w) => levelFilter === 'all' || w.level === levelFilter)
    .filter((w) => tagFilter === 'all' || w.tags.includes(tagFilter))
    .sort((a, b) => compareWorksheets(a, b, sort))

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

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

  async function handleTagsSave() {
    if (!tagsTarget) return
    const tags = Array.from(
      new Set(tagsValue.split(',').map((t) => t.trim()).filter(Boolean)),
    ).slice(0, 20)
    try {
      await updateTags({ id: tagsTarget.id, tags })
      toast.success('Tags updated')
      setTagsTarget(null)
    } catch {
      toast.error('Could not update tags')
    }
  }

  function handleDelete(w: WorksheetSummary) {
    if (!confirm(`Delete "${w.title}"? This cannot be undone.`)) return
    deleteWorksheet(w.id, {
      onSuccess: () => toast.success('Worksheet deleted'),
      onError: () => toast.error('Delete failed'),
    })
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} worksheet${selected.size === 1 ? '' : 's'}? This cannot be undone.`)) return
    try {
      await Promise.all(Array.from(selected).map((id) => deleteWorksheetAsync(id)))
      toast.success('Worksheets deleted')
      setSelected(new Set())
    } catch {
      toast.error('Some worksheets could not be deleted')
    }
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim()
    if (!name) return
    try {
      await createFolder(name)
      toast.success('Folder created')
      setNewFolderOpen(false)
      setNewFolderName('')
    } catch {
      toast.error('Could not create folder')
    }
  }

  async function handleFolderRename() {
    if (!folderRenameTarget) return
    try {
      await renameFolder({ id: folderRenameTarget.id, name: folderRenameValue.trim() })
      toast.success('Folder renamed')
      setFolderRenameTarget(null)
    } catch {
      toast.error('Rename failed')
    }
  }

  function handleFolderDelete(f: WorksheetFolder) {
    if (!confirm(`Delete folder "${f.name}"? Worksheets inside will become unfiled.`)) return
    deleteFolder(f.id, {
      onSuccess: () => {
        toast.success('Folder deleted')
        if (activeFolder === f.id) setActiveFolder(undefined)
      },
      onError: () => toast.error('Delete failed'),
    })
  }

  function FolderButton({ id, label, icon }: { id: string | undefined; label: string; icon: React.ReactNode }) {
    const active = activeFolder === id
    return (
      <button
        onClick={() => { setActiveFolder(id); setSelected(new Set()) }}
        aria-pressed={active}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'
        }`}
      >
        {icon}
        <span className="truncate">{label}</span>
      </button>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Worksheets</h1>
        <Button asChild>
          <Link href="/worksheets/new"><Plus className="h-4 w-4 mr-2" /> New worksheet</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Folder sidebar */}
        <aside className="space-y-1">
          <FolderButton id={undefined} label="All worksheets" icon={<Layers className="h-4 w-4" />} />
          <FolderButton id="unfiled" label="Unfiled" icon={<Inbox className="h-4 w-4" />} />
          <button
            onClick={() => setFavouritesOnly((v) => !v)}
            aria-pressed={favouritesOnly}
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              favouritesOnly ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent'
            }`}
          >
            <Star className={`h-4 w-4 ${favouritesOnly ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            <span className="truncate">Favourites</span>
          </button>
          {folders.map((f) => (
            <div key={f.id} className="group flex items-center">
              <div className="flex-1 min-w-0">
                <FolderButton id={f.id} label={f.name} icon={<Folder className="h-4 w-4" />} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Folder actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => { setFolderRenameTarget(f); setFolderRenameValue(f.name) }}>
                    <Pencil className="h-4 w-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleFolderDelete(f)} className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setNewFolderOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" /> New folder
          </Button>
        </aside>

        {/* Main column */}
        <div>
          {isLoading ? (
            <CardGridSkeleton count={6} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" />
          ) : isError ? (
            <div className="text-center text-muted-foreground py-8">Failed to load worksheets. Please refresh.</div>
          ) : worksheets.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No worksheets here yet"
              description="Generate a worksheet to get started."
              action={<Button asChild><Link href="/worksheets/new">Generate worksheet</Link></Button>}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search title or topic"
                    className="pl-9"
                  />
                </div>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {(subjectOptions.length > 0 || yearOptions.length > 0 || levelOptions.length > 0 || tagOptions.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {subjectOptions.length > 0 && (
                    <FilterSelect label="subjects" value={subjectFilter} onChange={setSubjectFilter} options={subjectOptions} />
                  )}
                  {yearOptions.length > 0 && (
                    <FilterSelect label="years" value={yearFilter} onChange={setYearFilter} options={yearOptions} />
                  )}
                  {levelOptions.length > 0 && (
                    <FilterSelect label="levels" value={levelFilter} onChange={setLevelFilter} options={levelOptions} />
                  )}
                  {tagOptions.length > 0 && (
                    <FilterSelect label="tags" value={tagFilter} onChange={setTagFilter} options={tagOptions} />
                  )}
                </div>
              )}

              {selected.size > 0 && (
                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 mb-4 text-sm">
                  <span>{selected.size} selected</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={handleBulkDelete}>
                      <Trash className="h-4 w-4 mr-2" /> Delete selected
                    </Button>
                  </div>
                </div>
              )}

              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No worksheets match your search.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((w) => (
                    <WorksheetCard
                      key={w.id}
                      worksheet={w}
                      folders={folders}
                      selected={selected.has(w.id)}
                      onSelectChange={(checked) => toggleSelect(w.id, checked)}
                      onRename={() => { setRenameTarget(w); setRenameValue(w.title) }}
                      onShare={() => setShareTarget(w)}
                      onDelete={() => handleDelete(w)}
                      onDuplicate={() => duplicateWorksheet(w.id, {
                        onSuccess: () => toast.success('Worksheet duplicated'),
                        onError: () => toast.error('Duplicate failed'),
                      })}
                      onMove={(folderId) => moveWorksheet({ id: w.id, folderId }, {
                        onSuccess: () => toast.success('Worksheet moved'),
                        onError: () => toast.error('Move failed'),
                      })}
                      onToggleFavourite={() => toggleFavourite({ id: w.id, isFavourite: !w.isFavourite })}
                      onEditTags={() => { setTagsTarget(w); setTagsValue(w.tags.join(', ')) }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rename worksheet */}
      <Dialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename worksheet</DialogTitle></DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={200} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRenameConfirm} disabled={!renameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New folder */}
      <Dialog open={newFolderOpen} onOpenChange={(open) => { if (!open) { setNewFolderOpen(false); setNewFolderName('') } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            maxLength={100}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNewFolderOpen(false); setNewFolderName('') }}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename folder */}
      <Dialog open={!!folderRenameTarget} onOpenChange={(open) => !open && setFolderRenameTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename folder</DialogTitle></DialogHeader>
          <Input value={folderRenameValue} onChange={(e) => setFolderRenameValue(e.target.value)} maxLength={100} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleFolderRename} disabled={!folderRenameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit tags */}
      <Dialog open={!!tagsTarget} onOpenChange={(open) => !open && setTagsTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit tags</DialogTitle></DialogHeader>
          <Input
            value={tagsValue}
            onChange={(e) => setTagsValue(e.target.value)}
            placeholder="Comma-separated, e.g. revision, homework, term 1"
            onKeyDown={(e) => e.key === 'Enter' && handleTagsSave()}
          />
          <p className="text-xs text-muted-foreground">Separate tags with commas (max 20).</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagsTarget(null)}>Cancel</Button>
            <Button onClick={handleTagsSave}>Save</Button>
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
