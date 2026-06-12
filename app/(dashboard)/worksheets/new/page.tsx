'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, RefreshCw, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { WorksheetForm } from '@/components/worksheets/WorksheetForm'
import { WorksheetPreview } from '@/components/worksheets/WorksheetPreview'
import {
  useGenerateWorksheet,
  useSaveWorksheet,
  type GenerateInput,
} from '@/hooks/use-worksheets'
import { useGenerationJob } from '@/hooks/use-generation-job'
import type { GeneratedWorksheet } from '@/types/worksheet'
import { takeWorksheetSeed, type WorksheetSeed } from '@/lib/worksheet-seed'

type Phase = 'form' | 'loading' | 'preview' | 'regenerating'

export default function NewWorksheetPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null)
  const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(null)
  const [editableTitle, setEditableTitle] = useState('')
  const [seed, setSeed] = useState<WorksheetSeed | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)

  // Seeds are stashed in sessionStorage by "Create worksheet" entry points
  // (library decks / games). Read on the client to avoid SSR hydration issues.
  useEffect(() => {
    setSeed(takeWorksheetSeed())
  }, [])

  const { mutateAsync: generate } = useGenerateWorksheet()
  const { mutateAsync: save, isPending: isSaving } = useSaveWorksheet()
  const job = useGenerationJob<GeneratedWorksheet>(jobId)

  // React to background-job status transitions.
  useEffect(() => {
    if (!jobId) return
    const data = job.data
    if (data?.status === 'complete' && data.result) {
      setWorksheet(data.result)
      setEditableTitle(data.result.title)
      setPhase('preview')
      setJobId(null)
    } else if (data?.status === 'failed') {
      toast.error(data.error || 'Generation failed. Please try again.')
      setPhase((p) => (p === 'regenerating' ? 'preview' : 'form'))
      setJobId(null)
    } else if (job.isError) {
      toast.error('Lost connection while generating. Please try again.')
      setPhase((p) => (p === 'regenerating' ? 'preview' : 'form'))
      setJobId(null)
    }
  }, [jobId, job.data, job.isError])

  async function startGeneration(input: GenerateInput, nextPhase: 'loading' | 'regenerating') {
    setLastInput(input)
    setPhase(nextPhase)
    try {
      const { jobId: newJobId } = await generate(input)
      setJobId(newJobId)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'PRO_REQUIRED') toast.error('Pro plan required')
      else if (e.code === 'GENERATION_LIMIT_REACHED') toast.error('Daily limit reached — try again tomorrow.')
      else toast.error(e.message || 'Generation failed')
      setPhase(nextPhase === 'regenerating' ? 'preview' : 'form')
    }
  }

  function handleGenerate(input: GenerateInput) {
    void startGeneration(input, 'loading')
  }

  function handleRegenerate() {
    if (!lastInput) return
    void startGeneration(lastInput, 'regenerating')
  }

  function handleDiscard() {
    setWorksheet(null)
    setLastInput(null)
    setEditableTitle('')
    setPhase('form')
  }

  async function handleSave() {
    if (!worksheet || !lastInput) return
    try {
      const saved = await save({
        title: editableTitle.trim() || worksheet.title,
        topic: lastInput.topic,
        subject: lastInput.subject,
        yearGroup: lastInput.yearGroup,
        level: lastInput.level,
        content: { ...worksheet, title: editableTitle.trim() || worksheet.title },
      })
      toast.success('Worksheet saved')
      router.push(`/worksheets/${saved.id}`)
    } catch (err: unknown) {
      const e = err as { message: string }
      toast.error(e.message || 'Save failed')
    }
  }

  const showForm = phase === 'form' || phase === 'loading'
  const showPreview = phase === 'preview' || phase === 'regenerating'

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/worksheets')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">
          {showPreview ? 'Review worksheet' : 'New worksheet'}
        </h1>
      </div>

      {showForm && (
        <>
          {phase === 'loading' && (
            <div className="mb-4 rounded-xl border p-6 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-semibold">Generating your worksheet...</p>
                <p className="text-sm text-muted-foreground">
                  This usually takes 10–20 seconds. Your details are kept if anything goes wrong.
                </p>
              </div>
            </div>
          )}
          {seed && phase === 'form' && (
            <p className="mb-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Pre-filled from <span className="font-medium text-foreground">{seed.topic}</span>. Review and adjust, then generate.
            </p>
          )}
          <WorksheetForm
            key={seed ? 'seeded' : 'empty'}
            isGenerating={phase === 'loading'}
            onSubmit={handleGenerate}
            initialValues={seed ?? undefined}
          />
        </>
      )}

      {showPreview && worksheet && (
        <div className="space-y-4">
          <div className="flex items-end gap-3 print:hidden">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                maxLength={200}
              />
            </div>
            <Button variant="outline" onClick={handleRegenerate} disabled={phase === 'regenerating' || isSaving}>
              {phase === 'regenerating'
                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                : <RefreshCw className="h-4 w-4 mr-2" />}
              Regenerate
            </Button>
            <Button variant="ghost" onClick={handleDiscard} disabled={phase === 'regenerating' || isSaving}>
              <X className="h-4 w-4 mr-2" /> Discard
            </Button>
            <Button onClick={handleSave} disabled={isSaving || phase === 'regenerating' || !editableTitle.trim()}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>

          <WorksheetPreview worksheet={{ ...worksheet, title: editableTitle || worksheet.title }} />
        </div>
      )}
    </div>
  )
}
