'use client'

import Link from 'next/link'
import { Plus, Gamepad2, Copy, Trash2, Loader2 } from 'lucide-react'
import { useGames, useDeleteGame, useDuplicateGame } from '@/hooks/use-games'
import { getTemplateName, getTemplateColor } from '@/lib/game-templates'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function GamesPage() {
  const { data: games, isLoading, isError } = useGames()
  const { mutate: deleteGame } = useDeleteGame()
  const { mutate: duplicateGame } = useDuplicateGame()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Failed to load games. Please refresh.</p>
      </div>
    )
  }

  const gamesList = games ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display">My Games</h1>
        <Button asChild>
          <Link href="/games/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Game
          </Link>
        </Button>
      </div>

      {gamesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold mb-1">No games yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first game to get started
          </p>
          <Button asChild>
            <Link href="/games/create">Create Game</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gamesList.map((game) => {
            const colorClass = getTemplateColor(game.gameType)
            const typeName = getTemplateName(game.gameType)
            const gameData = JSON.parse(game.gameData) as Record<string, unknown>
            const itemCount =
              'cards' in gameData ? (gameData.cards as unknown[]).length
              : 'items' in gameData ? (gameData.items as unknown[]).length
              : 'questions' in gameData ? (gameData.questions as unknown[]).length
              : 0

            return (
              <div
                key={game.id}
                className="group block rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md relative"
              >
                <Link href={`/games/${game.id}`} className="block">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg text-white shrink-0',
                        colorClass
                      )}
                    >
                      <Gamepad2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {typeName}
                    </span>
                  </div>
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {game.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </Link>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.preventDefault()
                      duplicateGame(game.id, {
                        onSuccess: () => toast.success('Game duplicated'),
                        onError: (err: unknown) => {
                          const code = (err as { code?: string }).code
                          if (code === 'GAME_LIMIT_REACHED') {
                            toast.error('Upgrade to Pro to duplicate more games')
                          } else {
                            toast.error('Failed to duplicate game')
                          }
                        },
                      })
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      if (confirm(`Delete "${game.name}"?`)) {
                        deleteGame(game.id, {
                          onSuccess: () => toast.success('Game deleted'),
                          onError: () => toast.error('Failed to delete game'),
                        })
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
