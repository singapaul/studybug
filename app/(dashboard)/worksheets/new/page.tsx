'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Eye, FileText, Loader2, Pencil, RefreshCw, Save, Sparkles, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { WorksheetForm, type WorksheetFormInitialValues } from '@/components/worksheets/WorksheetForm'
import { WorksheetPreview } from '@/components/worksheets/WorksheetPreview'
import { WorksheetEditor } from '@/components/worksheets/WorksheetEditor'
import {
  useGenerateWorksheet,
  useRemixExtract,
  useSaveWorksheet,
  type GenerateInput,
} from '@/hooks/use-worksheets'
import { useGenerationJob } from '@/hooks/use-generation-job'
import {
  blueprintQuestionCount,
  blueprintQuestionTypes,
  type Blueprint,
  type GeneratedWorksheet,
} from '@/types/worksheet'
import { YEAR_GROUPS, KEY_STAGES } from '@/lib/worksheet-options'
import { UPLOAD_ACCEPT_ATTR } from '@/lib/extract-source'
import { takeWorksheetSeed, type WorksheetSeed } from '@/lib/worksheet-seed'

type Phase = 'form' | 'loading' | 'preview' | 'regenerating'
type Mode = 'blank' | 'remix'

/** Derive prefilled form values from an extracted blueprint, coercing year/level
 *  to values the form's selects recognise. */
function blueprintToPrefill(bp: Blueprint): WorksheetFormInitialValues {
  const yearGroup = (YEAR_GROUPS as readonly string[]).includes(bp.yearGroup) ? bp.yearGroup : 'Year 8'
  const level = (KEY_STAGES as readonly string[]).includes(bp.level) ? bp.level : 'KS3'
  const types = blueprintQuestionTypes(bp)
  return {
    topic: bp.topic || '',
    subject: bp.subject || '',
    yearGroup,
    level,
    numQuestions: blueprintQuestionCount(bp) || 8,
    questionTypes: types.length ? types : ['shortAnswer'],
    markingMode: bp.markingMode ?? 'markSchemeWithPoints',
    examBoard: bp.examBoard ?? 'none',
  }
}

export default function NewWorksheetPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('form')
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null)
  const [worksheet, setWorksheet] = useState<GeneratedWorksheet | null>(null)
  const [editableTitle, setEditableTitle] = useState('')
  const [seed, setSeed] = useState<WorksheetSeed | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [reviewMode, setReviewMode] = useState<'preview' | 'edit'>('preview')
  const [mode, setMode] = useState<Mode>('blank')
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [extractJobId, setExtractJobId] = useState<string | null>(null)

  // Seeds are stashed in sessionStorage by "Create worksheet" entry points
  // (library decks / games). Read on the client to avoid SSR hydration issues.
  useEffect(() => {
    setSeed(takeWorksheetSeed())
  }, [])

  const { mutateAsync: generate } = useGenerateWorksheet()
  const { mutateAsync: extract, isPending: isExtractStarting } = useRemixExtract()
  const { mutateAsync: save, isPending: isSaving } = useSaveWorksheet()
  const job = useGenerationJob<GeneratedWorksheet>(jobId)
  const extractJob = useGenerationJob<Blueprint>(extractJobId)
  const isExtracting = isExtractStarting || !!extractJobId

  // React to the remix extraction (pass 1) completing: prefill + lock the form.
  useEffect(() => {
    if (!extractJobId) return
    const data = extractJob.data
    if (data?.status === 'complete' && data.result) {
      if (blueprintQuestionCount(data.result) === 0) {
        toast.error("Couldn't detect any questions in that upload. Try a clearer worksheet or paste the text.")
        setExtractJobId(null)
        return
      }
      setBlueprint(data.result)
      setExtractJobId(null)
    } else if (data?.status === 'failed') {
      toast.error(data.error || 'Could not analyse the upload. Please try again.')
      setExtractJobId(null)
    } else if (extractJob.isError) {
      toast.error('Lost connection while analysing the upload. Please try again.')
      setExtractJobId(null)
    }
  }, [extractJobId, extractJob.data, extractJob.isError])

  // React to background-job status transitions.
  useEffect(() => {
    if (!jobId) return
    const data = job.data
    if (data?.status === 'complete' && data.result) {
      setWorksheet(data.result)
      setEditableTitle(data.result.title)
      setReviewMode('preview')
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
    // Remix: the blueprint drives structure; numQuestions is ignored server-side
    // but must satisfy the shared schema (max 20), so clamp the carried value.
    const finalInput: GenerateInput = blueprint
      ? { ...input, blueprint, numQuestions: Math.min(input.numQuestions ?? 8, 20) }
      : input
    void startGeneration(finalInput, 'loading')
  }

  async function handleAnalyse(file: File | null, pastedText: string) {
    if (!file && !pastedText.trim()) {
      toast.error('Upload a worksheet or paste its text to remix.')
      return
    }
    try {
      const { jobId: newJobId } = await extract({ file, pastedText: pastedText.trim() || undefined })
      setExtractJobId(newJobId)
    } catch (err: unknown) {
      const e = err as { code?: string; message: string }
      if (e.code === 'PRO_REQUIRED') toast.error('Pro plan required')
      else toast.error(e.message || 'Could not analyse the upload')
    }
  }

  function handleModeChange(next: Mode) {
    setMode(next)
    if (next === 'blank') setBlueprint(null)
  }

  function handleRegenerate() {
    if (!lastInput) return
    void startGeneration(lastInput, 'regenerating')
  }

  function handleDiscard() {
    setWorksheet(null)
    setLastInput(null)
    setEditableTitle('')
    setReviewMode('preview')
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
          {phase === 'form' && !seed && (
            <div className="mb-4 inline-flex rounded-md border p-0.5" role="tablist" aria-label="Worksheet source">
              <Button
                variant={mode === 'blank' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('blank')}
              >
                <Sparkles className="h-4 w-4 mr-2" /> Start blank
              </Button>
              <Button
                variant={mode === 'remix' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('remix')}
              >
                <FileText className="h-4 w-4 mr-2" /> Remix an upload
              </Button>
            </div>
          )}

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

          {/* Blank mode (default): free-form generation. */}
          {mode === 'blank' && (
            <>
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

          {/* Remix mode, pass 1: upload/paste a worksheet to analyse. */}
          {mode === 'remix' && phase === 'form' && !blueprint && (
            <RemixUpload onAnalyse={handleAnalyse} isExtracting={isExtracting} />
          )}

          {/* Remix mode, pass 2: prefilled + structure-locked form (also shown while generating). */}
          {mode === 'remix' && blueprint && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                <span>
                  Remixing your upload — <span className="font-medium text-foreground">{blueprintQuestionCount(blueprint)} questions</span> across{' '}
                  {blueprint.sections.length} section{blueprint.sections.length === 1 ? '' : 's'}. Structure is locked; adjust topic, year or differentiation, then generate.
                </span>
                <Button variant="ghost" size="sm" onClick={() => setBlueprint(null)} disabled={phase === 'loading'}>
                  <X className="h-4 w-4 mr-2" /> Use a different file
                </Button>
              </div>
              <WorksheetForm
                key={`remix-${blueprintQuestionCount(blueprint)}-${blueprint.topic}`}
                isGenerating={phase === 'loading'}
                onSubmit={handleGenerate}
                initialValues={blueprintToPrefill(blueprint)}
                lockStructure
                submitLabel="Generate remix"
              />
            </>
          )}
        </>
      )}

      {showPreview && worksheet && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 print:hidden">
            {reviewMode === 'preview' && (
              <div className="flex-1 space-y-1.5 min-w-[12rem]">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input
                  id="title"
                  value={editableTitle}
                  onChange={(e) => {
                    setEditableTitle(e.target.value)
                    setWorksheet((w) => (w ? { ...w, title: e.target.value } : w))
                  }}
                  maxLength={200}
                />
              </div>
            )}
            <div className={reviewMode === 'edit' ? 'flex-1' : ''}>
              <div className="inline-flex rounded-md border p-0.5" role="tablist" aria-label="Review mode">
                <Button
                  variant={reviewMode === 'preview' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setReviewMode('preview')}
                  disabled={phase === 'regenerating'}
                >
                  <Eye className="h-4 w-4 mr-2" /> Preview
                </Button>
                <Button
                  variant={reviewMode === 'edit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setReviewMode('edit')}
                  disabled={phase === 'regenerating'}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
              </div>
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

          {reviewMode === 'edit' ? (
            <WorksheetEditor
              initial={worksheet}
              worksheetId={null}
              embedded
              onChange={(c) => {
                setWorksheet(c)
                setEditableTitle(c.title)
              }}
            />
          ) : (
            <WorksheetPreview worksheet={{ ...worksheet, title: editableTitle || worksheet.title }} />
          )}
        </div>
      )}
    </div>
  )
}

/** Remix pass 1 UI: attach a worksheet (PDF / Word / text) or paste it, then analyse. */
function RemixUpload({
  onAnalyse,
  isExtracting,
}: {
  onAnalyse: (file: File | null, pastedText: string) => void
  isExtracting: boolean
}) {
  const [file, setFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')

  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div>
        <h2 className="font-semibold">Remix an existing worksheet</h2>
        <p className="text-sm text-muted-foreground">
          Upload a worksheet or test. We keep its structure — question styles, marks and skills assessed —
          and generate a fresh set of questions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          id="remix-file"
          type="file"
          accept={UPLOAD_ACCEPT_ATTR}
          className="hidden"
          disabled={isExtracting}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="outline" size="sm" asChild>
          <label htmlFor="remix-file" className="cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Attach PDF, Word or .txt
          </label>
        </Button>
        {file && (
          <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate max-w-[14rem]">{file.name}</span>
            <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="shrink-0" disabled={isExtracting}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="remix-paste">…or paste the worksheet text</Label>
        <Textarea
          id="remix-paste"
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste the questions from an existing worksheet or test."
          rows={5}
          disabled={isExtracting}
          maxLength={50000}
        />
      </div>

      <div className="flex">
        <Button
          type="button"
          className="w-full sm:ml-auto sm:w-auto"
          disabled={isExtracting || (!file && !pastedText.trim())}
          onClick={() => onAnalyse(file, pastedText)}
        >
          {isExtracting ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analysing…</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Analyse worksheet</>
          )}
        </Button>
      </div>
    </div>
  )
}
