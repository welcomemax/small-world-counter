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

function startedGame(skyIslands = false) {
  const market = COLUMN.reduce(
    (current, combo, index) => setSlotCombo(current, index, combo),
    emptyMarket(),
  )
  let game = createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 3,
    firstPlayerIndex: 0,
    market,
    expansions: { skyIslands },
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

/** Anna declined, Boris expanded: Anna must now pick a new combo. */
function awaitingSelectGame() {
  let game = startedGame()
  game = applyTurn(game, { action: 'decline', score: { total: 3 } })
  game = applyTurn(game, { action: 'expand', score: { total: 1 } })
  return game
}

function renderLive(recordTurn = vi.fn(), game = startedGame()) {
  const value: GameContextValue = {
    game,
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
    fireEvent.click(screen.getByRole('button', { name: 'Увеличить: Бонусы' }))
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

describe('LiveScreen combo pick after decline', () => {
  test('leaves every draft row unpicked so the turn cannot be recorded by accident', () => {
    const recordTurn = renderLive(vi.fn(), awaitingSelectGame())

    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0)
    const submit = screen.getByRole('button', {
      name: 'Взять связку и записать ход',
    })
    expect(submit.hasAttribute('disabled')).toBe(true)

    fireEvent.click(submit)
    expect(recordTurn).not.toHaveBeenCalled()
  })

  test('records the row the player picked', () => {
    const recordTurn = renderLive(vi.fn(), awaitingSelectGame())
    fireEvent.click(screen.getAllByRole('button', { pressed: false })[2]!)

    expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(1)
    fireEvent.click(
      screen.getByRole('button', { name: 'Взять связку и записать ход' }),
    )

    expect(recordTurn).toHaveBeenCalledWith({
      action: 'select',
      marketIndex: 2,
      score: { total: 0, activeRegions: 0, declineRegions: 0, bonus: 0 },
    })
  })
})

describe('LiveScreen Sky Islands wiring', () => {
  test('shows the island-control reminder in an enabled live game', () => {
    renderLive(vi.fn(), startedGame(true))

    expect(
      screen.getByText(
        'Небесные острова: +1 за каждый остров, целиком занятый одной вашей расой (активной или в упадке). Озеро занимать не обязательно.',
      ),
    ).toBeTruthy()
  })

  test('lets a live editor choose Sky Islands tiles when enabled', () => {
    renderLive(vi.fn(), startedGame(true))
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Править связку' })[5]!,
    )

    expect(screen.getByRole('option', { name: 'Ханы (Khans)' })).toBeTruthy()
    expect(
      screen.getByRole('option', { name: 'Золотоносные (Goldsmith)' }),
    ).toBeTruthy()
  })

  test('uses the enabled expansion pool for live replacements', () => {
    const random = vi.spyOn(Math, 'random').mockReturnValue(0.999)
    const game = startedGame(true)
    const setMarketCombo = vi.fn()
    const value: GameContextValue = {
      game,
      screen: 'live',
      handover: null,
      startGame: vi.fn(),
      recordTurn: vi.fn(),
      undoTurn: vi.fn(),
      setMarketCombo,
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

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Случайная связка для строки 6',
      }),
    )

    expect(setMarketCombo).toHaveBeenCalledWith(5, {
      race: 'stormGiants',
      power: 'haggling',
    })
    random.mockRestore()
  })
})
