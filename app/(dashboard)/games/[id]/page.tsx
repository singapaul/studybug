'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useGamesStore } from '@/context/games-store'
import { GameType, FlashcardsGameData, PairsGameData, SplatGameData, SwipeGameData, MultipleChoiceGameData } from '@/types/game'
import FlashcardsGame from '@/components/games/flashcards/FlashcardsGame'
import PairsGame from '@/components/games/pairs/PairsGame'
import SplatGame from '@/components/games/splat/SplatGame'
import SwipeGame from '@/components/games/swipe/SwipeGame'
import MultipleChoiceGame from '@/components/games/multiple-choice/MultipleChoiceGame'

export default function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const { getGameById } = useGamesStore()

  const id = params?.id as string
  const game = getGameById(id)

  if (!game) {
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
    // In a real app we'd save the attempt. For now, result is shown by the game component.
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
