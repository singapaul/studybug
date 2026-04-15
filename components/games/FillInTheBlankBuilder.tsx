'use client'

import { useState } from 'react'
import { FillInTheBlankGameData, FillInTheBlankItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Save, PenLine } from 'lucide-react'
import { toast } from 'sonner'

interface FillInTheBlankBuilderProps {
  onSave: (name: string, gameData: FillInTheBlankGameData) => void
  onCancel: () => void
  initialName?: string
  initialData?: FillInTheBlankGameData
}

export function FillInTheBlankBuilder({ onSave, onCancel, initialName = '', initialData }: FillInTheBlankBuilderProps) {
  const [gameName, setGameName] = useState(initialName)
  const [items, setItems] = useState<FillInTheBlankItem[]>(initialData?.items ?? [])

  const addItem = () => {
    setItems([...items, { id: `item_${Date.now()}`, sentence: '', answer: '' }])
  }

  const updateItem = (id: string, field: 'sentence' | 'answer', value: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id))
  }

  const handleSave = () => {
    if (!gameName.trim()) {
      toast.error('Game name is required')
      return
    }
    if (items.length < 5) {
      toast.error('At least 5 items are required')
      return
    }
    if (items.some((it) => !it.sentence.includes('[blank]'))) {
      toast.error('Every sentence must contain a [blank] marker')
      return
    }
    if (items.some((it) => !it.answer.trim())) {
      toast.error('Every item must have an answer')
      return
    }
    onSave(gameName, { items })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <PenLine className="h-5 w-5 text-teal-500" />
            Fill in the Blank
          </div>
        </CardHeader>
        <CardContent>
          <Label>Game Name *</Label>
          <Input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., The capital of France quiz"
            className="mt-1"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Items ({items.length})
            {items.length < 5 && (
              <span className="text-sm text-destructive ml-2">(minimum 5 required)</span>
            )}
          </h2>
          <Button onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Label>Item {index + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Sentence * <span className="text-muted-foreground font-normal">(use [blank] to mark the gap)</span></Label>
                <Textarea
                  value={item.sentence}
                  onChange={(e) => updateItem(item.id, 'sentence', e.target.value)}
                  placeholder="e.g., The capital of France is [blank]"
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Correct Answer *</Label>
                <Input
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
                  placeholder="Correct answer"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border">
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSave} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          Save Game
        </Button>
      </div>
    </div>
  )
}
