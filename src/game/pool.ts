import { POWER_IDS, RACE_IDS } from './catalog'
import type { PowerId, RaceId } from './catalog'
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
 * Combos taken over the whole game. Read from history, not from player state:
 * a race dropped from decline is out of the box for good and never comes back
 * to the column.
 */
export function pickedCombos(game: Game): Combo[] {
  return game.history.flatMap((turn) =>
    turn.action === 'select' && turn.newCombo ? [turn.newCombo] : [],
  )
}

/** Everything that already left the stacks: on the table, in play or in decline. */
export function combosInGame(game: Game): Combo[] {
  return [...marketCombos(game.market), ...pickedCombos(game)]
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
export function firstFreeCombo(taken: TakenIds): Combo | null {
  const race = RACE_IDS.find((id) => !taken.races.has(id))
  const power = POWER_IDS.find((id) => !taken.powers.has(id))
  return race && power ? { race, power } : null
}

export function randomIndex(length: number, rng: () => number = Math.random): number {
  if (length <= 0) return -1
  return Math.min(length - 1, Math.max(0, Math.floor(rng() * length)))
}

export function randomFreeCombo(
  taken: TakenIds,
  rng: () => number = Math.random,
): Combo | null {
  const races = RACE_IDS.filter((id) => !taken.races.has(id))
  const powers = POWER_IDS.filter((id) => !taken.powers.has(id))
  const raceIndex = randomIndex(races.length, rng)
  const powerIndex = randomIndex(powers.length, rng)
  if (raceIndex < 0 || powerIndex < 0) return null
  return { race: races[raceIndex]!, power: powers[powerIndex]! }
}

export function randomReplacementCombo(
  market: ComboMarket,
  usedCombos: Combo[],
  index: number,
  rng: () => number = Math.random,
): Combo | null {
  if (index < 0 || index >= market.slots.length) return null
  const otherRows = market.slots.flatMap((slot, slotIndex) =>
    slot.combo && slotIndex !== index ? [slot.combo] : [],
  )
  return randomFreeCombo(takenIds([...otherRows, ...usedCombos]), rng)
}
