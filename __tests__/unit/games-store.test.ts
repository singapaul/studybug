import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { GamesStoreProvider, useGamesStore } from '@/context/games-store'
import { GameType } from '@/types/game'
import React from 'react'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(GamesStoreProvider, null, children)

describe('useGamesStore', () => {
  it('initialises with seed games', () => {
    const { result } = renderHook(() => useGamesStore(), { wrapper })
    expect(result.current.games.length).toBeGreaterThan(0)
  })

  it('createGame adds a game with a generated id and returns it', () => {
    const { result } = renderHook(() => useGamesStore(), { wrapper })
    const before = result.current.games.length

    let created: ReturnType<typeof result.current.createGame>
    act(() => {
      created = result.current.createGame({
        name: 'Test Game',
        gameType: GameType.FLASHCARDS,
        gameData: { cards: [{ id: '1', front: 'Q', back: 'A' }] },
      })
    })

    expect(result.current.games.length).toBe(before + 1)
    expect(created!.id).toBeTruthy()
    expect(created!.name).toBe('Test Game')
    expect(created!.gameType).toBe(GameType.FLASHCARDS)
  })

  it('getGameById returns the correct game', () => {
    const { result } = renderHook(() => useGamesStore(), { wrapper })
    const game = result.current.games[0]
    expect(result.current.getGameById(game.id)).toEqual(game)
  })

  it('getGameById returns undefined for a missing id', () => {
    const { result } = renderHook(() => useGamesStore(), { wrapper })
    expect(result.current.getGameById('does-not-exist')).toBeUndefined()
  })

  it('deleteGame removes the game from the list', () => {
    const { result } = renderHook(() => useGamesStore(), { wrapper })
    const game = result.current.games[0]
    act(() => { result.current.deleteGame(game.id) })
    expect(result.current.getGameById(game.id)).toBeUndefined()
  })

  it('updateGame modifies the game fields', () => {
    const { result } = renderHook(() => useGamesStore(), { wrapper })
    const game = result.current.games[0]
    act(() => {
      result.current.updateGame(game.id, { name: 'Renamed Game' })
    })
    expect(result.current.getGameById(game.id)?.name).toBe('Renamed Game')
  })
})
