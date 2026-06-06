'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, BookOpen, Search } from 'lucide-react'
import { SubjectIcon } from '@/components/library/SubjectIcon'
import { useLibrarySubjects } from '@/hooks/use-library'
import { usePlan } from '@/hooks/use-plan'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CardGridSkeleton } from '@/components/skeletons'
import { filterLibrarySubjects, type AccessFilter } from '@/lib/library-filter'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function LibraryPage() {
  const { data: subjects, isLoading, isError } = useLibrarySubjects()
  const { isPro } = usePlan()
  const router = useRouter()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [access, setAccess] = useState<AccessFilter>('all')

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="mb-8 space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Revision Library</h1>
        </div>
        <CardGridSkeleton count={8} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" />
      </div>
    )
  }

  if (isError || !subjects) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p className="text-muted-foreground">Failed to load library. Please refresh.</p>
      </div>
    )
  }

  const filtered = filterLibrarySubjects(subjects, query, access)

  const handleSubjectClick = (subject: { slug: string; isFree: boolean }) => {
    if (!subject.isFree && !isPro) {
      setUpgradeOpen(true)
      return
    }
    router.push(`/library/${subject.slug}`)
  }

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = (await res.json()) as { url?: string }
      if (data.url) window.location.href = data.url
    } catch {
      // ignore
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">Revision Library</h1>
        <p className="text-muted-foreground">
          Pre-built revision decks across popular GCSE subjects. Play in place or clone to your library.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No subjects available yet.</p>
        </div>
      ) : (
        <>
          {/* Search + access filter */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects…"
                className="pl-9"
                aria-label="Search subjects"
              />
            </div>
            <div className="inline-flex rounded-lg border p-1" role="group" aria-label="Access filter">
              {(['all', 'free', 'pro'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAccess(a)}
                  aria-pressed={access === a}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    access === a ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No subjects match your search.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((subject) => {
            const locked = !subject.isFree && !isPro
            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className={cn(
                  'group relative rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  locked && 'opacity-80',
                )}
              >
                {locked && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="text-xs gap-1 pr-1.5">
                      <Lock className="h-2.5 w-2.5" />
                      Pro
                    </Badge>
                  </div>
                )}

                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110',
                    subject.color,
                  )}
                >
                  <SubjectIcon name={subject.icon} className="h-5 w-5 text-white" />
                </div>

                <h3 className="font-semibold text-sm text-foreground mb-1">{subject.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {subject.topicCount} {subject.topicCount === 1 ? 'topic' : 'topics'}
                </p>

                {subject.isFree && (
                  <span className="mt-2 inline-block text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </button>
            )
              })}
            </div>
          )}
        </>
      )}

      {/* Upgrade modal for locked subjects */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock Pro subjects</DialogTitle>
            <DialogDescription>
              Upgrade to Pro to access all subjects in the revision library.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Button onClick={handleUpgrade} className="w-full">
              Upgrade to Pro
            </Button>
            <Button variant="ghost" onClick={() => setUpgradeOpen(false)} className="w-full">
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
