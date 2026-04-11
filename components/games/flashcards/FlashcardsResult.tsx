'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, XCircle, BookOpen, RotateCcw, Home, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlashcardsResultProps {
  totalCards: number
  knownCards: number
  unknownCards: number
  time: number
  reviewMode: boolean
  onReviewUnknown: () => void
  onPlayAgain: () => void
  onExit: () => void
}

export default function FlashcardsResult({
  totalCards,
  knownCards,
  unknownCards,
  time,
  reviewMode,
  onReviewUnknown,
  onPlayAgain,
  onExit,
}: FlashcardsResultProps) {
  const percentage = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const performance =
    percentage >= 90 ? { text: 'Excellent!', color: 'text-green-600' }
    : percentage >= 75 ? { text: 'Great Job!', color: 'text-blue-600' }
    : percentage >= 50 ? { text: 'Good Effort!', color: 'text-yellow-600' }
    : { text: 'Keep Practising!', color: 'text-orange-600' }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-4 border-blue-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-6">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              {reviewMode ? 'Review Complete!' : 'Session Complete!'}
            </CardTitle>
            <p className={cn('text-xl font-semibold mt-1', performance.color)}>{performance.text}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="text-6xl font-bold text-foreground">{percentage}%</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 text-center">
                  <BookOpen className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-blue-700">{totalCards}</div>
                  <div className="text-xs text-blue-600">Total Cards</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-700">{knownCards}</div>
                  <div className="text-xs text-green-600">Known</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-4 text-center">
                  <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-red-700">{unknownCards}</div>
                  <div className="text-xs text-red-600">Need Review</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-base">
                <Clock className="mr-2 h-4 w-4" />
                {formatTime(time)}
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              {unknownCards > 0 && !reviewMode && (
                <Button onClick={onReviewUnknown} className="w-full" size="lg">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Review {unknownCards} Unknown Card{unknownCards !== 1 ? 's' : ''}
                </Button>
              )}
              <div className="flex gap-2">
                <Button onClick={onPlayAgain} variant="outline" size="lg" className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Study Again
                </Button>
                <Button onClick={onExit} variant="outline" size="lg" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Exit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
