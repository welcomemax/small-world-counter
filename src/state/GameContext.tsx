import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyTurn,
  createGame,
  editMarketCoins,
  editMarketCombo,
  isComplete,
  setScoreHidden,
  undo,
} from '../game'
import { handoverAfterTurn, openingHandover, type Handover } from '../game/handover'
import { clearSavedGame, loadGame, saveGame } from '../game/storage'
import type { Combo, CreateGameInput, Game, TurnInput } from '../game/types'

export type Screen = 'setup' | 'live' | 'analytics'

export type GameContextValue = {
  game: Game | null
  screen: Screen
  handover: Handover | null
  startGame: (input: CreateGameInput) => void
  recordTurn: (input: TurnInput) => void
  undoTurn: () => void
  setMarketCombo: (index: number, combo: Combo) => void
  setMarketCoins: (index: number, coins: number) => void
  toggleHidden: (hidden: boolean) => void
  goAnalytics: () => void
  goLive: () => void
  newGame: () => void
  dismissHandover: () => void
}

export const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(() => loadGame())
  const [prefer, setPrefer] = useState<'live' | 'analytics'>('live')
  const [handover, setHandover] = useState<Handover | null>(null)

  const screen: Screen = !game
    ? 'setup'
    : isComplete(game)
      ? 'analytics'
      : prefer

  useEffect(() => {
    if (game) saveGame(game)
  }, [game])

  const startGame = useCallback((input: CreateGameInput) => {
    const created = createGame(input)
    setGame(created)
    setPrefer('live')
    setHandover(openingHandover(created))
  }, [])

  const recordTurn = useCallback(
    (input: TurnInput) => {
      if (!game) throw new Error('Нет партии')
      const next = applyTurn(game, input)
      setGame(next)
      setHandover(handoverAfterTurn(next))
    },
    [game],
  )

  const undoTurn = useCallback(() => {
    setGame((current) => (current ? undo(current) : current))
    setPrefer('live')
    setHandover(null)
  }, [])

  const setMarketCombo = useCallback((index: number, combo: Combo) => {
    setGame((current) => (current ? editMarketCombo(current, index, combo) : current))
  }, [])

  const setMarketCoins = useCallback((index: number, coins: number) => {
    setGame((current) => (current ? editMarketCoins(current, index, coins) : current))
  }, [])

  const toggleHidden = useCallback((hidden: boolean) => {
    setGame((current) => (current ? setScoreHidden(current, hidden) : current))
  }, [])

  const goAnalytics = useCallback(() => setPrefer('analytics'), [])
  const goLive = useCallback(() => setPrefer('live'), [])

  const newGame = useCallback(() => {
    clearSavedGame()
    setGame(null)
    setPrefer('live')
    setHandover(null)
  }, [])

  const dismissHandover = useCallback(() => setHandover(null), [])

  const value = useMemo(
    () => ({
      game,
      screen,
      handover,
      startGame,
      recordTurn,
      undoTurn,
      setMarketCombo,
      setMarketCoins,
      toggleHidden,
      goAnalytics,
      goLive,
      newGame,
      dismissHandover,
    }),
    [
      game,
      screen,
      handover,
      startGame,
      recordTurn,
      undoTurn,
      setMarketCombo,
      setMarketCoins,
      toggleHidden,
      goAnalytics,
      goLive,
      newGame,
      dismissHandover,
    ],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
