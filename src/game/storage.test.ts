import { afterEach, describe, expect, test } from 'vitest'
import {
  applyTurn,
  createGame,
  editMarketCombo,
  isComplete,
  playerTotal,
  undo,
} from './game'
import { emptyMarket, setSlotCombo } from './market'
import { clearSavedGame, loadGame, saveGame } from './storage'
import type { Combo } from './types'

const memory = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memory.set(k, v)
    },
    removeItem: (k: string) => {
      memory.delete(k)
    },
  },
  configurable: true,
})

afterEach(() => {
  memory.clear()
})

const TABLE_COLUMN: Combo[] = [
  { race: 'humans', power: 'merchant' },
  { race: 'orcs', power: 'flying' },
  { race: 'elves', power: 'forest' },
  { race: 'dwarves', power: 'hill' },
  { race: 'trolls', power: 'fortified' },
  { race: 'giants', power: 'mounted' },
]

function startedGame() {
  return createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 2,
    scoreHidden: true,
    firstPlayerIndex: 0,
    market: TABLE_COLUMN.reduce(
      (market, combo, i) => setSlotCombo(market, i, combo),
      emptyMarket(),
    ),
  })
}

describe('storage', () => {
  test('rehydrates a finished two-player game', () => {
    let game = startedGame()
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 4 } })
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 3 } })
    game = applyTurn(game, { action: 'expand', score: { total: 5 } })
    game = applyTurn(game, { action: 'expand', score: { total: 2 } })
    expect(isComplete(game)).toBe(true)
    saveGame(game)

    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(isComplete(loaded!)).toBe(true)
    expect(playerTotal(loaded!, 'p0')).toBe(14)
    expect(playerTotal(loaded!, 'p1')).toBe(10)
    clearSavedGame()
    expect(loadGame()).toBeNull()
  })

  test('keeps hand-entered column edits and undo history', () => {
    let game = applyTurn(startedGame(), {
      action: 'select',
      marketIndex: 1,
      score: { total: 2 },
    })
    game = editMarketCombo(game, 5, { race: 'wizards', power: 'alchemist' })
    saveGame(game)

    const loaded = loadGame()!
    expect(loaded.market.slots[5]!.combo).toEqual({
      race: 'wizards',
      power: 'alchemist',
    })
    expect(loaded.market.slots[0]!.coins).toBe(1)
    expect(undo(loaded).market.slots.map((s) => s.combo)).toEqual(TABLE_COLUMN)
  })
})
