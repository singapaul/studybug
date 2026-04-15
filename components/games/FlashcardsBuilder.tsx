'use client'

import { useState } from 'react'
import { FlashcardsGameData, FlashcardItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Save, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

interface FlashcardsBuilderProps {
  onSave: (name: string, gameData: FlashcardsGameData) => void
  onCancel: () => void
  initialName?: string
  initialData?: FlashcardsGameData
}

export function FlashcardsBuilder({ onSave, onCancel, initialName = '', initialData }: FlashcardsBuilderProps) {
  const [gameName, setGameName] = useState(initialName)
  const [cards, setCards] = useState<FlashcardItem[]>(initialData?.cards ?? [])
  const [isSaving, setIsSaving] = useState(false)

  const addCard = () => {
    setCards([...cards, { id: `card_${Date.now()}`, front: '', back: '' }])
  }

  const updateCard = (id: string, field: 'front' | 'back', value: string) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const deleteCard = (id: string) => {
    setCards(cards.filter((c) => c.id !== id))
  }

  const handleSave = () => {
    if (!gameName.trim()) {
      toast.error('Game name is required')
      return
    }
    if (cards.length < 5) {
      toast.error('At least 5 flashcards are required')
      return
    }
    if (cards.some((c) => !c.front.trim() || !c.back.trim())) {
      toast.error('All flashcards must have front and back text')
      return
    }
    setIsSaving(true)
    onSave(gameName, { cards })
    setIsSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            Flashcards Study Set
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label>Game Name *</Label>
          <Input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Biology Terms Study Set"
            className="mt-1"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Flashcards ({cards.length})
            {cards.length < 5 && (
              <span className="text-sm text-destructive ml-2">(minimum 5 required)</span>
            )}
          </h2>
          <Button onClick={addCard}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        {cards.map((card, index) => (
          <Card key={card.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Label>Card {index + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => deleteCard(card.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Front *</Label>
                <Textarea
                  value={card.front}
                  onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                  placeholder="Front of card..."
                  rows={2}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Back *</Label>
                <Textarea
                  value={card.back}
                  onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                  placeholder="Back of card..."
                  rows={2}
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
