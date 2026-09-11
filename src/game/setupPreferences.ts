import {
  DEFAULT_EXPANSIONS,
  isSkyIslandsCombo,
  type Expansions,
} from './catalog'
import type { ComboMarket } from './market'

const KEY = 'small-world-counter.setup.expansions.v1'

export function loadExpansionPreferences(): Expansions {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      typeof (parsed as { skyIslands?: unknown }).skyIslands === 'boolean'
    ) {
      return {
        skyIslands: (parsed as { skyIslands: boolean }).skyIslands,
      }
    }
  } catch {
    // Storage can be unavailable or malformed; setup must still work.
  }
  return { ...DEFAULT_EXPANSIONS }
}

export function saveExpansionPreferences(expansions: Expansions): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(expansions))
  } catch {
    // Storage can be unavailable in private browsing; keep the in-memory choice.
  }
}

export function filterMarketForExpansions(
  market: ComboMarket,
  expansions: Expansions,
): ComboMarket {
  if (expansions.skyIslands) return market
  return {
    slots: market.slots.map((slot) =>
      slot.combo && isSkyIslandsCombo(slot.combo)
        ? { combo: null, coins: 0 }
        : slot,
    ),
  }
}
