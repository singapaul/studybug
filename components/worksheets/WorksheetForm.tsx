'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  YEAR_GROUPS, KEY_STAGES, QUESTION_TYPE_OPTIONS, MARKING_MODE_OPTIONS, DIFFERENTIATION_OPTIONS, EXAM_BOARD_OPTIONS,
} from '@/lib/worksheet-options'
import { UPLOAD_ACCEPT_ATTR } from '@/lib/extract-source'
import type { QuestionType, MarkingMode, DifferentiationMode, ExamBoard } from '@/types/worksheet'
import type { GenerateInput } from '@/hooks/use-worksheets'

export interface WorksheetFormInitialValues {
  topic?: string
  subject?: string
  yearGroup?: string
  level?: string
  numQuestions?: number
  questionTypes?: QuestionType[]
  markingMode?: MarkingMode
  differentiation?: DifferentiationMode
  examBoard?: ExamBoard
  pastedText?: string
}

interface WorksheetFormProps {
  isGenerating: boolean
  onSubmit: (input: GenerateInput) => void
  initialValues?: WorksheetFormInitialValues
  /** Remix mode: question count/types come from the blueprint, so lock them and
   *  hide the source-material inputs. */
  lockStructure?: boolean
  submitLabel?: string
}

export function WorksheetForm({ isGenerating, onSubmit, initialValues, lockStructure = false, submitLabel }: WorksheetFormProps) {
  const [topic, setTopic] = useState(initialValues?.topic ?? '')
  const [subject, setSubject] = useState(initialValues?.subject ?? '')
  const [yearGroup, setYearGroup] = useState<string>(initialValues?.yearGroup ?? 'Year 8')
  const [level, setLevel] = useState<string>(initialValues?.level ?? 'KS3')
  const [learningObjectives, setLearningObjectives] = useState('')
  const [priorKnowledge, setPriorKnowledge] = useState('')
  const [numQuestions, setNumQuestions] = useState(initialValues?.numQuestions ?? 8)
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(initialValues?.questionTypes ?? ['shortAnswer'])
  const [markingMode, setMarkingMode] = useState<MarkingMode>(initialValues?.markingMode ?? 'markSchemeWithPoints')
  const [differentiation, setDifferentiation] = useState<DifferentiationMode>(initialValues?.differentiation ?? 'mixedAbility')
  const [examBoard, setExamBoard] = useState<ExamBoard>(initialValues?.examBoard ?? 'none')
  const [pastedText, setPastedText] = useState(initialValues?.pastedText ?? '')
  const [file, setFile] = useState<File | null>(null)

  function toggleType(t: QuestionType) {
    setQuestionTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!topic.trim()) {
      toast.error('Please enter a topic')
      return
    }
    if (questionTypes.length === 0) {
      toast.error('Pick at least one question type')
      return
    }
    onSubmit({
      topic: topic.trim(),
      subject: subject.trim() || undefined,
      yearGroup,
      level,
      learningObjectives: learningObjectives.trim() || undefined,
      priorKnowledge: priorKnowledge.trim() || undefined,
      numQuestions,
      questionTypes,
      markingMode,
      differentiation,
      examBoard,
      pastedText: pastedText.trim() || undefined,
      file,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="topic">Topic <span className="text-destructive">*</span></Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photosynthesis, Quadratic equations, Macbeth Act 1"
            disabled={isGenerating}
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Biology, Maths, English"
            disabled={isGenerating}
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-0">
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="year">Year group <span className="text-destructive">*</span></Label>
            <Select value={yearGroup} onValueChange={setYearGroup} disabled={isGenerating}>
              <SelectTrigger id="year" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {YEAR_GROUPS.map((y) => (<SelectItem key={y} value={y}>{y}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-0">
            <Label htmlFor="level">Level <span className="text-destructive">*</span></Label>
            <Select value={level} onValueChange={setLevel} disabled={isGenerating}>
              <SelectTrigger id="level" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {KEY_STAGES.map((k) => (<SelectItem key={k} value={k}>{k}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="objectives">Learning objectives</Label>
          <Textarea
            id="objectives"
            value={learningObjectives}
            onChange={(e) => setLearningObjectives(e.target.value)}
            placeholder="What should students be able to do by the end?"
            rows={3}
            disabled={isGenerating}
            maxLength={2000}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="prior">Prior knowledge assumed</Label>
          <Textarea
            id="prior"
            value={priorKnowledge}
            onChange={(e) => setPriorKnowledge(e.target.value)}
            placeholder="What students already know."
            rows={2}
            disabled={isGenerating}
            maxLength={2000}
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Question types <span className="text-destructive">*</span></legend>
        {lockStructure && (
          <p className="text-xs text-muted-foreground">
            Locked to match the uploaded worksheet — the remix keeps the same question styles and marks.
          </p>
        )}
        <div className="grid gap-2 sm:grid-cols-2">
          {QUESTION_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-2 rounded-md border p-3 ${lockStructure ? 'opacity-60' : 'cursor-pointer hover:bg-accent'}`}
            >
              <Checkbox
                checked={questionTypes.includes(opt.value)}
                onCheckedChange={() => toggleType(opt.value)}
                disabled={isGenerating || lockStructure}
              />
              <div>
                <div className="text-sm font-medium">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="num">Approx. # of questions</Label>
          <Input
            id="num"
            type="number"
            min={3}
            max={20}
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value, 10) || 8)}
            disabled={isGenerating || lockStructure}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="marking">Marking style</Label>
          <Select value={markingMode} onValueChange={(v) => setMarkingMode(v as MarkingMode)} disabled={isGenerating}>
            <SelectTrigger id="marking" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MARKING_MODE_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="diff">Differentiation</Label>
          <Select value={differentiation} onValueChange={(v) => setDifferentiation(v as DifferentiationMode)} disabled={isGenerating}>
            <SelectTrigger id="diff" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DIFFERENTIATION_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="board">Exam board</Label>
          <Select value={examBoard} onValueChange={(v) => setExamBoard(v as ExamBoard)} disabled={isGenerating}>
            <SelectTrigger id="board" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EXAM_BOARD_OPTIONS.map((b) => (
                <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!lockStructure && (
        <div className="space-y-2">
          <Label htmlFor="paste">Source material (optional)</Label>
          <Textarea
            id="paste"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste lesson notes, textbook extract, or scheme of work. The AI will only use this content."
            rows={4}
            disabled={isGenerating}
            maxLength={50000}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="file"
              type="file"
              accept={UPLOAD_ACCEPT_ATTR}
              className="hidden"
              disabled={isGenerating}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button type="button" variant="outline" size="sm" asChild>
              <label htmlFor="file" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Attach PDF, Word or .txt
              </label>
            </Button>
            {file && (
              <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate max-w-[14rem]">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex">
        <Button type="submit" disabled={isGenerating} className="w-full sm:ml-auto sm:w-auto">
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            submitLabel ?? 'Generate worksheet'
          )}
        </Button>
      </div>
    </form>
  )
}
