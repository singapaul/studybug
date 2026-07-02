'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Trophy, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react'

interface SplatResultProps {
  totalQuestions: number
  correctAnswers: number
  totalScore: number
  averageReactionMs: number
  onPlayAgain: () => void
  onExit: () => void
}

export default function SplatResult({ totalQuestions, correctAnswers, totalScore, averageReactionMs, onPlayAgain, onExit }: SplatResultProps) {
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-4 border-orange-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-full p-5">
                <Zap className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Splat Complete!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground">{totalScore}</div>
              <div className="text-muted-foreground">Total Score</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-500/30">
                <CardContent className="pt-4 text-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-green-700 dark:text-green-300">{correctAnswers}/{totalQuestions}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Correct</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-500/30">
                <CardContent className="pt-4 text-center">
                  <Zap className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-orange-700 dark:text-orange-300">{(averageReactionMs / 1000).toFixed(1)}s</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Avg Reaction</div>
                </CardContent>
              </Card>
            </div>

            <Badge variant="outline" className="w-full justify-center py-2 text-base">
              <Trophy className="mr-2 h-4 w-4" />{percentage}% Accuracy
            </Badge>

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
