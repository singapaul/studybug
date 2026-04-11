'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Trophy, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react'

interface MultipleChoiceResultProps {
  totalQuestions: number
  correctAnswers: number
  onPlayAgain: () => void
  onExit: () => void
}

export default function MultipleChoiceResult({ totalQuestions, correctAnswers, onPlayAgain, onExit }: MultipleChoiceResultProps) {
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

  const label =
    percentage >= 90 ? 'Excellent!' :
    percentage >= 75 ? 'Great Job!' :
    percentage >= 50 ? 'Good Effort!' :
    'Keep Practising!'

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-4 border-green-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-5">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">{label}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="text-center">
              <div className="text-5xl font-bold">{percentage}%</div>
              <div className="text-muted-foreground">Score</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 text-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-green-700">{correctAnswers}</div>
                  <div className="text-xs text-green-600">Correct</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4 text-center">
                  <XCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-red-700">{totalQuestions - correctAnswers}</div>
                  <div className="text-xs text-red-600">Wrong</div>
                </CardContent>
              </Card>
            </div>

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
