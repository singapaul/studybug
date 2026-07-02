'use client'

import { motion } from 'framer-motion'
import { RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlashcardCardProps {
  front: string
  back: string
  frontImage?: string
  backImage?: string
  isFlipped: boolean
  onFlip: () => void
}

export default function FlashcardCard({ front, back, frontImage, backImage, isFlipped, onFlip }: FlashcardCardProps) {
  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: '1000px', minHeight: '300px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl shadow-xl',
            'bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900',
            'flex flex-col items-center justify-center p-8',
            'border-4 border-blue-200 dark:border-blue-500/40 min-h-[300px]'
          )}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="text-center space-y-4 w-full max-w-xl">
            <div className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 rounded-full text-sm font-medium">
              Question
            </div>
            {frontImage && <img src={frontImage} alt="Front" className="max-h-40 object-contain rounded-lg mx-auto" />}
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{front}</h2>
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm mt-4">
              <RotateCw className="h-4 w-4 animate-pulse" />
              <span>Click to flip</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl shadow-xl',
            'bg-gradient-to-br from-white to-green-50 dark:from-slate-800 dark:to-slate-900',
            'flex flex-col items-center justify-center p-8',
            'border-4 border-green-200 dark:border-green-500/40 min-h-[300px]'
          )}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center space-y-4 w-full max-w-xl">
            <div className="inline-block px-4 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200 rounded-full text-sm font-medium">
              Answer
            </div>
            {backImage && <img src={backImage} alt="Back" className="max-h-40 object-contain rounded-lg mx-auto" />}
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{back}</h2>
            <div className="text-sm text-muted-foreground mt-4">Did you know the answer?</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
