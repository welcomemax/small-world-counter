// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'
import { applyTurn, createGame } from '../game/game'
import { emptyMarket, setSlotCombo } from '../game/market'
import type { Combo, Game } from '../game/types'
import {
  GameContext,
  type GameContextValue,
} from '../state/GameContext'
import { AnalyticsScreen } from './AnalyticsScreen'

const COLUMN: Combo[] = [
  { race: 'wizards', power: 'alchemist' },
  { race: 'orcs', power: 'flying' },
  { race: 'elves', power: 'forest' },
  { race: 'dwarves', power: 'hill' },
  { race: 'trolls', power: 'fortified' },
  { race: 'giants', power: 'mounted' },
]

function filledMarket() {
  return COLUMN.reduce(
    (market, combo, index) => setSlotCombo(market, index, combo),
    emptyMarket(),
  )
}

function inProgressGame(): Game {
  const market = filledMarket()
  let game = createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 2,
    market,
  })
  game = applyTurn(game, {
    action: 'select',
    marketIndex: 0,
    score: { total: 4, activeRegions: 4, declineRegions: 0, bonus: 0 },
  })
  return game
}

function finishedGame(): Game {
  let game = inProgressGame()
  game = applyTurn(game, {
    action: 'select',
    marketIndex: 0,
    score: { total: 3, activeRegions: 3, declineRegions: 0, bonus: 0 },
  })
  game = applyTurn(game, {
    action: 'expand',
    score: { total: 5, activeRegions: 5, declineRegions: 0, bonus: 0 },
  })
  game = applyTurn(game, {
    action: 'expand',
    score: { total: 2, activeRegions: 2, declineRegions: 0, bonus: 0 },
  })
  return game
}

function renderAnalytics(game: Game, extra: Partial<GameContextValue> = {}) {
  const value: GameContextValue = {
    game,
    screen: 'analytics',
    handover: null,
    startGame: vi.fn(),
    recordTurn: vi.fn(),
    undoTurn: vi.fn(),
    setMarketCombo: vi.fn(),
    setMarketCoins: vi.fn(),
    toggleHidden: vi.fn(),
    goAnalytics: vi.fn(),
    goLive: vi.fn(),
    newGame: vi.fn(),
    dismissHandover: vi.fn(),
    ...extra,
  }
  render(
    <GameContext.Provider value={value}>
      <AnalyticsScreen />
    </GameContext.Provider>,
  )
  return value
}

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
})

afterEach(cleanup)

describe('AnalyticsScreen', () => {
  test('does not offer undo from the recap', () => {
    renderAnalytics(inProgressGame())
    expect(
      screen.queryByRole('button', { name: 'Отменить последний ход' }),
    ).toBeNull()
  })

  test('asks before starting a new game while the table is still playing', () => {
    const { newGame } = renderAnalytics(inProgressGame())

    fireEvent.click(screen.getByRole('button', { name: 'Новая партия' }))
    expect(newGame).not.toHaveBeenCalled()
    expect(
      screen.getByRole('dialog', { name: 'Начать новую партию?' }),
    ).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Продолжить игру' }))
    expect(newGame).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog', { name: 'Начать новую партию?' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Новая партия' }))
    fireEvent.click(screen.getByRole('button', { name: 'Начать заново' }))
    expect(newGame).toHaveBeenCalledOnce()
  })

  test('starts a new game immediately after the table is finished', () => {
    const { newGame } = renderAnalytics(finishedGame())

    fireEvent.click(screen.getByRole('button', { name: 'Новая партия' }))
    expect(newGame).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog', { name: 'Начать новую партию?' })).toBeNull()
  })

  test('marks each player in the score list instead of chart legends', () => {
    renderAnalytics(inProgressGame())

    expect(document.querySelector('.recharts-legend-wrapper')).toBeNull()
    expect(screen.getAllByTestId('player-swatch')).toHaveLength(2)
    expect(screen.getByLabelText('Состав очков')).toBeTruthy()
    expect(screen.queryByText('Ход целиком')).toBeNull()
  })

  test('keeps recap copy at the table and drops header rules', () => {
    renderAnalytics(inProgressGame())

    expect(screen.getByText('Ход 1 из 2')).toBeTruthy()
    expect(screen.queryByText('Финал и разбор')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Правила' })).toBeNull()
    expect(screen.queryByText(/карта не записана/)).toBeNull()
    expect(screen.queryByText(/llmRecap|mapSnapshot|шаблонный разбор/i)).toBeNull()
  })

  test('calls the finished party a recap', () => {
    renderAnalytics(finishedGame())
    expect(screen.getByText('Финал и разбор')).toBeTruthy()
  })
})
