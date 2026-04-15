'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { SubjectIcon } from '@/components/library/SubjectIcon'
import { useLibrarySubject } from '@/hooks/use-library'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function LibrarySubjectPage() {
  const params = useParams()
  const subjectSlug = params?.subject as string
  const { data: subject, isLoading, isError } = useLibrarySubject(subjectSlug)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !subject) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-3">Subject not found.</p>
        <Link href="/library" className="text-primary underline">
          Back to Library
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Revision Library
      </Link>

      {/* Subject hero */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0',
            subject.color,
          )}
        >
          <SubjectIcon name={subject.icon} className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{subject.name}</h1>
          <p className="text-muted-foreground">
            {subject.topics.length} {subject.topics.length === 1 ? 'topic' : 'topics'}
          </p>
        </div>
      </div>

      {subject.topics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No topics available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subject.topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/library/${subjectSlug}/${topic.slug}`}
              className="rounded-2xl border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <h3 className="font-semibold text-sm text-foreground mb-2">{topic.name}</h3>

              {topic.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {topic.description}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {topic.deck && (
                  <span className="text-xs text-muted-foreground">
                    {topic.deck.itemCount} items
                  </span>
                )}
                {topic.deck?.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
