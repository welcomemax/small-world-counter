import { describe, expect, test } from 'vitest'
import { applyTurn, createGame } from '../game/game'
import { emptyMarket, setSlotCombo } from '../game/market'
import type { Combo } from '../game/types'
import { scoreStackData } from './charts'

const COMBOS: Combo[] = [
  { race: 'wizards', power: 'alchemist' },
  { race: 'orcs', power: 'flying' },
]

describe('scoreStackData', () => {
  test('keeps legacy totals and classifies complete itemized scores', () => {
    const market = COMBOS.reduce(
      (current, combo, index) => setSlotCombo(current, index, combo),
      emptyMarket(),
    )
    let game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      market,
    })
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
