'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { FlashcardsGameData, FlashcardItem } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, BookOpen, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import FlashcardCard from './FlashcardCard'
import { CardProgress, computeFlashcardsScore, shuffleArray } from '@/lib/game-logic/flashcards'

interface FlashcardsGameProps {
  gameData: FlashcardsGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

export default function FlashcardsGame({ gameData, gameName, onComplete, onExit }: FlashcardsGameProps) {
  const [cards, setCards] = useState<FlashcardItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState<CardProgress[]>([])
  const [time, setTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)

  const initializeGame = useCallback((shuffle = false) => {
    const cardList = shuffle ? shuffleArray(gameData.cards) : [...gameData.cards]
    setCards(cardList)
    setProgress(cardList.map((c) => ({ cardId: c.id, known: null, viewed: false })))
    setCurrentIndex(0)
    setIsFlipped(false)
    setTime(0)
    setIsGameActive(true)
    setIsComplete(false)
    setIsShuffled(shuffle)
    setReviewMode(false)
  }, [gameData.cards])

  useEffect(() => { initializeGame() }, [initializeGame])

  useEffect(() => {
    if (!isGameActive || isComplete) return
    const interval = setInterval(() => setTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isGameActive, isComplete])

  const handleFlip = () => {
    if (!progress[currentIndex]?.viewed) {
      setProgress((p) => p.map((item, i) => i === currentIndex ? { ...item, viewed: true } : item))
    }
    setIsFlipped((f) => !f)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) { setCurrentIndex((i) => i - 1); setIsFlipped(false) }
  }

  const handleNext = () => {
    if (currentIndex < cards.length - 1) { setCurrentIndex((i) => i + 1); setIsFlipped(false) }
  }

  const handleAssessment = useCallback((known: boolean) => {
    setProgress((prev) => {
      const updated = prev.map((item, i) => i === currentIndex ? { ...item, known } : item)
      const allAssessed = updated.every((p) => p.known !== null)
      if (allAssessed) {
        setIsGameActive(false)
        setIsComplete(true)
        const score = computeFlashcardsScore(updated)
        onComplete({ scorePercentage: score, timeTaken: time })
      }
      return updated
    })
    if (currentIndex < cards.length - 1) {
      setTimeout(() => { setCurrentIndex((i) => i + 1); setIsFlipped(false) }, 300)
    }
  }, [currentIndex, cards.length, time, onComplete])

  if (!cards.length || currentIndex >= cards.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Unable to load flashcards.</p>
          <Button onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
        </Card>
      </div>
    )
  }

  const knownCount = progress.filter((p) => p.known === true).length
  const unknownCount = progress.filter((p) => p.known === false).length

  if (isComplete) {
    return null
  }

  const currentCard = cards[currentIndex]
  const progressPct = ((currentIndex + 1) / cards.length) * 100

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h1 className="font-bold text-lg">{gameName}</h1>
            {reviewMode && <Badge variant="outline" className="text-orange-600 border-orange-300">Review</Badge>}
          </div>
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Card {currentIndex + 1} of {cards.length}</span>
          <span className="flex gap-3">
            <span className="text-green-600">{knownCount} known</span>
            <span className="text-red-500">{unknownCount} unknown</span>
          </span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </Card>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <FlashcardCard
            front={currentCard.front}
            back={currentCard.back}
            frontImage={currentCard.frontImage}
            backImage={currentCard.backImage}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </motion.div>
      </AnimatePresence>

      {/* Assessment buttons */}
      <AnimatePresence>
        {isFlipped && progress[currentIndex]?.known === null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-4 mt-6">
            <Button onClick={() => handleAssessment(false)} variant="outline" size="lg" className="flex-1 border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-950/40">
              <XCircle className="mr-2 h-5 w-5 text-red-600" />
              Didn&apos;t know
            </Button>
            <Button onClick={() => handleAssessment(true)} variant="outline" size="lg" className="flex-1 border-green-200 hover:bg-green-50 dark:border-green-500/30 dark:hover:bg-green-950/40">
              <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />
              Knew it
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" />Previous
        </Button>
        <div className="flex gap-1">
          {progress.map((p, i) => (
            <div key={i} className={cn('w-2 h-2 rounded-full',
              i === currentIndex && 'ring-2 ring-blue-500 ring-offset-1',
              p.known === true && 'bg-green-500',
              p.known === false && 'bg-red-500',
              p.known === null && p.viewed && 'bg-blue-300',
              p.known === null && !p.viewed && 'bg-gray-300 dark:bg-slate-600'
            )} />
          ))}
        </div>
        <Button variant="outline" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
          Next<ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="ghost" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
      </div>
    </div>
  )
}
