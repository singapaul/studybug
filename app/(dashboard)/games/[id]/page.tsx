'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useGame, useSubmitAttempt } from '@/hooks/use-games'
import { GameType, FlashcardsGameData, PairsGameData, SplatGameData, SwipeGameData, MultipleChoiceGameData } from '@/types/game'
import FlashcardsGame from '@/components/games/flashcards/FlashcardsGame'
import PairsGame from '@/components/games/pairs/PairsGame'
import SplatGame from '@/components/games/splat/SplatGame'
import SwipeGame from '@/components/games/swipe/SwipeGame'
import MultipleChoiceGame from '@/components/games/multiple-choice/MultipleChoiceGame'
import { toast } from 'sonner'

export default function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { data: game, isLoading, isError } = useGame(id)
  const { mutate: submitAttempt } = useSubmitAttempt()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !game) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-3">Game not found.</p>
        <Link href="/games" className="text-primary underline">
          Back to Games
        </Link>
      </div>
    )
  }

  const handleComplete = (result: { scorePercentage: number; timeTaken: number }) => {
    submitAttempt(
      { gameId: id, ...result },
      {
        onSuccess: () => toast.success('Score saved!'),
        onError: () => toast.error('Could not save score'),
      }
    )
  }

  const handleExit = () => {
    router.push('/games')
  }

  const parsedData = JSON.parse(game.gameData)

  return (
    <div className="p-4">
      <Link
        href="/games"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Games
      </Link>

      {game.gameType === GameType.FLASHCARDS && (
        <FlashcardsGame
          gameData={parsedData as FlashcardsGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.PAIRS && (
        <PairsGame
          gameData={parsedData as PairsGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.SPLAT && (
        <SplatGame
          gameData={parsedData as SplatGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.SWIPE && (
        <SwipeGame
          gameData={parsedData as SwipeGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.MULTIPLE_CHOICE && (
        <MultipleChoiceGame
          gameData={parsedData as MultipleChoiceGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}
    </div>
  )
}
