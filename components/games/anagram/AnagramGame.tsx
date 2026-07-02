'use client'

import { useState, useRef, useCallback } from 'react'
import { AnagramGameData } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shuffle, Home, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { scramble, checkAnagram } from '@/lib/game-logic/anagram'

interface AnagramGameProps {
  gameData: AnagramGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

interface LetterTile {
  key: string   // unique key for this tile instance
  letter: string
  index: number // original position in scrambled array
}

function buildTiles(letters: string[]): LetterTile[] {
  return letters.map((letter, index) => ({ key: `${letter}-${index}`, letter, index }))
}

export default function AnagramGame({ gameData, gameName, onComplete, onExit }: AnagramGameProps) {
  const items = gameData.items
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scrambledTiles, setScrambledTiles] = useState<LetterTile[]>(() =>
    buildTiles(scramble(items[0].word))
  )
  const [selectedTiles, setSelectedTiles] = useState<LetterTile[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [solvedCount, setSolvedCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const startTime = useRef(Date.now())

  const currentItem = items[currentIndex]

  const advance = useCallback((newSolved: number) => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= items.length) {
      setIsComplete(true)
      onComplete({
        scorePercentage: Math.round((newSolved / items.length) * 100),
        timeTaken: Math.floor((Date.now() - startTime.current) / 1000),
      })
    } else {
      setCurrentIndex(nextIndex)
      const nextLetters = scramble(items[nextIndex].word)
      setScrambledTiles(buildTiles(nextLetters))
      setSelectedTiles([])
      setFeedback(null)
    }
  }, [currentIndex, items, onComplete])

  const selectTile = (tile: LetterTile) => {
    if (feedback) return
    setScrambledTiles((prev) => prev.filter((t) => t.key !== tile.key))
    setSelectedTiles((prev) => [...prev, tile])
  }

  const deselectTile = (tile: LetterTile) => {
    if (feedback) return
    setSelectedTiles((prev) => prev.filter((t) => t.key !== tile.key))
    setScrambledTiles((prev) => [...prev, tile])
  }

  const handleSubmit = () => {
    if (feedback || selectedTiles.length === 0) return
    const letters = selectedTiles.map((t) => t.letter)
    const isCorrect = checkAnagram(letters, currentItem.word)
    const newSolved = solvedCount + (isCorrect ? 1 : 0)
    if (isCorrect) setSolvedCount(newSolved)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => advance(newSolved), isCorrect ? 800 : 1500)
  }

  const handleReveal = () => {
    if (feedback) return
    setFeedback('wrong')
    setTimeout(() => advance(solvedCount), 1500)
  }

  if (isComplete) {
    return null
  }

  const progressPct = (currentIndex / items.length) * 100

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-violet-500" />
            <h1 className="font-bold">{gameName}</h1>
          </div>
          <Badge variant="outline">{currentIndex + 1}/{items.length}</Badge>
        </div>
        <Progress value={progressPct} className="h-2" />
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <Card className={cn(
            'p-6 mb-4 transition-colors',
            feedback === 'correct' && 'border-green-400 bg-green-50 dark:bg-green-950/50',
            feedback === 'wrong' && 'border-red-400 bg-red-50 dark:bg-red-950/50',
          )}>
            {currentItem.hint && (
              <p className="text-sm text-muted-foreground mb-4 text-center italic">Hint: {currentItem.hint}</p>
            )}

            {/* Answer row */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2 text-center">Your answer</p>
              <div className="flex flex-wrap justify-center gap-2 min-h-[48px] p-2 rounded-lg border-2 border-dashed border-muted">
                {selectedTiles.map((tile) => (
                  <button
                    key={tile.key}
                    onClick={() => deselectTile(tile)}
                    disabled={!!feedback}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 font-bold text-lg uppercase transition-all',
                      !feedback && 'bg-primary text-primary-foreground border-primary hover:bg-primary/80',
                      feedback === 'correct' && 'bg-green-400 text-white border-green-500',
                      feedback === 'wrong' && 'bg-red-400 text-white border-red-500',
                    )}
                  >
                    {tile.letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrambled letters */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 text-center">Scrambled letters</p>
              <div className="flex flex-wrap justify-center gap-2">
                {scrambledTiles.map((tile) => (
                  <button
                    key={tile.key}
                    onClick={() => selectTile(tile)}
                    disabled={!!feedback}
                    className="w-10 h-10 rounded-lg border-2 border-border bg-background font-bold text-lg uppercase hover:border-primary hover:bg-accent transition-all"
                  >
                    {tile.letter}
                  </button>
                ))}
              </div>
            </div>

            {feedback === 'wrong' && (
              <p className="text-sm text-red-700 dark:text-red-300 font-medium text-center">
                Answer: <span className="font-bold">{currentItem.word}</span>
              </p>
            )}
            {feedback === 'correct' && (
              <p className="text-sm text-green-700 dark:text-green-300 font-medium text-center">Correct!</p>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReveal} disabled={!!feedback}>
            <Eye className="mr-2 h-4 w-4" />Reveal
          </Button>
          <Button onClick={handleSubmit} disabled={!!feedback || selectedTiles.length === 0}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
