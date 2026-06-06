'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart3, FileText, Loader2 } from 'lucide-react'
import { useGame, useGameAttempts, useSubmitAttempt } from '@/hooks/use-games'
import { usePlan } from '@/hooks/use-plan'
import { Button } from '@/components/ui/button'
import { gameToSeed, stashWorksheetSeed } from '@/lib/worksheet-seed'
import type { GameData } from '@/types/game'
import {
  GameType,
  FlashcardsGameData,
  PairsGameData,
  SplatGameData,
  SwipeGameData,
  MultipleChoiceGameData,
  FillInTheBlankGameData,
  SpeedRoundGameData,
  AnagramGameData,
} from '@/types/game'
import { LobbyScreen } from '@/components/games/LobbyScreen'
import FlashcardsGame from '@/components/games/flashcards/FlashcardsGame'
import PairsGame from '@/components/games/pairs/PairsGame'
import SplatGame from '@/components/games/splat/SplatGame'
import SwipeGame from '@/components/games/swipe/SwipeGame'
import MultipleChoiceGame from '@/components/games/multiple-choice/MultipleChoiceGame'
import FillInTheBlankGame from '@/components/games/fill-in-the-blank/FillInTheBlankGame'
import SpeedRoundGame from '@/components/games/speed-round/SpeedRoundGame'
import AnagramGame from '@/components/games/anagram/AnagramGame'
import { GameCompleteModal } from '@/components/games/GameCompleteModal'

type Phase = 'lobby' | 'playing'

export default function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [phase, setPhase] = useState<Phase>('lobby')
  const [gameKey, setGameKey] = useState(0)
  const [completeResult, setCompleteResult] = useState<{ scorePercentage: number; timeTaken: number } | null>(null)

  const { data: game, isLoading, isError } = useGame(id)
  const { data: attempts } = useGameAttempts(id)
  const { mutate: submitAttempt } = useSubmitAttempt()
  const { isPro } = usePlan()

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

  const previousBest =
    attempts && (attempts as { scorePercentage: number }[]).length > 0
      ? Math.max(...(attempts as { scorePercentage: number }[]).map((a) => a.scorePercentage))
      : null

  const handleComplete = (result: { scorePercentage: number; timeTaken: number }) => {
    submitAttempt({ gameId: id, ...result })
    setCompleteResult(result)
  }

  const handleExit = () => {
    setCompleteResult(null)
    setPhase('lobby')
  }

  if (phase === 'lobby') {
    return (
      <LobbyScreen
        game={game}
        onPlay={() => setPhase('playing')}
        onBack={() => router.push('/games')}
        extraAction={
          isPro ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" asChild>
                <Link href={`/games/${id}/stats`}>
                  <BarChart3 className="h-4 w-4 mr-2" /> View stats
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  stashWorksheetSeed(
                    gameToSeed({
                      name: game.name,
                      subject: game.subject,
                      gameType: game.gameType,
                      gameData: JSON.parse(game.gameData) as GameData,
                    }),
                  )
                  router.push('/worksheets/new')
                }}
              >
                <FileText className="h-4 w-4 mr-2" /> Create worksheet
              </Button>
            </div>
          ) : undefined
        }
      />
    )
  }

  const parsedData = JSON.parse(game.gameData)

  return (
    <div className="p-4">
      {game.gameType === GameType.FLASHCARDS && (
        <FlashcardsGame
          key={gameKey}
          gameData={parsedData as FlashcardsGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.PAIRS && (
        <PairsGame
          key={gameKey}
          gameData={parsedData as PairsGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.SPLAT && (
        <SplatGame
          key={gameKey}
          gameData={parsedData as SplatGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.SWIPE && (
        <SwipeGame
          key={gameKey}
          gameData={parsedData as SwipeGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.MULTIPLE_CHOICE && (
        <MultipleChoiceGame
          key={gameKey}
          gameData={parsedData as MultipleChoiceGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.FILL_IN_THE_BLANK && (
        <FillInTheBlankGame
          key={gameKey}
          gameData={parsedData as FillInTheBlankGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.SPEED_ROUND && (
        <SpeedRoundGame
          key={gameKey}
          gameData={parsedData as SpeedRoundGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      {game.gameType === GameType.ANAGRAM && (
        <AnagramGame
          key={gameKey}
          gameData={parsedData as AnagramGameData}
          gameName={game.name}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      )}

      <GameCompleteModal
        open={!!completeResult}
        result={completeResult ?? { scorePercentage: 0, timeTaken: 0 }}
        previousBest={previousBest}
        game={game}
        isPro={isPro}
        onPlayAgain={() => { setCompleteResult(null); setGameKey((k) => k + 1) }}
        onClose={() => { setCompleteResult(null); router.push('/games') }}
      />
    </div>
  )
}
