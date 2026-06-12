'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  YEAR_GROUPS, KEY_STAGES, QUESTION_TYPE_OPTIONS, EXAM_BOARD_OPTIONS,
} from '@/lib/worksheet-options'
import { DIFFICULTY_TIERS } from '@/types/worksheet'
import type {
  GeneratedWorksheet, Question, QuestionType, DifficultyTier, ExamBoard,
} from '@/types/worksheet'

interface WorksheetEditorProps {
  initial: GeneratedWorksheet
  isSaving: boolean
  onSave: (content: GeneratedWorksheet) => void
  onCancel: () => void
}

/** Move an array item from one index to another, no-op if out of bounds. */
function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr
  const copy = [...arr]
  const [item] = copy.splice(from, 1)
  copy.splice(to, 0, item)
  return copy
}

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : `q${Math.floor(Math.random() * 1e6)}`
}

function blankQuestion(type: QuestionType): Question {
  const base = { id: newId(), type, text: '', marks: 1, answer: '', difficulty: 'core' as DifficultyTier }
  switch (type) {
    case 'multipleChoice':
      return { ...base, options: ['', ''] }
    case 'matching':
      return { ...base, pairs: [{ left: '', right: '' }, { left: '', right: '' }] }
    case 'ordering':
      return { ...base, items: ['', ''] }
    case 'tableCompletion':
      return { ...base, table: { headers: ['', ''], rows: [['', '']] } }
    default:
      return base
  }
}

/** Preserve shared fields when a question changes type; reset type-specific fields. */
function changeType(q: Question, type: QuestionType): Question {
  const fresh = blankQuestion(type)
  return { ...fresh, id: q.id, text: q.text, marks: q.marks, answer: q.answer, difficulty: q.difficulty }
}

export function WorksheetEditor({ initial, isSaving, onSave, onCancel }: WorksheetEditorProps) {
  const [content, setContent] = useState<GeneratedWorksheet>(initial)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function patch(fields: Partial<GeneratedWorksheet>) {
    setContent((c) => ({ ...c, ...fields }))
  }

  function handleQuestionDragEnd(si: number, e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const questions = content.sections[si].questions
    const oldIndex = questions.findIndex((q) => q.id === active.id)
    const newIndex = questions.findIndex((q) => q.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    updateSection(si, { questions: arrayMove(questions, oldIndex, newIndex) })
  }

  function updateSection(si: number, fields: Partial<GeneratedWorksheet['sections'][number]>) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s, i) => (i === si ? { ...s, ...fields } : s)),
    }))
  }

  function updateQuestion(si: number, qi: number, q: Question) {
    setContent((c) => ({
      ...c,
      sections: c.sections.map((s, i) =>
        i === si ? { ...s, questions: s.questions.map((x, j) => (j === qi ? q : x)) } : s,
      ),
    }))
  }

  const totalMarks = content.sections.reduce(
    (sum, s) => sum + s.questions.reduce((a, q) => a + (Number(q.marks) || 0), 0),
    0,
  )

  return (
    <div className="space-y-6">
      {/* Worksheet-level fields */}
      <section className="space-y-4 rounded-lg border p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ws-title">Title</Label>
            <Input id="ws-title" value={content.title} onChange={(e) => patch({ title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-topic">Topic</Label>
            <Input id="ws-topic" value={content.topic} onChange={(e) => patch({ topic: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-subject">Subject</Label>
            <Input id="ws-subject" value={content.subject} onChange={(e) => patch({ subject: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-year">Year group</Label>
            <Select value={content.yearGroup} onValueChange={(v) => patch({ yearGroup: v })}>
              <SelectTrigger id="ws-year" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {YEAR_GROUPS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-level">Level</Label>
            <Select value={content.level} onValueChange={(v) => patch({ level: v })}>
              <SelectTrigger id="ws-level" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {KEY_STAGES.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ws-board">Exam board</Label>
            <Select
              value={content.examBoard ?? 'none'}
              onValueChange={(v) => patch({ examBoard: v as ExamBoard })}
            >
              <SelectTrigger id="ws-board" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXAM_BOARD_OPTIONS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Total marks: {totalMarks} (recalculated on save)</p>
      </section>

      {/* Vocabulary */}
      <VocabEditor
        items={content.vocabularyBox}
        onChange={(vocabularyBox) => patch({ vocabularyBox })}
      />

      {/* Teacher overview + spec points */}
      <TeacherOverviewEditor
        overview={content.teacherOverview}
        specPoints={content.specPoints ?? []}
        onOverviewChange={(teacherOverview) => patch({ teacherOverview })}
        onSpecPointsChange={(specPoints) => patch({ specPoints })}
      />

      {/* Sections */}
      {content.sections.map((section, si) => (
        <section key={si} className="space-y-4 rounded-lg border p-4">
          <div className="flex items-start gap-2">
            <div className="flex-1 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor={`sec-title-${si}`}>Section title</Label>
                <Input
                  id={`sec-title-${si}`}
                  value={section.title}
                  onChange={(e) => updateSection(si, { title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`sec-instr-${si}`}>Instructions</Label>
                <Textarea
                  id={`sec-instr-${si}`}
                  rows={2}
                  value={section.instructions}
                  onChange={(e) => updateSection(si, { instructions: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label="Move section up"
                onClick={() => patch({ sections: move(content.sections, si, si - 1) })}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Move section down"
                onClick={() => patch({ sections: move(content.sections, si, si + 1) })}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Delete section"
                className="text-destructive hover:text-destructive"
                onClick={() => patch({ sections: content.sections.filter((_, i) => i !== si) })}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleQuestionDragEnd(si, e)}>
            <SortableContext items={section.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {section.questions.map((q, qi) => (
                  <SortableQuestion key={q.id} id={q.id}>
                    <QuestionEditor
                      q={q}
                      index={qi}
                      onChange={(next) => updateQuestion(si, qi, next)}
                      onMoveUp={() => updateSection(si, { questions: move(section.questions, qi, qi - 1) })}
                      onMoveDown={() => updateSection(si, { questions: move(section.questions, qi, qi + 1) })}
                      onDelete={() => updateSection(si, { questions: section.questions.filter((_, j) => j !== qi) })}
                    />
                  </SortableQuestion>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button type="button" variant="outline" size="sm"
            onClick={() => updateSection(si, { questions: [...section.questions, blankQuestion('shortAnswer')] })}>
            <Plus className="h-4 w-4 mr-2" /> Add question
          </Button>
        </section>
      ))}

      <Button type="button" variant="outline"
        onClick={() => patch({ sections: [...content.sections, { title: 'New section', instructions: '', questions: [] }] })}>
        <Plus className="h-4 w-4 mr-2" /> Add section
      </Button>

      {/* Extension */}
      <div className="space-y-1.5 rounded-lg border border-dashed p-4">
        <Label htmlFor="ws-ext">Extension task</Label>
        <Textarea
          id="ws-ext"
          rows={2}
          value={content.extensionTask}
          onChange={(e) => patch({ extensionTask: e.target.value })}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button type="button" onClick={() => onSave({ ...content, totalMarks })} disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </div>
  )
}

function VocabEditor({
  items, onChange,
}: { items: GeneratedWorksheet['vocabularyBox']; onChange: (items: GeneratedWorksheet['vocabularyBox']) => void }) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Key vocabulary</h3>
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input
            placeholder="Term"
            value={v.term}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, term: e.target.value } : x)))}
          />
          <Input
            placeholder="Definition"
            value={v.definition}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, definition: e.target.value } : x)))}
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Delete term"
            className="text-destructive hover:text-destructive shrink-0"
            onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm"
        onClick={() => onChange([...items, { term: '', definition: '' }])}>
        <Plus className="h-4 w-4 mr-2" /> Add term
      </Button>
    </section>
  )
}

function TeacherOverviewEditor({
  overview, specPoints, onOverviewChange, onSpecPointsChange,
}: {
  overview: GeneratedWorksheet['teacherOverview']
  specPoints: string[]
  onOverviewChange: (o: GeneratedWorksheet['teacherOverview']) => void
  onSpecPointsChange: (s: string[]) => void
}) {
  const set = (fields: Partial<GeneratedWorksheet['teacherOverview']>) =>
    onOverviewChange({ ...overview, ...fields })
  return (
    <section className="space-y-4 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Teacher overview</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ov-use">Intended use</Label>
          <Input id="ov-use" value={overview.intendedUse} onChange={(e) => set({ intendedUse: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ov-time">Time estimate</Label>
          <Input id="ov-time" value={overview.timeEstimate} onChange={(e) => set({ timeEstimate: e.target.value })} />
        </div>
      </div>
      <StringListEditor
        label="Equipment needed"
        values={overview.equipmentNeeded}
        onChange={(equipmentNeeded) => set({ equipmentNeeded })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ov-support">Differentiation — support</Label>
          <Textarea id="ov-support" rows={2} value={overview.differentiationNotes.support}
            onChange={(e) => set({ differentiationNotes: { ...overview.differentiationNotes, support: e.target.value } })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ov-stretch">Differentiation — stretch</Label>
          <Textarea id="ov-stretch" rows={2} value={overview.differentiationNotes.stretch}
            onChange={(e) => set({ differentiationNotes: { ...overview.differentiationNotes, stretch: e.target.value } })} />
        </div>
      </div>
      <StringListEditor
        label="Common misconceptions"
        values={overview.misconceptions}
        onChange={(misconceptions) => set({ misconceptions })}
      />
      <StringListEditor
        label="Assumed prior knowledge"
        values={overview.assumptions}
        onChange={(assumptions) => set({ assumptions })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ov-chal">Optional challenge</Label>
          <Textarea id="ov-chal" rows={2} value={overview.optionalChallenge}
            onChange={(e) => set({ optionalChallenge: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ov-chal-a">Challenge answer</Label>
          <Textarea id="ov-chal-a" rows={2} value={overview.challengeAnswer}
            onChange={(e) => set({ challengeAnswer: e.target.value })} />
        </div>
      </div>
      <StringListEditor
        label="Spec points (exam-board references)"
        values={specPoints}
        onChange={onSpecPointsChange}
      />
    </section>
  )
}

function SortableQuestion({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder question"
        className="mt-3 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

function QuestionEditor({
  q, index, onChange, onMoveUp, onMoveDown, onDelete,
}: {
  q: Question
  index: number
  onChange: (q: Question) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">Q{index + 1}</span>
        <Select value={q.type} onValueChange={(v) => onChange(changeType(q, v as QuestionType))}>
          <SelectTrigger className="h-8 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {QUESTION_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={q.difficulty} onValueChange={(v) => onChange({ ...q, difficulty: v as DifficultyTier })}>
          <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DIFFICULTY_TIERS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={0}
          max={20}
          className="h-8 w-20"
          aria-label="Marks"
          value={q.marks}
          onChange={(e) => onChange({ ...q, marks: parseInt(e.target.value, 10) || 0 })}
        />
        <span className="text-xs text-muted-foreground">marks</span>
        <div className="ml-auto flex gap-1">
          <Button type="button" variant="ghost" size="icon" aria-label="Move question up" onClick={onMoveUp}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Move question down" onClick={onMoveDown}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Delete question"
            className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Textarea
        rows={2}
        placeholder="Question text"
        value={q.text}
        onChange={(e) => onChange({ ...q, text: e.target.value })}
      />

      {q.type === 'multipleChoice' && (
        <StringListEditor
          label="Options"
          values={q.options ?? []}
          onChange={(options) => onChange({ ...q, options })}
        />
      )}
      {q.type === 'ordering' && (
        <StringListEditor
          label="Items (in correct order)"
          values={q.items ?? []}
          onChange={(items) => onChange({ ...q, items })}
        />
      )}
      {q.type === 'matching' && (
        <PairsEditor pairs={q.pairs ?? []} onChange={(pairs) => onChange({ ...q, pairs })} />
      )}
      {q.type === 'tableCompletion' && q.table && (
        <TableEditor table={q.table} onChange={(table) => onChange({ ...q, table })} />
      )}

      <Textarea
        rows={2}
        placeholder="Answer / mark scheme"
        value={q.answer}
        onChange={(e) => onChange({ ...q, answer: e.target.value })}
      />

      <Input
        placeholder="Hint (optional — shown to students)"
        value={q.hint ?? ''}
        onChange={(e) => onChange({ ...q, hint: e.target.value || undefined })}
      />
    </div>
  )
}

function StringListEditor({
  label, values, onChange,
}: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <Input value={v} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} />
          <Button type="button" variant="ghost" size="icon" aria-label="Remove" className="shrink-0"
            onClick={() => onChange(values.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...values, ''])}>
        <Plus className="h-4 w-4 mr-2" /> Add
      </Button>
    </div>
  )
}

function PairsEditor({
  pairs, onChange,
}: { pairs: { left: string; right: string }[]; onChange: (p: { left: string; right: string }[]) => void }) {
  return (
    <div className="space-y-2">
      <Label>Matching pairs</Label>
      {pairs.map((p, i) => (
        <div key={i} className="flex gap-2">
          <Input placeholder="Left" value={p.left}
            onChange={(e) => onChange(pairs.map((x, j) => (j === i ? { ...x, left: e.target.value } : x)))} />
          <Input placeholder="Right" value={p.right}
            onChange={(e) => onChange(pairs.map((x, j) => (j === i ? { ...x, right: e.target.value } : x)))} />
          <Button type="button" variant="ghost" size="icon" aria-label="Remove pair" className="shrink-0"
            onClick={() => onChange(pairs.filter((_, j) => j !== i))}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...pairs, { left: '', right: '' }])}>
        <Plus className="h-4 w-4 mr-2" /> Add pair
      </Button>
    </div>
  )
}

function TableEditor({
  table, onChange,
}: { table: NonNullable<Question['table']>; onChange: (t: NonNullable<Question['table']>) => void }) {
  const colCount = table.headers.length

  function setHeader(ci: number, value: string) {
    onChange({ ...table, headers: table.headers.map((h, j) => (j === ci ? value : h)) })
  }
  function setCell(ri: number, ci: number, value: string) {
    onChange({
      ...table,
      rows: table.rows.map((row, j) => (j === ri ? row.map((c, k) => (k === ci ? value : c)) : row)),
    })
  }
  function addRow() {
    onChange({ ...table, rows: [...table.rows, Array(colCount).fill('')] })
  }
  function removeRow(ri: number) {
    onChange({ ...table, rows: table.rows.filter((_, j) => j !== ri) })
  }
  function addColumn() {
    onChange({
      headers: [...table.headers, ''],
      rows: table.rows.map((row) => [...row, '']),
    })
  }
  function removeColumn(ci: number) {
    onChange({
      headers: table.headers.filter((_, j) => j !== ci),
      rows: table.rows.map((row) => row.filter((_, k) => k !== ci)),
    })
  }

  return (
    <div className="space-y-2">
      <Label>Table — use the token <code>[blank]</code> for cells students must fill</Label>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              {table.headers.map((h, ci) => (
                <th key={ci} className="border p-1">
                  <div className="flex items-center gap-1">
                    <Input className="h-8 w-32" placeholder={`Header ${ci + 1}`} value={h}
                      onChange={(e) => setHeader(ci, e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove column"
                      className="h-7 w-7 shrink-0" onClick={() => removeColumn(ci)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border p-1">
                    <Input className="h-8 w-32" value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} />
                  </td>
                ))}
                <td className="p-1">
                  <Button type="button" variant="ghost" size="icon" aria-label="Remove row" className="h-7 w-7"
                    onClick={() => removeRow(ri)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4 mr-2" /> Add row
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-4 w-4 mr-2" /> Add column
        </Button>
      </div>
    </div>
  )
}
