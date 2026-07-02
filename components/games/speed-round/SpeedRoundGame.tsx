'use client'

import { useState, useEffect, useCallback } from 'react'
import { SpeedRoundGameData } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Timer, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { buildRound, computeSpeedScore, QuestionWithOptions } from '@/lib/game-logic/speed-round'

interface SpeedRoundGameProps {
  gameData: SpeedRoundGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

export default function SpeedRoundGame({ gameData, gameName, onComplete, onExit }: SpeedRoundGameProps) {
  const [round] = useState<QuestionWithOptions[]>(() => buildRound(gameData.items))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameData.timeLimit)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [attemptedCount, setAttemptedCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const finishGame = useCallback((correct: number, attempted: number) => {
    setIsComplete(true)
    onComplete({
      scorePercentage: computeSpeedScore(correct, attempted),
      timeTaken: gameData.timeLimit,
    })
  }, [gameData.timeLimit, onComplete])

  // Countdown timer
  useEffect(() => {
    if (isComplete) return
    if (timeLeft <= 0) {
      setTimedOut(true)
      finishGame(correctCount, attemptedCount)
      return
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, isComplete, correctCount, attemptedCount, finishGame])

  const handleSelect = useCallback((option: string) => {
    if (selectedOption || isComplete) return

    const currentQ = round[currentIndex]
    const isCorrect = option === currentQ.answer
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    const newAttempted = attemptedCount + 1

    if (isCorrect) setCorrectCount(newCorrect)
    setAttemptedCount(newAttempted)
    setSelectedOption(option)

    setTimeout(() => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= round.length) {
        finishGame(newCorrect, newAttempted)
      } else {
        setCurrentIndex(nextIndex)
        setSelectedOption(null)
      }
    }, 600)
  }, [selectedOption, isComplete, round, currentIndex, correctCount, attemptedCount, finishGame])

  if (isComplete || timedOut) {
    return null
  }

  const currentQ = round[currentIndex]
  const timerPct = (timeLeft / gameData.timeLimit) * 100
  const timerColor = timerPct > 50 ? 'text-green-600' : timerPct > 25 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-red-500" />
            <h1 className="font-bold">{gameName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{currentIndex + 1}/{round.length}</Badge>
            <span className={cn('text-2xl font-bold tabular-nums', timerColor)}>{timeLeft}s</span>
          </div>
        </div>
        <Progress value={timerPct} className="h-2" />
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <Card className="p-6 mb-4">
            <h2 className="text-2xl font-bold mb-6 text-center">{currentQ.question}</h2>
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map((option) => {
                const isSelected = selectedOption === option
                const isCorrect = option === currentQ.answer
                const showFeedback = !!selectedOption

                return (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    disabled={!!selectedOption}
                    className={cn(
                      'p-4 rounded-xl border-2 font-medium text-left transition-all',
                      !selectedOption && 'hover:border-primary/50 hover:bg-accent border-border bg-background',
                      isSelected && isCorrect && 'border-green-400 bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-200',
                      isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-200',
                      !isSelected && showFeedback && isCorrect && 'border-green-400 bg-green-50 text-green-800 dark:bg-green-950/50 dark:text-green-200',
                      !isSelected && showFeedback && !isCorrect && 'border-border bg-background opacity-50',
                    )}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center">
        <Button variant="ghost" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
      </div>
    </div>
  )
}
