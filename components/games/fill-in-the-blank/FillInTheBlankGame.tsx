'use client'

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { FillInTheBlankGameData } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PenLine, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { checkAnswer, parseSentenceParts } from '@/lib/game-logic/fill-in-the-blank'

interface FillInTheBlankGameProps {
  gameData: FillInTheBlankGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

export default function FillInTheBlankGame({ gameData, gameName, onComplete, onExit }: FillInTheBlankGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const startTime = useRef(Date.now())

  const items = gameData.items
  const currentItem = items[currentIndex]
  const { before, after } = parseSentenceParts(currentItem.sentence)

  const advance = useCallback((newCorrect: number) => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= items.length) {
      setIsComplete(true)
      onComplete({
        scorePercentage: Math.round((newCorrect / items.length) * 100),
        timeTaken: Math.floor((Date.now() - startTime.current) / 1000),
      })
    } else {
      setCurrentIndex(nextIndex)
      setUserInput('')
      setFeedback(null)
    }
  }, [currentIndex, items.length, onComplete])

  const handleSubmit = useCallback(() => {
    if (feedback) return
    const isCorrect = checkAnswer(userInput, currentItem.answer)
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    if (isCorrect) setCorrectCount(newCorrect)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setTimeout(() => advance(newCorrect), isCorrect ? 800 : 1500)
  }, [feedback, userInput, currentItem.answer, correctCount, advance])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
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
            <PenLine className="h-5 w-5 text-teal-500" />
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
            <p className="text-sm text-muted-foreground mb-4">Fill in the blank</p>

            <div className="flex flex-wrap items-center gap-2 text-xl font-medium mb-6">
              <span>{before}</span>
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!!feedback}
                autoFocus
                className={cn(
                  'w-40 inline-flex text-center',
                  feedback === 'correct' && 'border-green-500 bg-green-100',
                  feedback === 'wrong' && 'border-red-500 bg-red-100',
                )}
              />
              <span>{after}</span>
            </div>

            {feedback === 'wrong' && (
              <p className="text-sm text-red-700 font-medium">
                Correct answer: <span className="font-bold">{currentItem.answer}</span>
              </p>
            )}
            {feedback === 'correct' && (
              <p className="text-sm text-green-700 font-medium">Correct!</p>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
        <Button onClick={handleSubmit} disabled={!!feedback || !userInput.trim()}>
          Submit
        </Button>
      </div>
    </div>
  )
}
