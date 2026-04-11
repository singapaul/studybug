'use client'

import { useState } from 'react'
import { SwipeGameData, SwipeItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Save, Loader2, Move } from 'lucide-react'
import { toast } from 'sonner'

interface SwipeBuilderProps {
  onSave: (name: string, gameData: SwipeGameData) => void
  onCancel: () => void
}

export function SwipeBuilder({ onSave, onCancel }: SwipeBuilderProps) {
  const [gameName, setGameName] = useState('')
  const [items, setItems] = useState<SwipeItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const addItem = () => {
    setItems([...items, { id: `item_${Date.now()}`, statement: '', isCorrect: true, explanation: '' }])
  }

  const updateItem = (id: string, field: 'statement' | 'isCorrect' | 'explanation', value: string | boolean) => {
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
    if (items.some((i) => !i.statement.trim())) {
      toast.error('All items must have a statement')
      return
    }
    setIsSaving(true)
    onSave(gameName, { items })
    setIsSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5 text-pink-500" />
            Swipe Game (True/False)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Game Name *</Label>
          <Input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., History Facts - True or False"
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-2">
            Swipe right for correct statements, left for incorrect
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Statements ({items.length})
            {items.length < 10 && (
              <span className="text-sm text-destructive ml-2">(minimum 10 required)</span>
            )}
          </h2>
          <Button onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Statement
          </Button>
        </div>

        {items.map((item, index) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Label>Statement {index + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Statement *</Label>
                <Textarea
                  value={item.statement}
                  onChange={(e) => updateItem(item.id, 'statement', e.target.value)}
                  placeholder="e.g., The Earth revolves around the Sun"
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`correct-${item.id}`}
                  checked={item.isCorrect}
                  onCheckedChange={(checked) => updateItem(item.id, 'isCorrect', checked as boolean)}
                />
                <Label htmlFor={`correct-${item.id}`} className="cursor-pointer">
                  This statement is correct (swipe right)
                </Label>
              </div>
              <div>
                <Label>Explanation (Optional)</Label>
                <Input
                  value={item.explanation || ''}
                  onChange={(e) => updateItem(item.id, 'explanation', e.target.value)}
                  placeholder="Explain why this is correct or incorrect..."
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
