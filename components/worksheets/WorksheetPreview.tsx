'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GeneratedWorksheet, Question, WorksheetTable } from '@/types/worksheet'

interface WorksheetPreviewProps {
  worksheet: GeneratedWorksheet
}

/** Stable, deterministic display order that avoids revealing the answer sequence/pairing. */
function sortedForDisplay(items: string[]): string[] {
  return [...items].sort((a, b) => a.localeCompare(b))
}

function TableView({ table }: { table: WorksheetTable }) {
  return (
    <div className="ml-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} className="border px-2 py-1 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className="border px-2 py-1">
                  {cell === '[blank]' ? <span className="inline-block min-w-[6rem] border-b border-dotted">&nbsp;</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuestionView({ q, index }: { q: Question; index: number }) {
  const tier =
    q.difficulty === 'support' ? 'Support' :
    q.difficulty === 'stretch' ? 'Stretch' : null

  return (
    <div className="space-y-2 print:break-inside-avoid">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">
          <span className="font-semibold mr-2">{index + 1}.</span>
          {q.text}
        </p>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {tier && <span className="mr-2 rounded bg-muted px-1.5 py-0.5">{tier}</span>}
          [{q.marks} mark{q.marks === 1 ? '' : 's'}]
        </span>
      </div>
      {q.type === 'multipleChoice' && q.options && (
        <ol className="ml-6 list-[upper-alpha] space-y-1 text-sm">
          {q.options.map((opt) => (<li key={opt}>{opt}</li>))}
        </ol>
      )}
      {q.type === 'trueFalse' && (
        <p className="ml-6 text-sm text-muted-foreground">Circle: TRUE / FALSE — then justify.</p>
      )}
      {q.type === 'matching' && q.pairs && (
        <div className="ml-6 grid grid-cols-2 gap-4 text-sm">
          <ol className="list-decimal space-y-1 pl-4">
            {q.pairs.map((p, i) => (<li key={i}>{p.left}</li>))}
          </ol>
          <ol className="list-[upper-alpha] space-y-1 pl-4">
            {sortedForDisplay(q.pairs.map((p) => p.right)).map((right, i) => (
              <li key={i}>{right}</li>
            ))}
          </ol>
        </div>
      )}
      {q.type === 'ordering' && q.items && (
        <ol className="ml-6 list-[upper-alpha] space-y-1 text-sm">
          {sortedForDisplay(q.items).map((item, i) => (<li key={i}>{item}</li>))}
        </ol>
      )}
      {q.type === 'tableCompletion' && q.table && <TableView table={q.table} />}
      {q.hint && <p className="ml-6 text-xs italic text-muted-foreground">Hint: {q.hint}</p>}
    </div>
  )
}

function AnswerView({ q, index }: { q: Question; index: number }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{index + 1}. ({q.marks} mark{q.marks === 1 ? '' : 's'})</p>
      <p className="ml-6 text-sm whitespace-pre-line">{q.answer || '—'}</p>
    </div>
  )
}

export function WorksheetPreview({ worksheet }: WorksheetPreviewProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold">{worksheet.title}</h2>
          <p className="text-sm text-muted-foreground">
            {[worksheet.subject, worksheet.yearGroup, worksheet.level].filter(Boolean).join(' · ')}
            {' · '}{worksheet.totalMarks} marks total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      <Tabs defaultValue="worksheet" className="w-full">
        <TabsList className="print:hidden">
          <TabsTrigger value="worksheet">Worksheet</TabsTrigger>
          <TabsTrigger value="teacher">Teacher overview</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
        </TabsList>

        <TabsContent
          value="worksheet"
          className="space-y-6 rounded-lg border bg-card p-6 shadow-sm sm:p-8 print:block print:space-y-6 print:rounded-none print:border-0 print:p-0 print:shadow-none"
        >
          <div className="print:block print:mb-4 hidden">
            <h1 className="text-2xl font-bold">{worksheet.title}</h1>
            <p className="text-sm">{[worksheet.subject, worksheet.yearGroup, worksheet.level].filter(Boolean).join(' · ')}</p>
            <p className="text-sm">Total marks: {worksheet.totalMarks}</p>
          </div>

          {worksheet.vocabularyBox.length > 0 && (
            <section className="rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold mb-2">Key vocabulary</h3>
              <dl className="grid gap-1 sm:grid-cols-2 text-sm">
                {worksheet.vocabularyBox.map((v) => (
                  <div key={v.term} className="flex gap-2">
                    <dt className="font-semibold">{v.term}:</dt>
                    <dd className="text-muted-foreground">{v.definition}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {worksheet.sections.map((section, si) => (
            <section key={si} className="space-y-3 print:break-inside-avoid">
              <header>
                <h3 className="font-semibold">{section.title}</h3>
                {section.instructions && (
                  <p className="text-sm text-muted-foreground italic">{section.instructions}</p>
                )}
              </header>
              <div className="space-y-4">
                {section.questions.map((q, qi) => (
                  <QuestionView key={q.id} q={q} index={qi} />
                ))}
              </div>
            </section>
          ))}

          {worksheet.extensionTask && (
            <section className="rounded-lg border border-dashed p-4">
              <h3 className="text-sm font-semibold">Extension</h3>
              <p className="text-sm mt-1">{worksheet.extensionTask}</p>
            </section>
          )}
        </TabsContent>

        <TabsContent value="teacher" className="space-y-4 print:hidden">
          {worksheet.examBoard && worksheet.examBoard !== 'none' && (
            <Card title="Exam board alignment">
              <p className="font-medium">{worksheet.examBoard}</p>
              {worksheet.specPoints && worksheet.specPoints.length > 0 && (
                <ul className="list-disc ml-5 mt-1">
                  {worksheet.specPoints.map((sp) => <li key={sp}>{sp}</li>)}
                </ul>
              )}
            </Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Intended use">{worksheet.teacherOverview.intendedUse || '—'}</Card>
            <Card title="Time estimate">{worksheet.teacherOverview.timeEstimate || '—'}</Card>
          </div>
          {worksheet.teacherOverview.equipmentNeeded.length > 0 && (
            <Card title="Equipment needed">
              <ul className="list-disc ml-5">
                {worksheet.teacherOverview.equipmentNeeded.map((eq) => <li key={eq}>{eq}</li>)}
              </ul>
            </Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Differentiation — support">{worksheet.teacherOverview.differentiationNotes.support || '—'}</Card>
            <Card title="Differentiation — stretch">{worksheet.teacherOverview.differentiationNotes.stretch || '—'}</Card>
          </div>
          {worksheet.teacherOverview.misconceptions.length > 0 && (
            <Card title="Misconceptions to watch for">
              <ul className="list-disc ml-5">
                {worksheet.teacherOverview.misconceptions.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </Card>
          )}
          {worksheet.teacherOverview.assumptions.length > 0 && (
            <Card title="Assumed prior knowledge">
              <ul className="list-disc ml-5">
                {worksheet.teacherOverview.assumptions.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </Card>
          )}
          {worksheet.teacherOverview.optionalChallenge && (
            <Card title="Optional challenge">
              <p>{worksheet.teacherOverview.optionalChallenge}</p>
              {worksheet.teacherOverview.challengeAnswer && (
                <p className="mt-2 text-xs text-muted-foreground">Answer: {worksheet.teacherOverview.challengeAnswer}</p>
              )}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="answers" className="space-y-4 print:hidden">
          {worksheet.sections.map((section, si) => (
            <section key={si} className="space-y-2">
              <h3 className="font-semibold">{section.title}</h3>
              <div className="space-y-3">
                {section.questions.map((q, qi) => (
                  <AnswerView key={q.id} q={q} index={qi} />
                ))}
              </div>
            </section>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">{title}</h4>
      <div className="text-sm">{children}</div>
    </div>
  )
}
