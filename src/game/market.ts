import type { Combo } from './types'

export const MARKET_SIZE = 6

export type MarketSlot = {
  combo: Combo | null
  coins: number
}

export type ComboMarket = {
  slots: MarketSlot[]
}

export function emptyMarket(): ComboMarket {
  return {
    slots: Array.from({ length: MARKET_SIZE }, () => ({
      combo: null,
      coins: 0,
    })),
  }
}

export function setSlotCombo(
  market: ComboMarket,
  index: number,
  combo: Combo | null,
): ComboMarket {
  return {
    slots: market.slots.map((slot, i) => (i === index ? { ...slot, combo } : slot)),
  }
}

export function setSlotCoins(
  market: ComboMarket,
  index: number,
  coins: number,
): ComboMarket {
  return {
    slots: market.slots.map((slot, i) =>
      i === index ? { ...slot, coins: Math.max(0, coins) } : slot,
    ),
  }
}

export function isMarketReady(market: ComboMarket): boolean {
  return market.slots.every((slot) => slot.combo !== null)
}

export function takeSlot(
  market: ComboMarket,
  index: number,
): { market: ComboMarket; combo: Combo; paid: number; taken: number } {
  const slot = market.slots[index]
  if (!slot?.combo) {
    throw new Error('Впишите связку в колонку, прежде чем её брать')
  }
  const withPayments = market.slots.map((entry, i) =>
    i < index ? { ...entry, coins: entry.coins + 1 } : entry,
  )
  const remaining = withPayments.filter((_, i) => i !== index)
  remaining.push({ combo: null, coins: 0 })
  return {
    market: { slots: remaining },
    combo: slot.combo,
    paid: index,
    taken: slot.coins,
  }
}
