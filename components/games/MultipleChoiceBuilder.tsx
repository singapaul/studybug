'use client'

import { useState } from 'react'
import { MultipleChoiceGameData, MultipleChoiceQuestion } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, Loader2, CheckCircle, X } from 'lucide-react'
import { toast } from 'sonner'

interface MultipleChoiceBuilderProps {
  onSave: (name: string, gameData: MultipleChoiceGameData) => void
  onCancel: () => void
}

export function MultipleChoiceBuilder({ onSave, onCancel }: MultipleChoiceBuilderProps) {
  const [gameName, setGameName] = useState('')
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const addQuestion = () => {
    const ts = Date.now()
    setQuestions([...questions, {
      id: `q_${ts}`,
      question: '',
      options: [
        { id: `opt_${ts}_1`, text: '', isCorrect: true },
        { id: `opt_${ts}_2`, text: '', isCorrect: false },
      ],
    }])
  }

  const updateQuestion = (id: string, updates: Partial<MultipleChoiceQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map((q) => {
      if (q.id === questionId && q.options.length < 4) {
        return { ...q, options: [...q.options, { id: `opt_${Date.now()}`, text: '', isCorrect: false }] }
      }
      return q
    }))
  }

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(questions.map((q) => {
      if (q.id !== questionId) return q
      return { ...q, options: q.options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)) }
    }))
  }

  const deleteOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map((q) => {
      if (q.id !== questionId || q.options.length <= 2) return q
      return { ...q, options: q.options.filter((opt) => opt.id !== optionId) }
    }))
  }

  const toggleCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(questions.map((q) => {
      if (q.id !== questionId) return q
      return { ...q, options: q.options.map((opt) => ({ ...opt, isCorrect: opt.id === optionId })) }
    }))
  }

  const validate = (): string | null => {
    if (!gameName.trim()) return 'Game name is required'
    if (questions.length < 5) return 'At least 5 questions are required'
    for (const q of questions) {
      if (!q.question.trim()) return 'All questions must have text'
      if (q.options.length < 2) return 'Each question needs at least 2 options'
      if (q.options.some((o) => !o.text.trim())) return 'All options must have text'
      if (!q.options.some((o) => o.isCorrect)) return 'Each question must have one correct answer'
    }
    return null
  }

  const handleSave = () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }
    setIsSaving(true)
    onSave(gameName, { questions })
    setIsSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Multiple Choice Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="gameName">Game Name *</Label>
          <Input
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Year 5 Science Quiz"
            className="mt-1"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Questions ({questions.length})
            {questions.length < 5 && (
              <span className="text-sm text-destructive ml-2">(minimum 5 required)</span>
            )}
          </h2>
          <Button onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 && (
          <Card className="py-8">
            <CardContent className="text-center">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-3">No questions yet.</p>
              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Question
              </Button>
            </CardContent>
          </Card>
        )}

        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <Label>Question {index + 1} *</Label>
                <Button variant="ghost" size="icon" onClick={() => deleteQuestion(question.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={question.question}
                onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                placeholder="Enter your question..."
                rows={2}
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <Label>Answer Options (mark one as correct)</Label>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={option.isCorrect}
                    onCheckedChange={() => toggleCorrectOption(question.id, option.id)}
                  />
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                    placeholder="Option text..."
                    className="flex-1"
                  />
                  {question.options.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => deleteOption(question.id, option.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {question.options.length < 4 && (
                <Button variant="outline" size="sm" onClick={() => addOption(question.id)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Save Game
        </Button>
      </div>
    </div>
  )
}
