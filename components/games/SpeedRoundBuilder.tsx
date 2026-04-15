'use client'

import { useState } from 'react'
import { SpeedRoundGameData, SpeedRoundItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Save, Timer } from 'lucide-react'
import { toast } from 'sonner'

interface SpeedRoundBuilderProps {
  onSave: (name: string, gameData: SpeedRoundGameData) => void
  onCancel: () => void
  initialName?: string
  initialData?: SpeedRoundGameData
}

export function SpeedRoundBuilder({ onSave, onCancel, initialName = '', initialData }: SpeedRoundBuilderProps) {
  const [gameName, setGameName] = useState(initialName)
  const [timeLimit, setTimeLimit] = useState<number>(initialData?.timeLimit ?? 60)
  const [items, setItems] = useState<SpeedRoundItem[]>(initialData?.items ?? [])

  const addItem = () => {
    setItems([...items, { id: `item_${Date.now()}`, question: '', answer: '' }])
  }

  const updateItem = (id: string, field: 'question' | 'answer', value: string) => {
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
    if (items.length < 10) {
      toast.error('At least 10 items are required')
      return
    }
    if (items.some((it) => !it.question.trim() || !it.answer.trim())) {
      toast.error('All items must have a question and answer')
      return
    }
    onSave(gameName, { timeLimit, items })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Timer className="h-5 w-5 text-red-500" />
            Speed Round
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Game Name *</Label>
            <Input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="e.g., Capital Cities Quiz"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Time Limit</Label>
            <Select value={String(timeLimit)} onValueChange={(v) => setTimeLimit(Number(v))}>
              <SelectTrigger className="mt-1 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="90">90 seconds</SelectItem>
                <SelectItem value="120">120 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Questions ({items.length})
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
                <Label>Question {index + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div>
                <Label>Question *</Label>
                <Input
                  value={item.question}
                  onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                  placeholder="Question"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Answer *</Label>
                <Input
                  value={item.answer}
                  onChange={(e) => updateItem(item.id, 'answer', e.target.value)}
                  placeholder="Answer"
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
