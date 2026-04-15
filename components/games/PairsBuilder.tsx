'use client'

import { useState } from 'react'
import { PairsGameData, PairsItem } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Save, Loader2, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'

interface PairsBuilderProps {
  onSave: (name: string, gameData: PairsGameData) => void
  onCancel: () => void
  initialName?: string
  initialData?: PairsGameData
}

export function PairsBuilder({ onSave, onCancel, initialName = '', initialData }: PairsBuilderProps) {
  const [gameName, setGameName] = useState(initialName)
  const [pairs, setPairs] = useState<PairsItem[]>(initialData?.items ?? [])
  const [isSaving, setIsSaving] = useState(false)

  const addPair = () => {
    setPairs([...pairs, { id: `pair_${Date.now()}`, leftText: '', rightText: '' }])
  }

  const updatePair = (id: string, field: 'leftText' | 'rightText', value: string) => {
    setPairs(pairs.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const deletePair = (id: string) => {
    setPairs(pairs.filter((p) => p.id !== id))
  }

  const handleSave = () => {
    if (!gameName.trim()) {
      toast.error('Game name is required')
      return
    }
    if (pairs.length < 3) {
      toast.error('At least 3 pairs are required')
      return
    }
    if (pairs.some((p) => !p.leftText.trim() || !p.rightText.trim())) {
      toast.error('All pairs must have both left and right text')
      return
    }
    setIsSaving(true)
    onSave(gameName, { items: pairs })
    setIsSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-blue-500" />
            Pairs Matching Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="gameName">Game Name *</Label>
          <Input
            id="gameName"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Spanish Vocabulary Matching"
            className="mt-1"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Pairs ({pairs.length})
            {pairs.length < 3 && (
              <span className="text-sm text-destructive ml-2">(minimum 3 required)</span>
            )}
          </h2>
          <Button onClick={addPair}>
            <Plus className="mr-2 h-4 w-4" />
            Add Pair
          </Button>
        </div>

        {pairs.map((pair, index) => (
          <Card key={pair.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Label>Pair {index + 1}</Label>
                <Button variant="ghost" size="icon" onClick={() => deletePair(pair.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Left Card *</Label>
                <Input
                  value={pair.leftText}
                  onChange={(e) => updatePair(pair.id, 'leftText', e.target.value)}
                  placeholder="e.g., Hello"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Right Card *</Label>
                <Input
                  value={pair.rightText}
                  onChange={(e) => updatePair(pair.id, 'rightText', e.target.value)}
                  placeholder="e.g., Hola"
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
