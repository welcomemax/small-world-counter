import type { Combo } from '../game/types'
import {
  DEFAULT_EXPANSIONS,
  catalogFor,
  formatCombo,
  powerById,
  raceById,
} from '../game/catalog'
import type { Expansions, PowerId, RaceId } from '../game/catalog'
import type { TakenIds } from '../game/pool'
import styles from './ComboPicker.module.css'

type Props = {
  value: Combo
  onChange: (combo: Combo) => void
  idPrefix: string
  /** Races and powers already out of the box; the current value stays listed. */
  taken?: TakenIds
  expansions?: Expansions
}

export function ComboPicker({
  value,
  onChange,
  idPrefix,
  taken,
  expansions = DEFAULT_EXPANSIONS,
}: Props) {
  const race = raceById(value.race)
  const power = powerById(value.power)
  const hint = [power.hint, race.hint].filter(Boolean).join(' ')
  const catalog = catalogFor(expansions)
  const powers = catalog.powers.filter(
    (p) => p.id === value.power || !taken?.powers.has(p.id),
  )
  const races = catalog.races.filter(
    (r) => r.id === value.race || !taken?.races.has(r.id),
  )
  if (!powers.some(({ id }) => id === value.power)) powers.push(power)
  if (!races.some(({ id }) => id === value.race)) races.push(race)

  return (
    <div className={styles.wrap}>
      <label className={styles.field} htmlFor={`${idPrefix}-power`}>
        Сила
        <select
          id={`${idPrefix}-power`}
          value={value.power}
          onChange={(e) =>
            onChange({ ...value, power: e.target.value as PowerId })
          }
        >
          {powers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nameRu} ({p.nameEn})
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field} htmlFor={`${idPrefix}-race`}>
        Раса
        <select
          id={`${idPrefix}-race`}
          value={value.race}
          onChange={(e) =>
            onChange({ ...value, race: e.target.value as RaceId })
          }
        >
          {races.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameRu} ({r.nameEn})
            </option>
          ))}
        </select>
      </label>
      <p className={styles.preview}>{formatCombo(value.race, value.power)}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}
