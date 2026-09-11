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
const GAME_KEY = 'small-world-counter.game.v3'

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
  test('round-trips explicit expansion metadata', () => {
    saveGame(
      createGame({
        players: [{ name: 'Анна' }, { name: 'Борис' }],
        expansions: { skyIslands: true },
      }),
    )

    expect(loadGame()!.expansions).toEqual({ skyIslands: true })
  })

  test('hydrates a legacy base-game save with expansions disabled', () => {
    const legacy = startedGame() as Partial<ReturnType<typeof startedGame>>
    delete legacy.expansions
    memory.set(GAME_KEY, JSON.stringify(legacy))

    expect(loadGame()!.expansions).toEqual({ skyIslands: false })
  })

  test.each([
    {
      source: 'market',
      update: (stored: ReturnType<typeof startedGame>) => {
        stored.market.slots[0]!.combo = {
          race: 'wendigos',
          power: 'merchant',
        }
      },
    },
    {
      source: 'market history',
      update: (stored: ReturnType<typeof startedGame>) => {
        stored.marketHistory = [
          setSlotCombo(emptyMarket(), 0, {
            race: 'drakons',
            power: 'merchant',
          }),
        ]
      },
    },
    {
      source: 'history',
      update: (stored: ReturnType<typeof startedGame>) => {
        stored.history.push({
          action: 'select',
          score: { total: 0 },
          newCombo: { race: 'humans', power: 'airborne' },
          playerId: 'p0',
          round: 1,
          mapSnapshot: null,
        })
      },
    },
    {
      source: 'active player',
      update: (stored: ReturnType<typeof startedGame>) => {
        stored.players[0]!.activeCombo = {
          race: 'drakons',
          power: 'merchant',
        }
      },
    },
    {
      source: 'declined player',
      update: (stored: ReturnType<typeof startedGame>) => {
        stored.players[0]!.declined = [
          { race: 'humans', power: 'goldsmith' },
        ]
      },
    },
  ])('infers Sky Islands from a legacy $source combo', ({ update }) => {
    const legacy = startedGame() as Partial<ReturnType<typeof startedGame>>
    delete legacy.expansions
    update(legacy as ReturnType<typeof startedGame>)
    memory.set(GAME_KEY, JSON.stringify(legacy))

    const loaded = loadGame()!
    expect(loaded.expansions).toEqual({ skyIslands: true })
    if (loaded.history.length === 0) {
      expect(loaded.players[0]!.activeCombo).toBeNull()
      expect(loaded.players[0]!.declined).toEqual([])
    }
  })

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
