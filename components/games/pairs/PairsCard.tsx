'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface PairsCardProps {
  id: string
  content: string
  image?: string
  isFlipped: boolean
  isMatched: boolean
  onClick: (id: string) => void
  disabled?: boolean
}

export default function PairsCard({ id, content, image, isFlipped, isMatched, onClick, disabled = false }: PairsCardProps) {
  return (
    <div
      className={cn('relative w-full aspect-square cursor-pointer', (disabled || isMatched) && 'cursor-default')}
      onClick={() => { if (!disabled && !isFlipped && !isMatched) onClick(id) }}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped || isMatched ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl shadow-md bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center border-4 border-purple-400/50"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <Sparkles className="h-10 w-10 text-white" />
        </div>

        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 rounded-xl shadow-md flex flex-col items-center justify-center p-3 border-4',
            isMatched
              ? 'border-green-400 dark:border-green-500/50 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
              : 'border-purple-200 dark:border-purple-500/40 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
          )}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {isMatched && (
            <div className="absolute top-1.5 right-1.5 bg-green-500 rounded-full p-0.5">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          )}
          {image && <img src={image} alt={content} className="max-h-16 object-contain rounded mb-1" />}
          <div className={cn('text-center font-semibold break-words', image ? 'text-xs' : 'text-sm sm:text-base')}>
            {content}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
