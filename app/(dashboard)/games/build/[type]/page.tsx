'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { GameType, GameData } from '@/types/game'
import { useGamesStore } from '@/context/games-store'
import { getTemplateName } from '@/lib/game-templates'
import { FlashcardsBuilder } from '@/components/games/FlashcardsBuilder'
import { PairsBuilder } from '@/components/games/PairsBuilder'
import { SplatBuilder } from '@/components/games/SplatBuilder'
import { SwipeBuilder } from '@/components/games/SwipeBuilder'
import { MultipleChoiceBuilder } from '@/components/games/MultipleChoiceBuilder'
import { toast } from 'sonner'

export default function BuildGamePage() {
  const params = useParams()
  const router = useRouter()
  const { createGame } = useGamesStore()

  const type = params?.type as string
  const gameType = Object.values(GameType).includes(type as GameType)
    ? (type as GameType)
    : null

  if (!gameType) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Unknown game type: {type}</p>
        <Link href="/games/create" className="text-primary underline mt-2 inline-block">
          Choose a game type
        </Link>
      </div>
    )
  }

  const handleSave = (name: string, gameData: GameData) => {
    createGame({ name, gameType, gameData })
    toast.success('Game created!')
    router.push('/games')
  }

  const handleCancel = () => {
    router.push('/games')
  }

  const typeName = getTemplateName(gameType)

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/games/create"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Game Type
        </Link>
        <h1 className="text-2xl font-bold font-display">Create {typeName} Game</h1>
      </div>

      {gameType === GameType.FLASHCARDS && (
        <FlashcardsBuilder onSave={handleSave} onCancel={handleCancel} />
      )}
      {gameType === GameType.PAIRS && (
        <PairsBuilder onSave={handleSave} onCancel={handleCancel} />
      )}
      {gameType === GameType.SPLAT && (
        <SplatBuilder onSave={handleSave} onCancel={handleCancel} />
      )}
      {gameType === GameType.SWIPE && (
        <SwipeBuilder onSave={handleSave} onCancel={handleCancel} />
      )}
      {gameType === GameType.MULTIPLE_CHOICE && (
        <MultipleChoiceBuilder onSave={handleSave} onCancel={handleCancel} />
      )}
    </div>
  )
}
