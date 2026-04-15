'use client'

import { useState } from 'react'
import { SplatGameData, SplatItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface SplatBuilderProps {
  onSave: (name: string, gameData: SplatGameData) => void
  onCancel: () => void
  initialName?: string
  initialData?: SplatGameData
}

export function SplatBuilder({ onSave, onCancel, initialName = '', initialData }: SplatBuilderProps) {
  const [gameName, setGameName] = useState(initialName)
  const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit ?? 10)
  const [items, setItems] = useState<SplatItem[]>(initialData?.items ?? [])
  const [isSaving, setIsSaving] = useState(false)

  const addItem = () => {
    setItems([...items, { id: `item_${Date.now()}`, question: '', answer: '' }])
  }

  const updateItem = (id: string, field: 'question' | 'answer', value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const handleSave = () => {
    if (!gameName.trim()) {
      toast.error('Game name is required')
      return
    }
    if (items.length < 10) {
      toast.error('At least 10 items are required')
      return
    }
    if (items.some((i) => !i.question.trim() || !i.answer.trim())) {
      toast.error('All items must have question and answer')
      return
    }
    setIsSaving(true)
    onSave(gameName, { timeLimit, items })
    setIsSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            Splat Fast-Paced Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Game Name *</Label>
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="e.g., Math Facts Splat"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Time Limit (seconds per question)</Label>
            <Input
              type="number"
              min={5}
              max={60}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Items ({items.length})
            {items.length < 10 && (
              <span className="text-sm text-destructive ml-2">(minimum 10 required)</span>
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
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Question *</Label>
                <Input
                  value={item.question}
                  onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                  placeholder="e.g., 5 × 6 ="
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Answer *</Label>
                <Input
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
                  placeholder="e.g., 30"
                  className="mt-1"
                />
              </div>
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
