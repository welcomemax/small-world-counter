import { catalogFor, DEFAULT_EXPANSIONS } from './catalog'
import type { Expansions, PowerId, RaceId } from './catalog'
import type { ComboMarket } from './market'
import type { Combo, Game } from './types'

export type TakenIds = {
  races: Set<RaceId>
  powers: Set<PowerId>
}

export function marketCombos(market: ComboMarket): Combo[] {
  return market.slots.flatMap((slot) => (slot.combo ? [slot.combo] : []))
}

/**
 * Combos currently occupying uniqueness: visible column, active races,
 * and races still in decline. A wiped or replaced in-decline combo returns
 * its race and power to the stacks.
 */
export function occupiedCombos(game: Game): Combo[] {
  return game.players.flatMap((player) => [
    ...(player.activeCombo ? [player.activeCombo] : []),
    ...player.declined,
  ])
}

export function combosInGame(game: Game): Combo[] {
  return [...marketCombos(game.market), ...occupiedCombos(game)]
}

export function takenIds(combos: Combo[]): TakenIds {
  const races = new Set<RaceId>()
  const powers = new Set<PowerId>()
  for (const combo of combos) {
    races.add(combo.race)
    powers.add(combo.power)
  }
  return { races, powers }
}

/** First race and power still in the stacks, or null once either one runs out. */
export function firstFreeCombo(
  taken: TakenIds,
  expansions: Expansions = DEFAULT_EXPANSIONS,
): Combo | null {
  const catalog = catalogFor(expansions)
  const race = catalog.races.find(({ id }) => !taken.races.has(id))?.id
  const power = catalog.powers.find(({ id }) => !taken.powers.has(id))?.id
  return race && power ? { race, power } : null
}

export function randomIndex(length: number, rng: () => number = Math.random): number {
  if (length <= 0) return -1
  return Math.min(length - 1, Math.max(0, Math.floor(rng() * length)))
}

export function randomFreeCombo(
  taken: TakenIds,
  expansions: Expansions = DEFAULT_EXPANSIONS,
  rng: () => number = Math.random,
): Combo | null {
  const catalog = catalogFor(expansions)
  const races = catalog.races
    .map(({ id }) => id)
    .filter((id) => !taken.races.has(id))
  const powers = catalog.powers
    .map(({ id }) => id)
    .filter((id) => !taken.powers.has(id))
  const raceIndex = randomIndex(races.length, rng)
  const powerIndex = randomIndex(powers.length, rng)
  if (raceIndex < 0 || powerIndex < 0) return null
  return { race: races[raceIndex]!, power: powers[powerIndex]! }
}

export function randomReplacementCombo(
  market: ComboMarket,
  usedCombos: Combo[],
  index: number,
  expansions: Expansions = DEFAULT_EXPANSIONS,
  rng: () => number = Math.random,
): Combo | null {
  if (index < 0 || index >= market.slots.length) return null
  const otherRows = market.slots.flatMap((slot, slotIndex) =>
    slot.combo && slotIndex !== index ? [slot.combo] : [],
  )
  return randomFreeCombo(
    takenIds([...otherRows, ...usedCombos]),
    expansions,
    rng,
  )
}
