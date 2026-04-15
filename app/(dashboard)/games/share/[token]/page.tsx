'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Copy } from 'lucide-react'
import { useSharedGame, useCreateGame } from '@/hooks/use-games'
import { usePlan } from '@/hooks/use-plan'
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
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Phase = 'lobby' | 'playing'

export default function SharedGamePage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  const [phase, setPhase] = useState<Phase>('lobby')

  const { data: game, isLoading, isError } = useSharedGame(token)
  const { isPro } = usePlan()
  const { mutateAsync: createGame, isPending: isCloning } = useCreateGame()

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
        <p className="text-muted-foreground mb-1">This game is no longer available.</p>
        <p className="text-sm text-muted-foreground">The link may have been revoked by its owner.</p>
      </div>
    )
  }

  const handleExit = () => {
    setPhase('lobby')
  }

  const handleClone = async () => {
    try {
      const parsedData = JSON.parse(game.gameData)
      await createGame({
        name: `${game.name} (copy)`,
        gameType: game.gameType as GameType,
        gameData: parsedData,
      })
      toast.success('Game cloned to your library!')
      router.push('/games')
    } catch (err: unknown) {
      const e = err as { code?: string }
      if (e.code === 'GAME_LIMIT_REACHED') {
        toast.error('Game limit reached. Upgrade to Pro to save more games.')
      } else {
        toast.error('Failed to clone game')
      }
    }
  }

  if (phase === 'lobby') {
    return (
      <LobbyScreen
        game={game}
        onPlay={() => setPhase('playing')}
        onBack={() => router.push('/games')}
        backLabel="Back to Games"
        extraAction={
          isPro ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClone}
              disabled={isCloning}
            >
              {isCloning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Clone to My Games
            </Button>
          ) : null
        }
      />
    )
  }

  const parsedData = JSON.parse(game.gameData)

  return (
    <div className="p-4">
      {game.gameType === GameType.FLASHCARDS && (
        <FlashcardsGame
          gameData={parsedData as FlashcardsGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.PAIRS && (
        <PairsGame
          gameData={parsedData as PairsGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.SPLAT && (
        <SplatGame
          gameData={parsedData as SplatGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.SWIPE && (
        <SwipeGame
          gameData={parsedData as SwipeGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.MULTIPLE_CHOICE && (
        <MultipleChoiceGame
          gameData={parsedData as MultipleChoiceGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.FILL_IN_THE_BLANK && (
        <FillInTheBlankGame
          gameData={parsedData as FillInTheBlankGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.SPEED_ROUND && (
        <SpeedRoundGame
          gameData={parsedData as SpeedRoundGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
      {game.gameType === GameType.ANAGRAM && (
        <AnagramGame
          gameData={parsedData as AnagramGameData}
          gameName={game.name}
          onComplete={() => setPhase('lobby')}
          onExit={handleExit}
        />
      )}
    </div>
  )
}
