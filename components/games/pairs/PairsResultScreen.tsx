'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Clock, Undo2, RotateCcw, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PairsResultScreenProps {
  moves: number
  time: number
  totalPairs: number
  starRating: number
  onPlayAgain: () => void
  onExit: () => void
}

export default function PairsResultScreen({ moves, time, totalPairs, starRating, onPlayAgain, onExit }: PairsResultScreenProps) {
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const isPerfect = moves === totalPairs

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-4 border-purple-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-5">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">{isPerfect ? 'Perfect Game!' : 'Well Done!'}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex justify-center gap-2">
              {[1, 2, 3].map((star) => (
                <Star key={star} className={cn('h-10 w-10', star <= starRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300')} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 text-center">
                  <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-blue-700">{formatTime(time)}</div>
                  <div className="text-xs text-blue-600">Time</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 text-center">
                  <Undo2 className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <div className="text-xl font-bold text-purple-700">{moves}</div>
                  <div className="text-xs text-purple-600">Moves</div>
                </CardContent>
              </Card>
            </div>

            <Badge variant="outline" className={cn('w-full justify-center py-2',
              isPerfect ? 'border-green-400 bg-green-50 text-green-700' : 'border-blue-400 bg-blue-50 text-blue-700'
            )}>
              {isPerfect ? '🎯 Perfect Efficiency!' : `${totalPairs} pairs in ${moves} moves`}
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
