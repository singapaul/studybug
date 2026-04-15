'use client'

import { useState } from 'react'
import { AnagramGameData, AnagramItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save, Shuffle } from 'lucide-react'
import { toast } from 'sonner'

interface AnagramBuilderProps {
  onSave: (name: string, gameData: AnagramGameData) => void
  onCancel: () => void
  initialName?: string
  initialData?: AnagramGameData
}

export function AnagramBuilder({ onSave, onCancel, initialName = '', initialData }: AnagramBuilderProps) {
  const [gameName, setGameName] = useState(initialName)
  const [items, setItems] = useState<AnagramItem[]>(initialData?.items ?? [])

  const addItem = () => {
    setItems([...items, { id: `item_${Date.now()}`, word: '', hint: '' }])
  }

  const updateItem = (id: string, field: 'word' | 'hint', value: string) => {
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
      toast.error('At least 5 words are required')
      return
    }
    if (items.some((it) => !it.word.trim())) {
      toast.error('Every item must have a word')
      return
    }
    if (items.some((it) => it.word.trim().includes(' '))) {
      toast.error('Each word must be a single word (no spaces) — anagrams work on one word at a time')
      return
    }
    onSave(gameName, { items: items.map((it) => ({ ...it, hint: it.hint?.trim() || undefined })) })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Shuffle className="h-5 w-5 text-violet-500" />
            Anagram Solver
          </div>
        </CardHeader>
        <CardContent>
          <Label>Game Name *</Label>
          <Input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Animals Quiz"
            className="mt-1"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Words ({items.length})
            {items.length < 5 && (
              <span className="text-sm text-destructive ml-2">(minimum 5 required)</span>
            )}
          </h2>
          <Button onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Word
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Label>Word {index + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div>
                <Label>Word * <span className="text-muted-foreground font-normal">(single word only)</span></Label>
                <Input
                  value={item.word}
                  onChange={(e) => updateItem(item.id, 'word', e.target.value)}
                  placeholder="Word"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Hint <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  value={item.hint ?? ''}
                  onChange={(e) => updateItem(item.id, 'hint', e.target.value)}
                  placeholder="Hint (optional)"
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
