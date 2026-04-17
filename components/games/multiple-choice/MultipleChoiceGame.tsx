'use client'

import { useState, useCallback } from 'react'
import { MultipleChoiceGameData, MultipleChoiceOption } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Home, CheckCircle2, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { shuffleArray } from '@/lib/game-logic/flashcards'

interface MultipleChoiceGameProps {
  gameData: MultipleChoiceGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

export default function MultipleChoiceGame({ gameData, gameName, onComplete, onExit }: MultipleChoiceGameProps) {
  const [questions] = useState(() => shuffleArray([...gameData.questions]))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime] = useState(() => Date.now())

  const currentQuestion = questions[currentIndex]
  const hasAnswered = selectedOption !== null

  const handleSelect = useCallback((option: MultipleChoiceOption) => {
    if (hasAnswered) return
    setSelectedOption(option.id)
    const isCorrect = option.isCorrect
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    if (isCorrect) setCorrectCount(newCorrect)

    setTimeout(() => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= questions.length) {
        setIsComplete(true)
        onComplete({
          scorePercentage: (newCorrect / questions.length) * 100,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
        })
      } else {
        setCurrentIndex(nextIndex)
        setSelectedOption(null)
      }
    }, 800)
  }, [hasAnswered, correctCount, currentIndex, questions.length, startTime, onComplete])

  if (isComplete) {
    return null
  }

  const progressPct = (currentIndex / questions.length) * 100

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h1 className="font-bold">{gameName}</h1>
          </div>
          <Badge variant="outline">{currentIndex + 1}/{questions.length}</Badge>
        </div>
        <Progress value={progressPct} className="h-2" />
      </Card>

      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <Card className="p-6 mb-4">
            <p className="text-sm text-muted-foreground mb-3">Question {currentIndex + 1}</p>
            <h2 className="text-xl font-bold mb-6">{currentQuestion.question}</h2>

            <div className="grid gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option.id
                const showFeedback = hasAnswered
                const isCorrect = option.isCorrect

                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    disabled={hasAnswered}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 font-medium transition-all',
                      !hasAnswered && 'hover:border-primary/50 hover:bg-accent',
                      isSelected && isCorrect && 'border-green-400 bg-green-50 text-green-800',
                      isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-800',
                      !isSelected && showFeedback && isCorrect && 'border-green-400 bg-green-50 text-green-800',
                      !isSelected && !showFeedback && 'border-border bg-background',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.text}</span>
                      {showFeedback && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                      {showFeedback && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
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
