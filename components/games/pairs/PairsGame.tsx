'use client'

import { useState, useEffect, useCallback } from 'react'
import { PairsGameData, PairsItem } from '@/types/game'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Trophy, Home, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import PairsCard from './PairsCard'
import { shuffleArray } from '@/lib/game-logic/flashcards'

interface PairsGameProps {
  gameData: PairsGameData
  gameName: string
  onComplete: (result: { scorePercentage: number; timeTaken: number }) => void
  onExit: () => void
}

interface GameCard {
  id: string
  content: string
  image?: string
  pairId: string
  isFlipped: boolean
  isMatched: boolean
}

export default function PairsGame({ gameData, gameName, onComplete, onExit }: PairsGameProps) {
  const [cards, setCards] = useState<GameCard[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const initializeGame = useCallback(() => {
    const gameCards: GameCard[] = []
    gameData.items.forEach((item: PairsItem) => {
      gameCards.push({ id: `${item.id}-left`, content: item.leftText, image: item.leftImage, pairId: item.id, isFlipped: false, isMatched: false })
      gameCards.push({ id: `${item.id}-right`, content: item.rightText, image: item.rightImage, pairId: item.id, isFlipped: false, isMatched: false })
    })
    setCards(shuffleArray(gameCards))
    setFlippedCards([])
    setMoves(0)
    setTime(0)
    setIsGameActive(true)
    setIsComplete(false)
    setIsChecking(false)
  }, [gameData.items])

  useEffect(() => { initializeGame() }, [initializeGame])

  useEffect(() => {
    if (!isGameActive || isComplete) return
    const interval = setInterval(() => setTime((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isGameActive, isComplete])

  useEffect(() => {
    if (cards.length === 0 || !isGameActive) return
    if (cards.every((c) => c.isMatched)) {
      setIsGameActive(false)
      setIsComplete(true)
      onComplete({ scorePercentage: 100, timeTaken: time })
    }
  }, [cards, isGameActive, time, onComplete])

  const handleCardClick = useCallback((cardId: string) => {
    if (isChecking || flippedCards.length >= 2 || flippedCards.includes(cardId)) return
    const card = cards.find((c) => c.id === cardId)
    if (!card || card.isMatched) return

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)
    setCards((prev) => prev.map((c) => c.id === cardId ? { ...c, isFlipped: true } : c))

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      setIsChecking(true)
      const [a, b] = newFlipped
      const cardA = cards.find((c) => c.id === a)
      const cardB = cards.find((c) => c.id === b)
      if (cardA && cardB && cardA.pairId === cardB.pairId) {
        setCards((prev) => prev.map((c) => c.id === a || c.id === b ? { ...c, isMatched: true } : c))
        setFlippedCards([])
        setIsChecking(false)
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === a || c.id === b ? { ...c, isFlipped: false } : c))
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }, [cards, flippedCards, isChecking])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const totalPairs = gameData.items.length
  const matchedPairs = cards.filter((c) => c.isMatched).length / 2

  const gridClass = cards.length <= 8 ? 'grid-cols-2 sm:grid-cols-4'
    : cards.length <= 16 ? 'grid-cols-3 sm:grid-cols-4'
    : 'grid-cols-4 sm:grid-cols-6'

  if (isComplete) {
    return null
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">{gameName}</h1>
          <div className="flex items-center gap-3">
            <Badge variant="outline"><Trophy className="mr-1 h-3 w-3" />{matchedPairs}/{totalPairs}</Badge>
            <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{formatTime(time)}</Badge>
            <Badge variant="outline">Moves: {moves}</Badge>
          </div>
        </div>
      </Card>

      <motion.div className={cn('grid gap-3', gridClass)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <AnimatePresence>
          {cards.map((card, i) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <PairsCard
                id={card.id}
                content={card.content}
                image={card.image}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                onClick={handleCardClick}
                disabled={isChecking || card.isMatched}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-center gap-3 mt-6">
        <Button variant="outline" onClick={initializeGame}><RotateCcw className="mr-2 h-4 w-4" />Restart</Button>
        <Button variant="outline" onClick={onExit}><Home className="mr-2 h-4 w-4" />Exit</Button>
      </div>
    </div>
  )
}
