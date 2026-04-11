'use client'

import React, { createContext, useContext, useState } from 'react'
import { Game, CreateGameInput } from '@/types/game'
import { SEED_GAMES } from '@/lib/mock-data'

interface GamesStoreContextValue {
  games: Game[]
  createGame: (input: CreateGameInput) => Game
  updateGame: (id: string, input: Partial<Pick<CreateGameInput, 'name' | 'gameData'>>) => Game
  deleteGame: (id: string) => void
  getGameById: (id: string) => Game | undefined
}

const GamesStoreContext = createContext<GamesStoreContextValue | null>(null)

export function GamesStoreProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = useState<Game[]>(() =>
    SEED_GAMES.map((g) => ({ ...g }))
  )

  function createGame(input: CreateGameInput): Game {
    const newGame: Game = {
      id: `game-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: 'mock-user-1',
      name: input.name,
      gameType: input.gameType,
      gameData: JSON.stringify(input.gameData),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setGames((prev) => [newGame, ...prev])
    return newGame
  }

  function updateGame(
    id: string,
    input: Partial<Pick<CreateGameInput, 'name' | 'gameData'>>
  ): Game {
    let updated!: Game
    setGames((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g
        updated = {
          ...g,
          ...(input.name !== undefined && { name: input.name }),
          ...(input.gameData !== undefined && { gameData: JSON.stringify(input.gameData) }),
          updatedAt: new Date(),
        }
        return updated
      })
    )
    return updated
  }

  function deleteGame(id: string) {
    setGames((prev) => prev.filter((g) => g.id !== id))
  }

  function getGameById(id: string): Game | undefined {
    return games.find((g) => g.id === id)
  }

  return (
    <GamesStoreContext.Provider value={{ games, createGame, updateGame, deleteGame, getGameById }}>
      {children}
    </GamesStoreContext.Provider>
  )
}

export function useGamesStore(): GamesStoreContextValue {
  const ctx = useContext(GamesStoreContext)
  if (!ctx) throw new Error('useGamesStore must be used within GamesStoreProvider')
  return ctx
}
