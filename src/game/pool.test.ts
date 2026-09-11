import { describe, expect, test } from 'vitest'
import { catalogFor, RACE_IDS } from './catalog'
import { applyTurn, createGame } from './game'
import { emptyMarket, setSlotCombo } from './market'
import {
  combosInGame,
  firstFreeCombo,
  randomFreeCombo,
  randomIndex,
  randomReplacementCombo,
  takenIds,
} from './pool'
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

  test('returns a dropped in-decline race and its power to the stacks', () => {
    const game = gameWithDroppedDecline()
    const anna = game.players[0]!
    expect(anna.declined).toEqual([{ race: 'elves', power: 'forest' }])

    const taken = takenIds(combosInGame(game))
    expect(taken.races.has('humans')).toBe(false)
    expect(taken.powers.has('merchant')).toBe(false)
    expect(taken.races.has('elves')).toBe(true)
    expect(taken.powers.has('forest')).toBe(true)
    expect(taken.races.has('orcs')).toBe(true)
    expect(taken.races.has('wizards')).toBe(false)
  })

  test('keeps the only in-decline race taken until it leaves the map', () => {
    let game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      turnCount: 4,
      market: tableMarket(),
    })
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 0 } })
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 0 } })
    game = applyTurn(game, { action: 'decline', score: { total: 0 } })

    const taken = takenIds(combosInGame(game))
    expect(taken.races.has('humans')).toBe(true)
    expect(taken.powers.has('merchant')).toBe(true)
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

  test('uses only base-game ids unless Sky Islands is enabled', () => {
    const base = catalogFor({ skyIslands: false })
    const taken = {
      races: new Set(base.races.map(({ id }) => id)),
      powers: new Set(base.powers.map(({ id }) => id)),
    }

    expect(firstFreeCombo(taken)).toBeNull()
    expect(firstFreeCombo(taken, { skyIslands: true })).toEqual({
      race: 'wendigos',
      power: 'airborne',
    })
  })
})

describe('random free selection', () => {
  test('selects only from races and powers left in their stacks', () => {
    const taken = takenIds([
      { race: 'amazons', power: 'alchemist' },
      { race: 'dwarves', power: 'berserk' },
    ])
    expect(randomFreeCombo(taken, { skyIslands: false }, () => 0)).toEqual({
      race: 'elves',
      power: 'bivouacking',
    })
  })

  test('defaults deterministic selection to the base-game catalog', () => {
    const taken = takenIds([])
    expect(randomFreeCombo(taken, undefined, () => 0.999)).toEqual({
      race: 'wizards',
      power: 'wealthy',
    })
  })

  test('can select Sky Islands ids when the expansion is enabled', () => {
    expect(
      randomFreeCombo(
        takenIds([]),
        { skyIslands: true },
        () => 0.999,
      ),
    ).toEqual({
      race: 'stormGiants',
      power: 'haggling',
    })
  })

  test('returns null when either stack is exhausted', () => {
    expect(
      randomFreeCombo({ races: new Set(RACE_IDS), powers: new Set() }),
    ).toBeNull()
  })

  test('clamps random indexes to valid array bounds', () => {
    expect(randomIndex(4, () => -1)).toBe(0)
    expect(randomIndex(4, () => 1)).toBe(3)
    expect(randomIndex(0, () => 0.5)).toBe(-1)
  })
})

describe('randomReplacementCombo', () => {
  test('excludes every other market row and combos used earlier', () => {
    const used: Combo[] = [{ race: 'amazons', power: 'alchemist' }]
    expect(
      randomReplacementCombo(
        tableMarket(),
        used,
        2,
        { skyIslands: false },
        () => 0,
      ),
    ).toEqual({
      race: 'elves',
      power: 'berserk',
    })
  })

  test('rejects an invalid row and an exhausted race stack', () => {
    expect(
      randomReplacementCombo(tableMarket(), [], -1, undefined, () => 0),
    ).toBeNull()
    const allRaces: Combo[] = RACE_IDS.map((race) => ({
      race,
      power: 'alchemist',
    }))
    expect(
      randomReplacementCombo(tableMarket(), allRaces, 2, undefined, () => 0),
    ).toBeNull()
  })

  test('can replace a row with Sky Islands ids when enabled', () => {
    expect(
      randomReplacementCombo(
        emptyMarket(),
        [],
        0,
        { skyIslands: true },
        () => 0.999,
      ),
    ).toEqual({
      race: 'stormGiants',
      power: 'haggling',
    })
  })
})
