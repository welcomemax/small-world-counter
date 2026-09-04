import { describe, expect, test } from 'vitest'
import { applyTurn, createGame } from '../game/game'
import { emptyMarket, setSlotCombo } from '../game/market'
import type { Combo } from '../game/types'
import { scoreLineData, scoreStackData } from './charts'

const COMBOS: Combo[] = [
  { race: 'wizards', power: 'alchemist' },
  { race: 'orcs', power: 'flying' },
  { race: 'elves', power: 'forest' },
]

function twoPlayerGame() {
  const market = COMBOS.reduce(
    (current, combo, index) => setSlotCombo(current, index, combo),
    emptyMarket(),
  )
  return createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 2,
    market,
  })
}

describe('scoreLineData', () => {
  test('reports the running total and what each round added', () => {
    let game = twoPlayerGame()
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 4 } })
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 3 } })
    game = applyTurn(game, { action: 'expand', score: { total: 5 } })
    game = applyTurn(game, { action: 'expand', score: { total: 2 } })

    expect(scoreLineData(game)).toEqual([
      { round: 0, totals: { Анна: 5, Борис: 5 }, gains: {} },
      { round: 1, totals: { Анна: 9, Борис: 8 }, gains: { Анна: 4, Борис: 3 } },
      { round: 2, totals: { Анна: 14, Борис: 10 }, gains: { Анна: 5, Борис: 2 } },
    ])
  })

  test('counts the coins paid for a lower row against that round', () => {
    let game = twoPlayerGame()
    game = applyTurn(game, { action: 'select', marketIndex: 2, score: { total: 1 } })

    expect(scoreLineData(game)[1]).toEqual({
      round: 1,
      totals: { Анна: 4, Борис: 5 },
      gains: { Анна: -1 },
    })
  })
})

describe('scoreStackData', () => {
  test('keeps legacy totals and classifies complete itemized scores', () => {
    let game = twoPlayerGame()
    game = applyTurn(game, {
      action: 'select',
      marketIndex: 0,
      score: { total: 7 },
    })
    game = applyTurn(game, {
      action: 'select',
      marketIndex: 0,
      score: {
        total: 7,
        activeRegions: 4,
        declineRegions: 1,
        bonus: 2,
      },
    })

    expect(scoreStackData(game)).toEqual([
      { name: 'Анна', active: 0, decline: 0, bonus: 0, other: 7 },
      { name: 'Борис', active: 4, decline: 1, bonus: 2, other: 0 },
    ])
  })
})
