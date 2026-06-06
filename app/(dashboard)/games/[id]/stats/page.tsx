'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trophy, Target, TrendingUp, Clock, Lock } from 'lucide-react'
import { useGame, useGameAttempts } from '@/hooks/use-games'
import { usePlan } from '@/hooks/use-plan'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { CardGridSkeleton } from '@/components/skeletons'
import { computeGameStats, type GameAttemptRecord } from '@/lib/game-stats'

interface RawAttempt {
  scorePercentage: number
  timeTaken: number
  createdAt: string
}

function formatTime(ms: number): string {
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export default function GameStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isPro } = usePlan()
  const { data: game } = useGame(id)
  const { data: attempts, isLoading } = useGameAttempts(id)

  if (!isPro) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <EmptyState
          icon={Lock}
          title="Game stats are a Pro feature"
          description="Upgrade to Pro to see your performance over time for each game."
          action={<Button asChild><Link href="/#pricing">Upgrade to Pro</Link></Button>}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <CardGridSkeleton count={4} className="grid gap-4 grid-cols-2 lg:grid-cols-4" />
      </div>
    )
  }

  const records: GameAttemptRecord[] = ((attempts ?? []) as RawAttempt[]).map((a) => ({
    scorePercentage: a.scorePercentage,
    timeTaken: a.timeTaken,
    createdAt: new Date(a.createdAt),
  }))
  const stats = computeGameStats(records)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/games/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{game?.name ?? 'Game'} — Stats</h1>
          <p className="text-sm text-muted-foreground">Your performance for this game.</p>
        </div>
      </div>

      {stats.totalAttempts === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No plays yet"
          description="Play this game to start tracking your stats."
          action={<Button asChild><Link href={`/games/${id}`}>Play now</Link></Button>}
        />
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard icon={Trophy} tint="bg-yellow-100 text-yellow-600" label="Best score" value={`${stats.bestScore}%`} />
            <StatCard icon={Target} tint="bg-green-100 text-green-600" label="Average" value={`${stats.averageScore}%`} />
            <StatCard icon={TrendingUp} tint="bg-blue-100 text-blue-600" label="Plays" value={String(stats.totalAttempts)} />
            <StatCard icon={Clock} tint="bg-purple-100 text-purple-600" label="Avg time" value={formatTime(stats.averageTimeMs)} />
          </div>

          {stats.scoreSeries.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score over time</CardTitle>
                <CardDescription>
                  {stats.improvement >= 0 ? `Up ${stats.improvement}%` : `Down ${Math.abs(stats.improvement)}%`} since your first play
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1 h-28" role="img" aria-label="Score over time bar chart">
                  {stats.scoreSeries.map((score, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/80 rounded-t"
                      style={{ height: `${Math.max(score, 2)}%` }}
                      title={`${score}%`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Oldest</span>
                  <span>Latest</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon, tint, label, value,
}: { icon: typeof Trophy; tint: string; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${tint}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
