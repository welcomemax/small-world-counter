import { describe, expect, test } from 'vitest'
import {
  MARKET_SIZE,
  emptyMarket,
  setSlotCoins,
  setSlotCombo,
  takeSlot,
} from './market'

function filledMarket() {
  let market = emptyMarket()
  const combos = [
    { race: 'humans', power: 'merchant' },
    { race: 'orcs', power: 'flying' },
    { race: 'elves', power: 'forest' },
    { race: 'dwarves', power: 'hill' },
    { race: 'trolls', power: 'fortified' },
    { race: 'giants', power: 'mounted' },
  ] as const
  combos.forEach((combo, i) => {
    market = setSlotCombo(market, i, combo)
  })
  return market
}

describe('emptyMarket', () => {
  test('has six blank slots waiting for the real table', () => {
    const market = emptyMarket()
    expect(market.slots).toHaveLength(MARKET_SIZE)
    expect(market.slots.every((s) => s.combo === null && s.coins === 0)).toBe(true)
  })
})

describe('setSlotCombo and setSlotCoins', () => {
  test('edits one slot without touching the others', () => {
    const market = setSlotCoins(
      setSlotCombo(emptyMarket(), 1, { race: 'ghouls', power: 'berserk' }),
      1,
      3,
    )
    expect(market.slots[1]).toEqual({
      combo: { race: 'ghouls', power: 'berserk' },
      coins: 3,
    })
    expect(market.slots[0]!.combo).toBeNull()
  })
})

describe('takeSlot', () => {
  test('top combo is free; picking lower drops a coin on each combo above', () => {
    const market = filledMarket()
    const first = takeSlot(market, 2)
    expect(first.paid).toBe(2)
    expect(first.taken).toBe(0)
    expect(first.combo).toEqual(market.slots[2]!.combo)
    expect(first.market.slots).toHaveLength(MARKET_SIZE)
    expect(first.market.slots[0]!.coins).toBe(1)
    expect(first.market.slots[1]!.coins).toBe(1)
    expect(first.market.slots[2]!.combo).toEqual(market.slots[3]!.combo)

    const second = takeSlot(first.market, 0)
    expect(second.paid).toBe(0)
    expect(second.taken).toBe(1)
  })

  test('the freed bottom slot waits to be filled from the table stack', () => {
    const taken = takeSlot(filledMarket(), 0)
    expect(taken.market.slots[5]).toEqual({ combo: null, coins: 0 })
  })

  test('refuses a slot whose combo has not been entered yet', () => {
    expect(() => takeSlot(emptyMarket(), 0)).toThrow(/колонк/i)
  })
})
