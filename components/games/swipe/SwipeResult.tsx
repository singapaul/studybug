'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Move, Trophy, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react'
import { SwipeRecord } from '@/lib/game-logic/swipe'
import { SwipeItem } from '@/types/game'

interface SwipeResultProps {
  records: SwipeRecord[]
  items: SwipeItem[]
  onPlayAgain: () => void
  onExit: () => void
}

export default function SwipeResult({ records, items, onPlayAgain, onExit }: SwipeResultProps) {
  const correctCount = records.filter((r) => r.correct).length
  const percentage = records.length > 0 ? Math.round((correctCount / records.length) * 100) : 0
  const mistakes = records.filter((r) => !r.correct)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-4 border-pink-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-full p-5">
                <Move className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              {percentage === 100 ? 'Perfect!' : 'Swipe Complete!'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="text-center">
              <div className="text-5xl font-bold">{percentage}%</div>
              <div className="text-muted-foreground">Accuracy</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-500/30">
                <CardContent className="pt-4 text-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-green-700 dark:text-green-300">{correctCount}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Correct</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/30">
                <CardContent className="pt-4 text-center">
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-red-700 dark:text-red-300">{records.length - correctCount}</div>
                  <div className="text-xs text-red-600 dark:text-red-400">Wrong</div>
                </CardContent>
              </Card>
            </div>

            {mistakes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Review mistakes:</p>
                {mistakes.map((m) => {
                  const item = items.find((i) => i.id === m.itemId)
                  return item ? (
                    <Card key={m.itemId} className="bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-500/30 p-3">
                      <p className="text-sm font-medium">{item.statement}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Correct answer: {item.isCorrect ? 'Right (swipe right)' : 'Wrong (swipe left)'}
                      </p>
                      {item.explanation && <p className="text-xs text-muted-foreground mt-1">💡 {item.explanation}</p>}
                    </Card>
                  ) : null
                })}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onPlayAgain} className="flex-1" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />Play Again
              </Button>
              <Button onClick={onExit} variant="outline" size="lg" className="flex-1">
                <Home className="mr-2 h-4 w-4" />Exit
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
