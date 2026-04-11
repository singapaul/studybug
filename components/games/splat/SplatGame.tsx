'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SplatGameData, SplatItem } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { computeSplatScore, generateWrongAnswers } from '@/lib/game-logic/splat'
import { shuffleArray } from '@/lib/game-logic/flashcards'
import SplatResult from './SplatResult'

interface SplatGameProps {
  gameData: SplatGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

interface AnswerButton {
  text: string
  isCorrect: boolean
  x: number
  y: number
}

export default function SplatGame({ gameData, gameName, onComplete, onExit }: SplatGameProps) {
  const [items, setItems] = useState<SplatItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerButton[]>([])
  const [timeLeft, setTimeLeft] = useState(gameData.timeLimit ?? 10)
  const [totalScore, setTotalScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(Date.now())

  const timeLimitMs = (gameData.timeLimit ?? 10) * 1000

  const allAnswers = gameData.items.map((i) => i.answer)

  const setupQuestion = useCallback((questionItems: SplatItem[], index: number) => {
    const item = questionItems[index]
    const wrong = generateWrongAnswers(allAnswers, item.answer, 3)
    const opts = shuffleArray([
      { text: item.answer, isCorrect: true },
      ...wrong.map((w) => ({ text: w, isCorrect: false })),
    ])
    const positioned: AnswerButton[] = opts.map((o, i) => ({
      ...o,
      x: 10 + (i % 2) * 50 + Math.random() * 20,
      y: 10 + Math.floor(i / 2) * 40 + Math.random() * 15,
    }))
    setAnswers(positioned)
    setTimeLeft(gameData.timeLimit ?? 10)
    setQuestionStartTime(Date.now())
  }, [allAnswers, gameData.timeLimit])

  const finishGame = useCallback((finalItems: SplatItem[], correct: number, score: number, reactions: number[]) => {
    setIsComplete(true)
    setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
    onComplete({ scorePercentage: finalItems.length > 0 ? (correct / finalItems.length) * 100 : 0, timeTaken: Math.floor((Date.now() - startTimeRef.current) / 1000) })
  }, [onComplete])

  useEffect(() => {
    const shuffled = shuffleArray([...gameData.items])
    setItems(shuffled)
    startTimeRef.current = Date.now()
    setupQuestion(shuffled, 0)
  }, [gameData.items, setupQuestion])

  useEffect(() => {
    if (isComplete || items.length === 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // Time ran out — count as wrong
          clearInterval(timerRef.current!)
          const reaction = timeLimitMs
          const score = computeSplatScore(false, reaction, timeLimitMs)
          const newReactions = [...reactionTimes, reaction]
          const nextIndex = currentIndex + 1
          if (nextIndex >= items.length) {
            finishGame(items, correctCount, totalScore + score, newReactions)
          } else {
            setReactionTimes(newReactions)
            setTotalScore((s) => s + score)
            setCurrentIndex(nextIndex)
            setupQuestion(items, nextIndex)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [currentIndex, items, isComplete])

  const handleAnswer = (isCorrect: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const reaction = Date.now() - questionStartTime
    const score = computeSplatScore(isCorrect, reaction, timeLimitMs)
    setFeedback(isCorrect ? 'correct' : 'wrong')
    const newReactions = [...reactionTimes, reaction]
    const newCorrect = correctCount + (isCorrect ? 1 : 0)
    const newScore = totalScore + score
    setReactionTimes(newReactions)
    setTotalScore(newScore)
    setCorrectCount(newCorrect)

    setTimeout(() => {
      setFeedback(null)
      const nextIndex = currentIndex + 1
      if (nextIndex >= items.length) {
        finishGame(items, newCorrect, newScore, newReactions)
      } else {
        setCurrentIndex(nextIndex)
        setupQuestion(items, nextIndex)
      }
    }, 500)
  }

  if (isComplete) {
    const avgReaction = reactionTimes.length > 0 ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0
    return (
      <SplatResult
        totalQuestions={items.length}
        correctAnswers={correctCount}
        totalScore={totalScore}
        averageReactionMs={avgReaction}
        onPlayAgain={() => {
          const shuffled = shuffleArray([...gameData.items])
          setItems(shuffled)
          setCurrentIndex(0)
          setTotalScore(0)
          setCorrectCount(0)
          setReactionTimes([])
          setIsComplete(false)
          startTimeRef.current = Date.now()
          setupQuestion(shuffled, 0)
        }}
        onExit={onExit}
      />
    )
  }

  if (items.length === 0) return null
  const currentItem = items[currentIndex]

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <h1 className="font-bold">{gameName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Score: {totalScore}</Badge>
            <Badge variant="outline">{currentIndex + 1}/{items.length}</Badge>
            <Badge variant={timeLeft <= 3 ? 'destructive' : 'outline'}>{timeLeft}s</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">Question {currentIndex + 1}</p>
        <h2 className="text-2xl font-bold">{currentItem.question}</h2>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            className={`mt-2 text-lg font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}
          >
            {feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
          </motion.div>
        )}
      </Card>

      <div className="relative h-64">
        <AnimatePresence>
          {answers.map((answer, i) => (
            <motion.div
              key={`${currentIndex}-${i}`}
              className="absolute"
              style={{ left: `${answer.x}%`, top: `${answer.y}%` }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="font-bold text-base px-6 py-4 shadow-md hover:scale-105 transition-transform"
                onClick={() => handleAnswer(answer.isCorrect)}
                disabled={!!feedback}
              >
                {answer.text}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-center mt-4">
        <Button variant="ghost" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
      </div>
    </div>
  )
}
