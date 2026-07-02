'use client'

import { useState, useCallback } from 'react'
import { SwipeGameData } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Move, Home, Undo2, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { computeSwipeScore, applyUndo, SwipeRecord } from '@/lib/game-logic/swipe'
import { shuffleArray } from '@/lib/game-logic/flashcards'
import SwipeCard from './SwipeCard'
import SwipeResult from './SwipeResult'

interface SwipeGameProps {
  gameData: SwipeGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

export default function SwipeGame({ gameData, gameName, onComplete, onExit }: SwipeGameProps) {
  const [items] = useState(() => shuffleArray([...gameData.items]))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [records, setRecords] = useState<SwipeRecord[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(() => Date.now())
  const [cardKey, setCardKey] = useState(0)

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const item = items[currentIndex]
    if (!item) return
    const correct = direction === 'right' ? item.isCorrect : !item.isCorrect
    const newRecords = [...records, { itemId: item.id, swiped: direction, correct }]
    setRecords(newRecords)

    const nextIndex = currentIndex + 1
    if (nextIndex >= items.length) {
      setIsComplete(true)
      const { scorePercentage } = computeSwipeScore(newRecords)
      onComplete({ scorePercentage, timeTaken: Math.floor((Date.now() - startTime) / 1000) })
    } else {
      setCurrentIndex(nextIndex)
      setCardKey((k) => k + 1)
    }
  }, [currentIndex, items, records, startTime, onComplete])

  const handleUndo = () => {
    if (records.length === 0) return
    setRecords(applyUndo(records))
    setCurrentIndex((i) => Math.max(0, i - 1))
    setCardKey((k) => k + 1)
  }

  if (isComplete) {
    return (
      <SwipeResult
        records={records}
        items={items}
        onPlayAgain={() => window.location.reload()}
        onExit={onExit}
      />
    )
  }

  const { correctCount } = computeSwipeScore(records)
  const item = items[currentIndex]

  return (
    <div className="p-4 max-w-lg mx-auto">
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Move className="h-5 w-5 text-pink-500" />
            <h1 className="font-bold">{gameName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentIndex + 1}/{items.length}</Badge>
            <Badge variant="outline" className="text-green-600">{correctCount} correct</Badge>
          </div>
        </div>
      </Card>

      <div className="text-center mb-4 text-sm text-muted-foreground">
        Swipe right for <span className="text-green-600 font-medium">correct</span> · Swipe left for <span className="text-red-500 font-medium">wrong</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={cardKey} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
          <SwipeCard statement={item.statement} onSwipe={handleSwipe} />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <Button variant="outline" size="lg" onClick={() => handleSwipe('left')} className="flex-1 mr-2 border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-950/40">
          <XCircle className="mr-2 h-5 w-5 text-red-600" />Wrong
        </Button>
        <Button variant="ghost" onClick={handleUndo} disabled={records.length === 0}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" onClick={() => handleSwipe('right')} className="flex-1 ml-2 border-green-200 hover:bg-green-50 dark:border-green-500/30 dark:hover:bg-green-950/40">
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" />Correct
        </Button>
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="ghost" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
      </div>
    </div>
  )
}
