'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Gamepad2, Copy, Trash2, Loader2, Pencil, Search, Share2, X, Download } from 'lucide-react'
import { useGames, useDeleteGame, useDuplicateGame, useShareGame, useUnshareGame } from '@/hooks/use-games'
import { usePlan } from '@/hooks/use-plan'
import { GAME_TEMPLATES, getTemplateName, getTemplateColor } from '@/lib/game-templates'
import { GameType } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ShareModalState {
  gameId: string
  gameName: string
  shareToken: string
}

export default function GamesPage() {
  const router = useRouter()
  const { data: games, isLoading, isError } = useGames()
  const { mutate: deleteGame } = useDeleteGame()
  const { mutate: duplicateGame } = useDuplicateGame()
  const { mutateAsync: shareGame, isPending: isSharing } = useShareGame()
  const { mutateAsync: unshareGame, isPending: isUnsharing } = useUnshareGame()
  const { isPro } = usePlan()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<GameType | 'all'>('all')
  const [shareModal, setShareModal] = useState<ShareModalState | null>(null)

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 text-center">
        <p className="text-muted-foreground">Failed to load games. Please refresh.</p>
      </div>
    )
  }

  const gamesList = games ?? []

  const filtered = gamesList.filter((g) =>
    (activeTab === 'all' || g.gameType === activeTab) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  // Compute counts per game type for tab labels
  const counts = GAME_TEMPLATES.reduce<Record<string, number>>(
    (acc, t) => {
      acc[t.type] = gamesList.filter((g) => g.gameType === t.type).length
      return acc
    },
    {}
  )

  const isFiltering = search.trim() !== '' || activeTab !== 'all'

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
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
        <>
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games…"
              className="pl-9"
            />
          </div>

          {/* Tab filter with counts */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GameType | 'all')} className="mb-5">
            <TabsList className="h-auto flex-wrap justify-start gap-1 bg-muted p-1">
              <TabsTrigger value="all" className="text-xs">
                All ({gamesList.length})
              </TabsTrigger>
              {GAME_TEMPLATES.filter((t) => counts[t.type] > 0).map((t) => (
                <TabsTrigger key={t.type} value={t.type} className="text-xs">
                  {t.name} ({counts[t.type]})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isFiltering && (
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {filtered.length === 1 ? 'game' : 'games'} found
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No games match your search.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((game) => {
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
                    <div className="flex flex-wrap items-center gap-1 mt-3 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          router.push(`/games/edit/${game.id}`)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs"
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
                      {isPro && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2 text-xs"
                          onClick={async (e) => {
                            e.preventDefault()
                            if (game.shareToken) {
                              setShareModal({
                                gameId: game.id,
                                gameName: game.name,
                                shareToken: game.shareToken,
                              })
                            } else {
                              try {
                                const token = await shareGame(game.id)
                                setShareModal({
                                  gameId: game.id,
                                  gameName: game.name,
                                  shareToken: token,
                                })
                              } catch {
                                toast.error('Failed to generate share link')
                              }
                            }
                          }}
                        >
                          <Share2 className="h-3.5 w-3.5 mr-1" />
                          Share
                        </Button>
                      )}
                      {isPro && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 px-2 text-xs"
                          onClick={async (e) => {
                            e.preventDefault()
                            const res = await fetch(`/api/games/${game.id}/export`, { credentials: 'include' })
                            if (!res.ok) { toast.error('Export failed'); return }
                            const blob = await res.blob()
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `${game.name}.csv`
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Export
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 text-xs text-destructive hover:text-destructive"
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
        </>
      )}

      {/* Share link modal */}
      <Dialog open={!!shareModal} onOpenChange={(open) => { if (!open) setShareModal(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share &ldquo;{shareModal?.gameName}&rdquo;</DialogTitle>
          </DialogHeader>
          {shareModal && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Anyone with this link can play the game. Pro users can clone it to their library.
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/games/share/${shareModal.shareToken}`}
                  className="text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/games/share/${shareModal.shareToken}`
                    )
                    toast.success('Link copied!')
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive w-full"
                disabled={isUnsharing}
                onClick={async () => {
                  try {
                    await unshareGame(shareModal.gameId)
                    toast.success('Share link revoked')
                    setShareModal(null)
                  } catch {
                    toast.error('Failed to revoke link')
                  }
                }}
              >
                {isUnsharing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
                Revoke link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
