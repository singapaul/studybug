'use client'

import { useQuery } from '@tanstack/react-query'

export type GenerationStatus = 'pending' | 'running' | 'complete' | 'failed'

export interface GenerationJobState<T> {
  kind: 'worksheet' | 'game' | 'remix-extract' | 'question-regen' | 'questions-add'
  status: GenerationStatus
  result?: T
  error?: string
}

/**
 * Poll a GenerationJob until it reaches a terminal state. Pass `null` to
 * disable (e.g. before a job exists). Stops polling once complete/failed.
 */
export function useGenerationJob<T>(jobId: string | null) {
  return useQuery<GenerationJobState<T>>({
    queryKey: ['generation-job', jobId],
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'complete' || status === 'failed' ? false : 2000
    },
    gcTime: 0,
    queryFn: async () => {
      const res = await fetch(`/api/generation-jobs/${jobId}`, { credentials: 'include' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to check generation status')
      }
      return res.json()
    },
  })
}
