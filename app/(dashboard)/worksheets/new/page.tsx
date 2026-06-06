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
import type { GeneratedWorksheet } from '@/types/worksheet'
import { takeWorksheetSeed, type WorksheetSeed } from '@/lib/worksheet-seed'

type Phase = 'form' | 'loading' | 'preview'

export default function NewWorksheetPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null)
  const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(null)
  const [editableTitle, setEditableTitle] = useState('')
  const [seed, setSeed] = useState<WorksheetSeed | null>(null)

  // Seeds are stashed in sessionStorage by "Create worksheet" entry points
  // (library decks / games). Read on the client to avoid SSR hydration issues.
  useEffect(() => {
    setSeed(takeWorksheetSeed())
  }, [])

  const { mutateAsync: generate, isPending: isGenerating } = useGenerateWorksheet()
  const { mutateAsync: save, isPending: isSaving } = useSaveWorksheet()

  async function handleGenerate(input: GenerateInput) {
    setLastInput(input)
    setPhase('loading')
    try {
      const result = await generate(input)
      setWorksheet(result.worksheet)
      setEditableTitle(result.worksheet.title)
      setPhase('preview')
    } catch (err: unknown) {
      const e = err as { code?: string; message: string; status?: number }
      if (e.code === 'PRO_REQUIRED') toast.error('Pro plan required')
      else if (e.code === 'GENERATION_LIMIT_REACHED') toast.error('Daily limit reached — try again tomorrow.')
      else toast.error(e.message || 'Generation failed')
      setPhase('form')
    }
  }

  async function handleRegenerate() {
    if (!lastInput) return
    setPhase('loading')
    try {
      const result = await generate(lastInput)
      setWorksheet(result.worksheet)
      setEditableTitle(result.worksheet.title)
      setPhase('preview')
    } catch (err: unknown) {
      const e = err as { message: string }
      toast.error(e.message || 'Regeneration failed')
      setPhase('preview')
    }
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

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push('/worksheets')}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">
          {phase === 'preview' ? 'Review worksheet' : 'New worksheet'}
        </h1>
      </div>

      {phase === 'form' && (
        <>
          {seed && (
            <p className="mb-4 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Pre-filled from <span className="font-medium text-foreground">{seed.topic}</span>. Review and adjust, then generate.
            </p>
          )}
          <WorksheetForm
            key={seed ? 'seeded' : 'empty'}
            isGenerating={isGenerating}
            onSubmit={handleGenerate}
            initialValues={seed ?? undefined}
          />
        </>
      )}

      {phase === 'loading' && (
        <div className="rounded-xl border p-12 flex flex-col items-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="font-semibold">Generating your worksheet...</p>
          <p className="text-sm text-muted-foreground mt-1">This usually takes 10–20 seconds.</p>
        </div>
      )}

      {phase === 'preview' && worksheet && (
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
            <Button variant="outline" onClick={handleRegenerate} disabled={isGenerating || isSaving}>
              <RefreshCw className="h-4 w-4 mr-2" /> Regenerate
            </Button>
            <Button variant="ghost" onClick={handleDiscard} disabled={isGenerating || isSaving}>
              <X className="h-4 w-4 mr-2" /> Discard
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !editableTitle.trim()}>
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
