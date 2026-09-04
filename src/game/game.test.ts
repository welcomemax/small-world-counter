import { describe, expect, test } from 'vitest'
import {
  applyTurn,
  createGame,
  currentActor,
  defaultTurnCount,
  editMarketCoins,
  editMarketCombo,
  isComplete,
  playerTotal,
  undo,
  wipeDeclinedCombo,
} from './game'
import { emptyMarket, setSlotCombo } from './market'
import { combosInGame, takenIds } from './pool'
import type { Combo } from './types'

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

function twoPlayerGame(
  extras?: Partial<Parameters<typeof createGame>[0]>,
) {
  return createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount: 2,
    scoreHidden: true,
    firstPlayerIndex: 0,
    market: tableMarket(),
    ...extras,
  })
}

function openingPicks(
  game: ReturnType<typeof createGame>,
  annaScore = 0,
  borisScore = 0,
) {
  let next = applyTurn(game, {
    action: 'select',
    marketIndex: 0,
    score: { total: annaScore },
  })
  next = applyTurn(next, {
    action: 'select',
    marketIndex: 0,
    score: { total: borisScore },
  })
  return next
}

describe('defaultTurnCount', () => {
  test('uses the official map lengths by player count', () => {
    expect(defaultTurnCount(2)).toBe(10)
    expect(defaultTurnCount(3)).toBe(9)
    expect(defaultTurnCount(4)).toBe(9)
    expect(defaultTurnCount(5)).toBe(8)
  })
})

describe('createGame', () => {
  test('starts with 5 coins, no races, and the column entered from the table', () => {
    const game = twoPlayerGame()
    expect(playerTotal(game, game.players[0]!.id)).toBe(5)
    expect(game.players.every((p) => p.awaitingSelect && p.activeCombo === null)).toBe(
      true,
    )
    expect(game.market.slots.map((s) => s.combo)).toEqual(TABLE_COLUMN)
    expect(currentActor(game)).toEqual({
      playerId: game.players[0]!.id,
      round: 1,
    })
  })

  test('defaults to a blank column when the table was not entered yet', () => {
    const game = createGame({ players: [{ name: 'Анна' }, { name: 'Борис' }] })
    expect(game.market.slots.every((s) => s.combo === null)).toBe(true)
  })

  test('turn order starts from the chosen first player and goes clockwise', () => {
    const game = twoPlayerGame({ firstPlayerIndex: 1 })
    expect(currentActor(game).playerId).toBe('p1')
  })
})

describe('turn order', () => {
  test('walks the table clockwise and ends after the last round', () => {
    let game = openingPicks(twoPlayerGame())
    expect(currentActor(game)).toEqual({ playerId: 'p0', round: 2 })
    game = applyTurn(game, { action: 'expand', score: { total: 0 } })
    expect(currentActor(game)).toEqual({ playerId: 'p1', round: 2 })
    game = applyTurn(game, { action: 'expand', score: { total: 0 } })
    expect(isComplete(game)).toBe(true)
  })
})

describe('editMarketCombo and editMarketCoins', () => {
  test('corrects the column to match the table without touching the score', () => {
    let game = twoPlayerGame()
    game = editMarketCombo(game, 3, { race: 'ratmen', power: 'diplomat' })
    game = editMarketCoins(game, 3, 2)
    expect(game.market.slots[3]).toEqual({
      combo: { race: 'ratmen', power: 'diplomat' },
      coins: 2,
    })
    expect(playerTotal(game, 'p0')).toBe(5)
  })

  test('a taken slot can be refilled from the revealed banner', () => {
    let game = applyTurn(twoPlayerGame(), {
      action: 'select',
      marketIndex: 0,
      score: { total: 3 },
    })
    expect(game.market.slots[5]!.combo).toBeNull()
    game = editMarketCombo(game, 5, { race: 'wizards', power: 'alchemist' })
    expect(game.market.slots[5]!.combo).toEqual({
      race: 'wizards',
      power: 'alchemist',
    })
  })
})

describe('applyTurn', () => {
  test('first turn must pick from the combo column', () => {
    const game = twoPlayerGame()
    expect(() =>
      applyTurn(game, { action: 'expand', score: { total: 1 } }),
    ).toThrow(/select/i)

    const after = applyTurn(game, {
      action: 'select',
      marketIndex: 2,
      score: { total: 4 },
    })
    expect(after.players[0]!.awaitingSelect).toBe(false)
    expect(after.players[0]!.activeCombo).toEqual(TABLE_COLUMN[2])
    expect(playerTotal(after, 'p0')).toBe(5 - 2 + 4)
    expect(after.market.slots[0]!.coins).toBe(1)
    expect(currentActor(after).playerId).toBe('p1')
  })

  test('picking a slot pockets the coins left on it', () => {
    let game = twoPlayerGame()
    game = editMarketCoins(game, 1, 3)
    game = applyTurn(game, {
      action: 'select',
      marketIndex: 1,
      score: { total: 0 },
    })
    expect(playerTotal(game, 'p0')).toBe(5 - 1 + 3)
  })

  test('records expand scores after opening picks and rotates', () => {
    const started = openingPicks(twoPlayerGame(), 0, 0)
    const afterAnna = applyTurn(started, {
      action: 'expand',
      score: { total: 4, activeRegions: 3, declineRegions: 0, bonus: 1 },
    })
    expect(playerTotal(afterAnna, started.players[0]!.id)).toBe(9)
    expect(currentActor(afterAnna)).toEqual({
      playerId: started.players[1]!.id,
      round: 2,
    })
  })

  test('starts the next round after every player has acted', () => {
    let game = openingPicks(twoPlayerGame(), 3, 2)
    expect(currentActor(game)).toEqual({
      playerId: game.players[0]!.id,
      round: 2,
    })
    game = applyTurn(game, { action: 'expand', score: { total: 1 } })
    game = applyTurn(game, { action: 'expand', score: { total: 1 } })
    expect(isComplete(game)).toBe(true)
  })

  test('decline then select: next turn for that player must pick a new combo', () => {
    let game = openingPicks(twoPlayerGame({ turnCount: 3 }), 0, 0)
    const firstCombo = game.players[0]!.activeCombo
    game = applyTurn(game, {
      action: 'decline',
      score: { total: 5, activeRegions: 0, declineRegions: 5, bonus: 0 },
    })
    game = applyTurn(game, { action: 'expand', score: { total: 2 } })
    const anna = game.players[0]!
    expect(anna.activeCombo).toBeNull()
    expect(anna.awaitingSelect).toBe(true)
    expect(anna.declined).toEqual([firstCombo])

    expect(() =>
      applyTurn(game, { action: 'expand', score: { total: 1 } }),
    ).toThrow(/select/i)

    const slot = game.market.slots[1]!
    game = applyTurn(game, {
      action: 'select',
      marketIndex: 1,
      score: { total: 6, activeRegions: 4, declineRegions: 2, bonus: 0 },
    })
    expect(game.players[0]!.activeCombo).toEqual(slot.combo)
    expect(game.players[0]!.awaitingSelect).toBe(false)
    expect(playerTotal(game, game.players[0]!.id)).toBe(5 + 5 + 6 - 1 + slot.coins)
  })

  test('a new decline removes the previous in-decline race unless it is Spirit', () => {
    let game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      turnCount: 6,
      market: tableMarket(),
    })
    game = applyTurn(game, {
      action: 'select',
      score: { total: 0 },
      newCombo: { race: 'humans', power: 'flying' },
    })
    game = applyTurn(game, {
      action: 'select',
      score: { total: 0 },
      newCombo: { race: 'orcs', power: 'commando' },
    })
    const skipBoris = () => {
      game = applyTurn(game, { action: 'expand', score: { total: 0 } })
    }

    game = applyTurn(game, { action: 'decline', score: { total: 3 } })
    skipBoris()
    game = applyTurn(game, {
      action: 'select',
      score: { total: 4 },
      newCombo: { race: 'elves', power: 'spirit' },
    })
    skipBoris()
    game = applyTurn(game, { action: 'decline', score: { total: 4 } })
    expect(game.players[0]!.declined).toEqual([
      { race: 'humans', power: 'flying' },
      { race: 'elves', power: 'spirit' },
    ])
    skipBoris()
    game = applyTurn(game, {
      action: 'select',
      score: { total: 2 },
      newCombo: { race: 'trolls', power: 'fortified' },
    })
    skipBoris()
    game = applyTurn(game, { action: 'decline', score: { total: 2 } })
    expect(game.players[0]!.declined).toEqual([
      { race: 'elves', power: 'spirit' },
      { race: 'trolls', power: 'fortified' },
    ])
  })

  test('wiping the last declined tokens returns that race and power even if it was the only one', () => {
    let game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      turnCount: 4,
      market: tableMarket(),
    })
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 0 } })
    game = applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 0 } })
    game = applyTurn(game, { action: 'decline', score: { total: 3 } })
    expect(game.players[0]!.declined).toEqual([{ race: 'humans', power: 'merchant' }])

    game = wipeDeclinedCombo(game, game.players[0]!.id, {
      race: 'humans',
      power: 'merchant',
    })
    expect(game.players[0]!.declined).toEqual([])
    const taken = takenIds(combosInGame(game))
    expect(taken.races.has('humans')).toBe(false)
    expect(taken.powers.has('merchant')).toBe(false)
  })

  test('a wipe survives undo of a later turn', () => {
    let game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      turnCount: 4,
      market: tableMarket(),
    })
    game = applyTurn(game, {
      action: 'select',
      score: { total: 0 },
      newCombo: { race: 'humans', power: 'merchant' },
    })
    game = applyTurn(game, {
      action: 'select',
      score: { total: 0 },
      newCombo: { race: 'orcs', power: 'flying' },
    })
    game = applyTurn(game, { action: 'decline', score: { total: 3 } })
    game = wipeDeclinedCombo(game, game.players[0]!.id, {
      race: 'humans',
      power: 'merchant',
    })
    game = applyTurn(game, { action: 'expand', score: { total: 1 } })
    game = undo(game)
    expect(game.players[0]!.declined).toEqual([])
  })

  test('stores a null mapSnapshot on every recorded turn', () => {
    const game = openingPicks(twoPlayerGame(), 1, 0)
    expect(game.history[0]!.mapSnapshot).toBeNull()
  })
})

describe('undo', () => {
  test('restores totals, the column, and whose turn it is', () => {
    const started = twoPlayerGame()
    let game = applyTurn(started, {
      action: 'select',
      marketIndex: 2,
      score: { total: 9 },
    })
    game = undo(game)
    expect(playerTotal(game, started.players[0]!.id)).toBe(5)
    expect(game.market.slots.map((s) => s.combo)).toEqual(TABLE_COLUMN)
    expect(game.market.slots.every((s) => s.coins === 0)).toBe(true)
    expect(currentActor(game)).toEqual({
      playerId: started.players[0]!.id,
      round: 1,
    })
    expect(game.history).toHaveLength(0)
  })

  test('keeps the column intact when there is nothing to undo', () => {
    const game = twoPlayerGame()
    expect(undo(game).market.slots.map((s) => s.combo)).toEqual(TABLE_COLUMN)
  })
})
