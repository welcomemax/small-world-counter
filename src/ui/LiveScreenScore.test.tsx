// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { applyTurn, createGame } from '../game/game'
import { emptyMarket, setSlotCombo } from '../game/market'
import type { Combo } from '../game/types'
import {
  GameContext,
  type GameContextValue,
} from '../state/GameContext'
import { LiveScreen } from './LiveScreen'

const COLUMN: Combo[] = [
  { race: 'wizards', power: 'alchemist' },
  { race: 'orcs', power: 'flying' },
  { race: 'elves', power: 'forest' },
  { race: 'dwarves', power: 'hill' },
  { race: 'trolls', power: 'fortified' },
  { race: 'giants', power: 'mounted' },
]

function startedGame() {
  const market = COLUMN.reduce(
    (current, combo, index) => setSlotCombo(current, index, combo),
    emptyMarket(),
  )
  let game = createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 3,
    firstPlayerIndex: 0,
    market,
  })
  game = applyTurn(game, {
    action: 'select',
    marketIndex: 0,
    score: { total: 0 },
  })
  game = applyTurn(game, {
    action: 'select',
    marketIndex: 0,
    score: { total: 0 },
  })
  return game
}

function renderLive(recordTurn = vi.fn()) {
  const value: GameContextValue = {
    game: startedGame(),
    screen: 'live',
    handover: null,
    startGame: vi.fn(),
    recordTurn,
    undoTurn: vi.fn(),
    setMarketCombo: vi.fn(),
    setMarketCoins: vi.fn(),
    toggleHidden: vi.fn(),
    goAnalytics: vi.fn(),
    goLive: vi.fn(),
    newGame: vi.fn(),
    dismissHandover: vi.fn(),
  }
  render(
    <GameContext.Provider value={value}>
      <LiveScreen />
    </GameContext.Provider>,
  )
  return recordTurn
}

afterEach(cleanup)

describe('LiveScreen turn score', () => {
  test('submits a derived itemized score and resets the editor', () => {
    const recordTurn = renderLive()
    fireEvent.change(
      screen.getByLabelText('Точное число активных регионов'),
      { target: { value: '4' } },
    )
    fireEvent.change(
      screen.getByLabelText('Точное число регионов в упадке'),
      { target: { value: '1' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить бонусы' }))
    fireEvent.click(screen.getByRole('button', { name: 'Записать ход' }))

    expect(recordTurn).toHaveBeenCalledWith({
      action: 'expand',
      marketIndex: undefined,
      score: {
        total: 6,
        activeRegions: 4,
        declineRegions: 1,
        bonus: 1,
      },
    })
    expect(screen.getByText('Итого: 0 монет')).toBeTruthy()
  })

  test('clears active regions when switching to decline', () => {
    renderLive()
    fireEvent.change(
      screen.getByLabelText('Точное число активных регионов'),
      { target: { value: '4' } },
    )
    fireEvent.click(screen.getByRole('button', { name: 'Упадок' }))

    expect(
      screen.queryByLabelText('Точное число активных регионов'),
    ).toBeNull()
    expect(screen.getByText('Итого: 0 монет')).toBeTruthy()
  })
})
