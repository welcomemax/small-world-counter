import { describe, expect, test } from 'vitest'
import { applyTurn, createGame } from './game'
import { handoverAfterTurn, openingHandover } from './handover'
import { emptyMarket, setSlotCombo } from './market'
import type { Combo } from './types'

const TABLE_COLUMN: Combo[] = [
  { race: 'humans', power: 'merchant' },
  { race: 'orcs', power: 'flying' },
  { race: 'elves', power: 'forest' },
  { race: 'dwarves', power: 'hill' },
  { race: 'trolls', power: 'fortified' },
  { race: 'giants', power: 'mounted' },
]

function twoPlayerGame(turnCount = 2) {
  return createGame({
    players: [{ name: 'Анна' }, { name: 'Борис' }],
    turnCount,
    firstPlayerIndex: 1,
    market: TABLE_COLUMN.reduce(
      (market, combo, index) => setSlotCombo(market, index, combo),
      emptyMarket(),
    ),
  })
}

const pick = (game: ReturnType<typeof createGame>) =>
  applyTurn(game, { action: 'select', marketIndex: 0, score: { total: 0 } })

describe('openingHandover', () => {
  test('announces the player who opens the game', () => {
    expect(openingHandover(twoPlayerGame())).toEqual({
      name: 'Борис',
      round: 1,
      turnCount: 2,
      newRound: false,
      opening: true,
    })
  })
})

describe('handoverAfterTurn', () => {
  test('announces the next player in the same round', () => {
    expect(handoverAfterTurn(pick(twoPlayerGame()))).toEqual({
      name: 'Анна',
      round: 1,
      turnCount: 2,
      newRound: false,
      opening: false,
    })
  })

  test('marks the handover that opens a new round', () => {
    const game = pick(pick(twoPlayerGame()))
    expect(handoverAfterTurn(game)).toEqual({
      name: 'Борис',
      round: 2,
      turnCount: 2,
      newRound: true,
      opening: false,
    })
  })

  test('stays silent when the recorded turn ended the game', () => {
    let game = pick(pick(twoPlayerGame()))
    game = applyTurn(game, { action: 'expand', score: { total: 0 } })
    game = applyTurn(game, { action: 'expand', score: { total: 0 } })
    expect(handoverAfterTurn(game)).toBeNull()
  })
})
