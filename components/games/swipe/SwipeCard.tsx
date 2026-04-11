'use client'

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

interface SwipeCardProps {
  statement: string
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ statement, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-20, 20])
  const rightOpacity = useTransform(x, [0, 80], [0, 1])
  const leftOpacity = useTransform(x, [-80, 0], [1, 0])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  return (
    <div className="relative flex items-center justify-center" style={{ height: 280 }}>
      <motion.div
        drag="x"
        dragConstraints={{ left: -300, right: 300 }}
        style={{ x, rotate }}
        onDragEnd={handleDragEnd}
        className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing"
        whileDrag={{ scale: 1.05 }}
      >
        <div className="relative rounded-2xl border-4 border-pink-200 bg-white shadow-xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center">
          {/* Right indicator */}
          <motion.div style={{ opacity: rightOpacity }} className="absolute top-4 right-4 flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            <span className="font-bold text-sm">CORRECT</span>
          </motion.div>

          {/* Left indicator */}
          <motion.div style={{ opacity: leftOpacity }} className="absolute top-4 left-4 flex items-center gap-1 text-red-600">
            <span className="font-bold text-sm">WRONG</span>
            <XCircle className="h-6 w-6" />
          </motion.div>

          <h2 className="text-xl font-bold text-gray-800 leading-snug">{statement}</h2>
        </div>
      </motion.div>
    </div>
  )
}
