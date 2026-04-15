'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, BookOpen } from 'lucide-react'
import { SubjectIcon } from '@/components/library/SubjectIcon'
import { useLibrarySubjects } from '@/hooks/use-library'
import { usePlan } from '@/hooks/use-plan'
import { Badge } from '@/components/ui/badge'
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !subjects) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Failed to load library. Please refresh.</p>
      </div>
    )
  }

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Revision Library</h1>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subjects.map((subject) => {
            const locked = !subject.isFree && !isPro
            return (
              <button
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className={cn(
                  'relative rounded-2xl border bg-card p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
                    'w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm',
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
                  <span className="mt-2 inline-block text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    Free
                  </span>
                )}
              </button>
            )
          })}
        </div>
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
