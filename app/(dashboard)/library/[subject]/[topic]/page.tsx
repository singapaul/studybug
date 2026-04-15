'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Play, BookOpen, Copy, Check } from 'lucide-react'
import { useLibraryTopic, useCloneLibraryDeck, LibraryItem } from '@/hooks/use-library'
import { usePlan } from '@/hooks/use-plan'
import { GameCompleteModal } from '@/components/games/GameCompleteModal'
import { availableGameTypes, toFlashcardsData, toPairsData, toMultipleChoiceData, toSpeedRoundData, toAnagramData, toFillInTheBlankData } from '@/lib/library-utils'
import {
  GameType,
  FlashcardsGameData,
  PairsGameData,
  MultipleChoiceGameData,
  SpeedRoundGameData,
  AnagramGameData,
  FillInTheBlankGameData,
} from '@/types/game'
import { getTemplateName, getTemplateColor } from '@/lib/game-templates'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import FlashcardsGame from '@/components/games/flashcards/FlashcardsGame'
import PairsGame from '@/components/games/pairs/PairsGame'
import MultipleChoiceGame from '@/components/games/multiple-choice/MultipleChoiceGame'
import SpeedRoundGame from '@/components/games/speed-round/SpeedRoundGame'
import AnagramGame from '@/components/games/anagram/AnagramGame'
import FillInTheBlankGame from '@/components/games/fill-in-the-blank/FillInTheBlankGame'

type Phase = 'lobby' | 'playing'

export default function LibraryTopicPage() {
  const params = useParams()
  const router = useRouter()
  const subjectSlug = params?.subject as string
  const topicSlug = params?.topic as string

  const [phase, setPhase] = useState<Phase>('lobby')
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null)
  const [clonedType, setClonedType] = useState<GameType | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const [completeResult, setCompleteResult] = useState<{ scorePercentage: number; timeTaken: number } | null>(null)

  const { data, isLoading, isError } = useLibraryTopic(subjectSlug, topicSlug)
  const { isPro } = usePlan()
  const { mutate: cloneDeck, isPending: isCloning } = useCloneLibraryDeck()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground mb-3">Topic not found.</p>
        <Link href={`/library/${subjectSlug}`} className="text-primary underline">
          Back to {subjectSlug}
        </Link>
      </div>
    )
  }

  const { subject, topic, deck } = data
  const items = (deck?.items ?? []) as LibraryItem[]
  const available = availableGameTypes(items)

  const handlePlay = (gameType: GameType) => {
    setSelectedGameType(gameType)
    setPhase('playing')
  }

  const handleExit = () => {
    setPhase('lobby')
    setSelectedGameType(null)
  }

  const handleClone = (gameType: GameType) => {
    cloneDeck(
      { subjectSlug, topicSlug, gameType },
      {
        onSuccess: (game) => {
          setClonedType(gameType)
          toast.success(`Added "${game.name}" to your library`)
          setTimeout(() => setClonedType(null), 2000)
        },
        onError: (err: Error & { code?: string }) => {
          if (err.code === 'GAME_LIMIT_REACHED') {
            toast.error('Free plan limit reached — upgrade to Pro to save more games')
          } else if (err.code === 'GAME_TYPE_RESTRICTED') {
            toast.error('This game type requires Pro')
          } else {
            toast.error('Failed to clone deck')
          }
        },
      },
    )
  }

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link
          href={`/library/${subjectSlug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          ← {subject.name}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0',
              subject.color,
            )}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{topic.name}</h1>
            <p className="text-sm text-muted-foreground">{subject.name}</p>
          </div>
        </div>

        {deck ? (
          <>
            <div className="flex items-center gap-2 mt-3 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground">{deck.itemCount} items</span>
              {deck.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {topic.description && (
              <p className="text-sm text-muted-foreground mb-6">{topic.description}</p>
            )}

            <h2 className="text-sm font-semibold text-foreground mb-3">Choose a game type</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {available.map((gameType) => {
                const name = getTemplateName(gameType)
                const color = getTemplateColor(gameType)
                const wasCloned = clonedType === gameType
                return (
                  <div key={gameType} className="flex flex-col gap-2">
                    <button
                      onClick={() => handlePlay(gameType)}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-xl border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left',
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          color,
                        )}
                      >
                        <Play className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{name}</span>
                    </button>

                    {isPro && (
                      <button
                        onClick={() => handleClone(gameType)}
                        disabled={isCloning}
                        className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {wasCloned ? (
                          <>
                            <Check className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Saved</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Save to library
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {available.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No game types are available for this deck yet.
              </p>
            )}

            {!isPro && (
              <p className="text-xs text-muted-foreground">
                <Link href="/pricing" className="underline hover:text-foreground">
                  Upgrade to Pro
                </Link>{' '}
                to save decks to your library.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">No deck available for this topic yet.</p>
        )}
      </div>
    )
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  if (!deck || !selectedGameType) return null

  const handleLibraryComplete = (result: { scorePercentage: number; timeTaken: number }) => {
    setCompleteResult(result)
  }

  const gameName = deck.name

  const modal = (
    <GameCompleteModal
      open={!!completeResult}
      result={completeResult ?? { scorePercentage: 0, timeTaken: 0 }}
      previousBest={null}
      isPro={isPro}
      isLibraryPlay
      subjectSlug={subjectSlug}
      topicSlug={topicSlug}
      onPlayAgain={() => { setCompleteResult(null); setGameKey((k) => k + 1) }}
      onClose={handleExit}
    />
  )

  if (selectedGameType === GameType.FLASHCARDS) {
    return (
      <div className="p-4">
        <FlashcardsGame
          key={gameKey}
          gameData={toFlashcardsData(items) as FlashcardsGameData}
          gameName={gameName}
          onComplete={handleLibraryComplete}
          onExit={handleExit}
        />
        {modal}
      </div>
    )
  }

  if (selectedGameType === GameType.PAIRS) {
    return (
      <div className="p-4">
        <PairsGame
          key={gameKey}
          gameData={toPairsData(items) as PairsGameData}
          gameName={gameName}
          onComplete={handleLibraryComplete}
          onExit={handleExit}
        />
        {modal}
      </div>
    )
  }

  if (selectedGameType === GameType.MULTIPLE_CHOICE) {
    return (
      <div className="p-4">
        <MultipleChoiceGame
          key={gameKey}
          gameData={toMultipleChoiceData(items) as MultipleChoiceGameData}
          gameName={gameName}
          onComplete={handleLibraryComplete}
          onExit={handleExit}
        />
        {modal}
      </div>
    )
  }

  if (selectedGameType === GameType.SPEED_ROUND) {
    return (
      <div className="p-4">
        <SpeedRoundGame
          key={gameKey}
          gameData={toSpeedRoundData(items) as SpeedRoundGameData}
          gameName={gameName}
          onComplete={handleLibraryComplete}
          onExit={handleExit}
        />
        {modal}
      </div>
    )
  }

  if (selectedGameType === GameType.ANAGRAM) {
    return (
      <div className="p-4">
        <AnagramGame
          key={gameKey}
          gameData={toAnagramData(items) as AnagramGameData}
          gameName={gameName}
          onComplete={handleLibraryComplete}
          onExit={handleExit}
        />
        {modal}
      </div>
    )
  }

  if (selectedGameType === GameType.FILL_IN_THE_BLANK) {
    return (
      <div className="p-4">
        <FillInTheBlankGame
          key={gameKey}
          gameData={toFillInTheBlankData(items) as FillInTheBlankGameData}
          gameName={gameName}
          onComplete={handleLibraryComplete}
          onExit={handleExit}
        />
        {modal}
      </div>
    )
  }

  return null
}
