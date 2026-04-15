'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GameType, Game } from '@/types/game'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LibrarySubjectSummary {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  isFree: boolean
  sortOrder: number
  topicCount: number
}

export interface LibraryTopicSummary {
  id: string
  name: string
  slug: string
  description: string | null
  sortOrder: number
  deck: { id: string; itemCount: number; tags: string[] } | null
}

export interface LibrarySubjectWithTopics {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  isFree: boolean
  topics: LibraryTopicSummary[]
}

export interface LibraryItem {
  term: string
  definition: string
  sentence?: string
}

export interface LibraryDeck {
  id: string
  name: string
  description: string | null
  items: LibraryItem[]
  tags: string[]
  itemCount: number
}

export interface LibraryTopicDetail {
  id: string
  name: string
  slug: string
  description: string | null
}

export interface LibrarySubjectDetail {
  id: string
  name: string
  slug: string
  icon: string
  color: string
  isFree: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const error = Object.assign(new Error(body.error ?? 'Request failed'), {
      status: res.status,
      code: body.code,
    })
    throw error
  }
  return res.json()
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useLibrarySubjects() {
  return useQuery<LibrarySubjectSummary[]>({
    queryKey: ['library'],
    queryFn: async () => {
      const data = await apiFetch<{ subjects: LibrarySubjectSummary[] }>('/api/library')
      return data.subjects
    },
  })
}

export function useLibrarySubject(slug: string) {
  return useQuery<LibrarySubjectWithTopics>({
    queryKey: ['library', slug],
    queryFn: async () => {
      const data = await apiFetch<{ subject: LibrarySubjectWithTopics }>(
        `/api/library/${slug}`,
      )
      return data.subject
    },
    enabled: !!slug,
  })
}

export function useLibraryTopic(subjectSlug: string, topicSlug: string) {
  return useQuery<{
    subject: LibrarySubjectDetail
    topic: LibraryTopicDetail
    deck: LibraryDeck | null
  }>({
    queryKey: ['library', subjectSlug, topicSlug],
    queryFn: async () => {
      return apiFetch(`/api/library/${subjectSlug}/${topicSlug}`)
    },
    enabled: !!subjectSlug && !!topicSlug,
  })
}

export function useCloneLibraryDeck() {
  const queryClient = useQueryClient()

  return useMutation<
    Game,
    Error & { code?: string },
    {
      subjectSlug: string
      topicSlug: string
      gameType: GameType
      gameName?: string
    }
  >({
    mutationFn: async ({ subjectSlug, topicSlug, gameType, gameName }) => {
      const data = await apiFetch<{ game: Game }>(
        `/api/library/${subjectSlug}/${topicSlug}/clone`,
        {
          method: 'POST',
          body: JSON.stringify({ gameType, gameName }),
        },
      )
      return data.game
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}
