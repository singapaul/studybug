'use client'

import { Play, Trophy, Tag } from 'lucide-react'
import { useGameAttempts } from '@/hooks/use-games'
import { usePlan } from '@/hooks/use-plan'
import { GameType } from '@/types/game'
import { getTemplateName, getTemplateColor } from '@/lib/game-templates'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LobbyScreenProps {
  game: { id: string; name: string; gameType: string; gameData: string }
  onPlay: () => void
  onBack: () => void
  backLabel?: string
  /** Extra action rendered below the Play button (e.g. a Clone button on the share page) */
  extraAction?: React.ReactNode
}

export function LobbyScreen({
  game,
  onPlay,
  onBack,
  backLabel = 'Back to Games',
  extraAction,
}: LobbyScreenProps) {
  const { isPro } = usePlan()
  const { data: attempts } = useGameAttempts(game.id)

  const parsedData = JSON.parse(game.gameData) as Record<string, unknown>
  const itemCount =
    'cards' in parsedData ? (parsedData.cards as unknown[]).length
    : 'items' in parsedData ? (parsedData.items as unknown[]).length
    : 'questions' in parsedData ? (parsedData.questions as unknown[]).length
    : 0

  const gameType = game.gameType as GameType
  const typeName = getTemplateName(gameType)
  const colorClass = getTemplateColor(gameType)

  const personalBest =
    isPro && attempts && attempts.length > 0
      ? Math.max(...(attempts as { scorePercentage: number }[]).map((a) => a.scorePercentage))
      : null

  const itemLabel =
    gameType === GameType.FLASHCARDS ? 'flashcards'
    : gameType === GameType.PAIRS ? 'pairs'
    : gameType === GameType.MULTIPLE_CHOICE ? 'questions'
    : gameType === GameType.SPEED_ROUND ? 'questions'
    : 'items'

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← {backLabel}
      </button>

      <Card className="shadow-lg">
        <CardContent className="pt-8 pb-8 px-8 text-center space-y-6">
          <div className="flex justify-center">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-2xl text-white',
                colorClass,
              )}
            >
              <Tag className="h-8 w-8" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold mb-2">{game.name}</h1>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">{typeName}</Badge>
              <span className="text-sm text-muted-foreground">
                {itemCount} {itemLabel}
              </span>
            </div>
          </div>

          {personalBest !== null && (
            <div className="flex items-center justify-center gap-2 text-amber-600">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Personal best: {personalBest}%</span>
            </div>
          )}

          <Button size="lg" className="w-full" onClick={onPlay}>
            <Play className="mr-2 h-5 w-5" />
            Play
          </Button>

          {extraAction}
        </CardContent>
      </Card>
    </div>
  )
}
