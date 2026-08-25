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
