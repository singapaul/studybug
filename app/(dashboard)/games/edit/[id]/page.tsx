'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useGame, useUpdateGame } from '@/hooks/use-games'
import {
  GameType,
  GameData,
  FlashcardsGameData,
  PairsGameData,
  SplatGameData,
  SwipeGameData,
  MultipleChoiceGameData,
  FillInTheBlankGameData,
  SpeedRoundGameData,
  AnagramGameData,
} from '@/types/game'
import { FlashcardsBuilder } from '@/components/games/FlashcardsBuilder'
import { PairsBuilder } from '@/components/games/PairsBuilder'
import { SplatBuilder } from '@/components/games/SplatBuilder'
import { SwipeBuilder } from '@/components/games/SwipeBuilder'
import { MultipleChoiceBuilder } from '@/components/games/MultipleChoiceBuilder'
import { FillInTheBlankBuilder } from '@/components/games/FillInTheBlankBuilder'
import { SpeedRoundBuilder } from '@/components/games/SpeedRoundBuilder'
import { AnagramBuilder } from '@/components/games/AnagramBuilder'
import { getTemplateName } from '@/lib/game-templates'
import { toast } from 'sonner'

export default function EditGamePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { data: game, isLoading, isError } = useGame(id)
  const { mutateAsync: updateGame } = useUpdateGame()

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
        <Link href="/games" className="text-primary underline">Back to Games</Link>
      </div>
    )
  }

  const parsedData = JSON.parse(game.gameData) as GameData
  const typeName = getTemplateName(game.gameType as GameType)

  const handleSave = async (name: string, gameData: GameData) => {
    try {
      await updateGame({ id, name, gameData })
      toast.success('Game updated!')
      router.push('/games')
    } catch {
      toast.error('Failed to update game')
    }
  }

  const handleCancel = () => {
    router.push('/games')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Games
        </Link>
        <h1 className="text-2xl font-bold font-display">Edit {typeName} Game</h1>
      </div>

      {game.gameType === GameType.FLASHCARDS && (
        <FlashcardsBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as FlashcardsGameData} />
      )}
      {game.gameType === GameType.PAIRS && (
        <PairsBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as PairsGameData} />
      )}
      {game.gameType === GameType.SPLAT && (
        <SplatBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as SplatGameData} />
      )}
      {game.gameType === GameType.SWIPE && (
        <SwipeBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as SwipeGameData} />
      )}
      {game.gameType === GameType.MULTIPLE_CHOICE && (
        <MultipleChoiceBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as MultipleChoiceGameData} />
      )}
      {game.gameType === GameType.FILL_IN_THE_BLANK && (
        <FillInTheBlankBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as FillInTheBlankGameData} />
      )}
      {game.gameType === GameType.SPEED_ROUND && (
        <SpeedRoundBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as SpeedRoundGameData} />
      )}
      {game.gameType === GameType.ANAGRAM && (
        <AnagramBuilder onSave={handleSave} onCancel={handleCancel} initialName={game.name} initialData={parsedData as AnagramGameData} />
      )}
    </div>
  )
}
