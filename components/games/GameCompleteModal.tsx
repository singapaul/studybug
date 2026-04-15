'use client'

import { useRouter } from 'next/navigation'
import { Trophy, Lock, RotateCcw, ArrowLeft, BarChart2, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface GameCompleteModalProps {
  open: boolean
  result: { scorePercentage: number; timeTaken: number }
  previousBest: number | null
  game?: { shareToken?: string | null }
  isPro: boolean
  isLibraryPlay?: boolean
  subjectSlug?: string
  topicSlug?: string
  onPlayAgain: () => void
  onClose: () => void
}

function getRating(score: number) {
  if (score >= 90) return { label: 'Amazing!', color: 'text-green-600' }
  if (score >= 70) return { label: 'Great work!', color: 'text-blue-600' }
  if (score >= 50) return { label: 'Good effort!', color: 'text-yellow-600' }
  return { label: 'Keep practising!', color: 'text-orange-600' }
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

export function GameCompleteModal({
  open,
  result,
  previousBest,
  game,
  isPro,
  isLibraryPlay,
  subjectSlug,
  topicSlug,
  onPlayAgain,
  onClose,
}: GameCompleteModalProps) {
  const router = useRouter()
  const { scorePercentage, timeTaken } = result
  const rating = getRating(scorePercentage)
  const isNewPersonalBest =
    previousBest !== null && scorePercentage > previousBest

  const handleCopyShare = () => {
    if (!game?.shareToken) return
    const url = `${window.location.origin}/games/share/${game.shareToken}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'))
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogTitle className="sr-only">Game complete</DialogTitle>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 pt-2">
          <span className="text-6xl font-black tabular-nums">
            {Math.round(scorePercentage)}%
          </span>
          <span className={`text-xl font-semibold ${rating.color}`}>
            {rating.label}
          </span>
          <span className="text-sm text-muted-foreground">
            Time: {formatTime(timeTaken)}
          </span>
        </div>

        {/* Personal best badge */}
        {isNewPersonalBest && (
          <div className="flex justify-center">
            <Badge className="gap-1 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100">
              <Trophy className="h-3.5 w-3.5" />
              New personal best!
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button variant="outline" onClick={onPlayAgain} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>

          <Button variant="outline" onClick={onClose} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isLibraryPlay ? 'Back to Topic' : 'Back to Games'}
          </Button>

          {isLibraryPlay ? (
            <Button
              className="col-span-2 gap-2"
              onClick={() => router.push(`/library/${subjectSlug}/${topicSlug}`)}
            >
              Save to my Library
            </Button>
          ) : (
            <>
              <Button
                variant={isPro ? 'outline' : 'ghost'}
                disabled={!isPro}
                onClick={() => isPro && router.push('/progress')}
                className="gap-2"
              >
                {!isPro && <Lock className="h-3.5 w-3.5" />}
                <BarChart2 className="h-4 w-4" />
                View Progress
              </Button>

              {game?.shareToken ? (
                <Button
                  variant={isPro ? 'outline' : 'ghost'}
                  disabled={!isPro}
                  onClick={handleCopyShare}
                  className="gap-2"
                >
                  {!isPro && <Lock className="h-3.5 w-3.5" />}
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              ) : (
                <div />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
