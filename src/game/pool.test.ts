import { describe, expect, test } from 'vitest'
import { RACE_IDS } from './catalog'
import { applyTurn, createGame } from './game'
import { emptyMarket, setSlotCombo } from './market'
import { combosInGame, firstFreeCombo, takenIds } from './pool'
import type { Combo, Game } from './types'

const TABLE_COLUMN: Combo[] = [
  { race: 'humans', power: 'merchant' },
  { race: 'orcs', power: 'flying' },
  { race: 'elves', power: 'forest' },
  { race: 'dwarves', power: 'hill' },
  { race: 'trolls', power: 'fortified' },
  { race: 'giants', power: 'mounted' },
]

function tableMarket() {
  return TABLE_COLUMN.reduce(
    (market, combo, i) => setSlotCombo(market, i, combo),
    emptyMarket(),
  )
}

/** Anna picks, declines, picks again and declines once more; Boris just expands. */
function gameWithDroppedDecline(): Game {
  let game = createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 6,
    market: tableMarket(),
  })
  const take = () => {
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 0 } })
  }
  const expand = () => {
    game = applyTurn(game, { action: 'expand', score: { total: 0 } })
  }
  take()
  take()
  game = applyTurn(game, { action: 'decline', score: { total: 0 } })
  expand()
  take()
  expand()
  game = applyTurn(game, { action: 'decline', score: { total: 0 } })
  expand()
  return game
}

describe('takenIds', () => {
  test('covers the column, the races in play and the ones already in decline', () => {
    const game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      market: tableMarket(),
    })
    const taken = takenIds(combosInGame(game))
    expect(taken.races.size).toBe(6)
    expect(taken.powers.size).toBe(6)
    expect(taken.races.has('humans')).toBe(true)
    expect(taken.powers.has('merchant')).toBe(true)
    expect(taken.races.has('wizards')).toBe(false)
  })

  test('keeps a race that was dropped from decline out of the pool', () => {
    const game = gameWithDroppedDecline()
    const anna = game.players[0]!
    expect(anna.declined).toEqual([{ race: 'elves', power: 'forest' }])

    const taken = takenIds(combosInGame(game))
    expect(taken.races.has('humans')).toBe(true)
    expect(taken.powers.has('merchant')).toBe(true)
    expect(taken.races.has('orcs')).toBe(true)
    expect(taken.races.has('wizards')).toBe(false)
  })
})

describe('firstFreeCombo', () => {
  test('skips races and powers that are already out of the box', () => {
    const taken = takenIds(combosInGame(gameWithDroppedDecline()))
    expect(firstFreeCombo(taken)).toEqual({
      race: 'amazons',
      power: 'alchemist',
    })
  })

  test('returns null once a stack is used up', () => {
    expect(
      firstFreeCombo({ races: new Set(RACE_IDS), powers: new Set() }),
    ).toBeNull()
  })
})
