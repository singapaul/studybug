'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { GeneratedWorksheet, SavedWorksheet, WorksheetSummary, QuestionType, MarkingMode, DifferentiationMode } from '@/types/worksheet'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw Object.assign(new Error(body.error ?? 'Request failed'), {
      status: res.status,
      code: body.code,
    })
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export interface GenerateInput {
  topic: string
  subject?: string
  yearGroup: string
  level: string
  learningObjectives?: string
  priorKnowledge?: string
  numQuestions?: number
  questionTypes: QuestionType[]
  markingMode: MarkingMode
  differentiation: DifferentiationMode
  pastedText?: string
  file?: File | null
}

export interface GenerateResult {
  worksheet: GeneratedWorksheet
  usedToday: number
  remainingToday: number
}

export function useGenerateWorksheet() {
  return useMutation<GenerateResult, Error & { code?: string; status?: number }, GenerateInput>({
    mutationFn: async (input) => {
      const form = new FormData()
      form.append('topic', input.topic)
      if (input.subject) form.append('subject', input.subject)
      form.append('yearGroup', input.yearGroup)
      form.append('level', input.level)
      if (input.learningObjectives) form.append('learningObjectives', input.learningObjectives)
      if (input.priorKnowledge) form.append('priorKnowledge', input.priorKnowledge)
      if (input.numQuestions !== undefined) form.append('numQuestions', String(input.numQuestions))
      form.append('questionTypes', input.questionTypes.join(','))
      form.append('markingMode', input.markingMode)
      form.append('differentiation', input.differentiation)
      if (input.pastedText) form.append('pastedText', input.pastedText)
      if (input.file) form.append('file', input.file)

      const res = await fetch('/api/worksheets/generate', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw Object.assign(new Error(body.error ?? 'Generation failed'), {
          status: res.status,
          code: body.code,
        })
      }
      return res.json()
    },
  })
}

export function useWorksheetUsage() {
  return useQuery({
    queryKey: ['worksheet-usage'],
    queryFn: () => apiFetch<{ usedToday: number; remainingToday: number; dailyLimit: number }>(
      '/api/worksheets/generate',
    ),
  })
}

export function useWorksheets() {
  return useQuery<WorksheetSummary[]>({
    queryKey: ['worksheets'],
    queryFn: async () => {
      const data = await apiFetch<{ worksheets: WorksheetSummary[] }>('/api/worksheets')
      return data.worksheets
    },
  })
}

export function useWorksheet(id: string) {
  return useQuery<SavedWorksheet>({
    queryKey: ['worksheets', id],
    queryFn: async () => {
      const data = await apiFetch<{ worksheet: SavedWorksheet }>(`/api/worksheets/${id}`)
      return data.worksheet
    },
    enabled: !!id,
  })
}

export interface SaveInput {
  title: string
  topic: string
  subject?: string
  yearGroup: string
  level: string
  content: GeneratedWorksheet
}

export function useSaveWorksheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: SaveInput) => {
      const data = await apiFetch<{ worksheet: SavedWorksheet }>('/api/worksheets', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      return data.worksheet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] })
    },
  })
}

export function useRenameWorksheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const data = await apiFetch<{ worksheet: SavedWorksheet }>(`/api/worksheets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      })
      return data.worksheet
    },
    onSuccess: (worksheet) => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] })
      queryClient.invalidateQueries({ queryKey: ['worksheets', worksheet.id] })
    },
  })
}

export function useDeleteWorksheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/worksheets/${id}`, { method: 'DELETE' })
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] })
    },
  })
}

export function useShareWorksheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const data = await apiFetch<{ shareToken: string }>(`/api/worksheets/${id}/share`, {
        method: 'POST',
      })
      return data.shareToken
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] })
    },
  })
}

export function useUnshareWorksheet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/worksheets/${id}/share`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worksheets'] })
    },
  })
}

export function useSharedWorksheet(token: string) {
  return useQuery<SavedWorksheet>({
    queryKey: ['shared-worksheet', token],
    queryFn: async () => {
      const res = await fetch(`/api/worksheets/share/${token}`, { credentials: 'include' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw Object.assign(new Error(body.error ?? 'Not found'), { status: res.status })
      }
      const data = (await res.json()) as { worksheet: SavedWorksheet }
      return data.worksheet
    },
    enabled: !!token,
  })
}
