import { formatCombo } from '../game/catalog'
import type { ComboMarket } from '../game/market'
import { firstFreeCombo, takenIds } from '../game/pool'
import type { Combo } from '../game/types'
import { ComboPicker } from './ComboPicker'
import { parseNonNeg } from './parseNumber'
import styles from './MarketColumn.module.css'

type Props = {
  market: ComboMarket
  selectedIndex?: number
  onSelect?: (index: number) => void
  onEditCombo?: (index: number, combo: Combo) => void
  onEditCoins?: (index: number, coins: number) => void
  editingIndex?: number | null
  onToggleEdit?: (index: number | null) => void
  idPrefix?: string
  /** Combos in play or in decline; they are gone from the stacks for good. */
  usedCombos?: Combo[]
}

export function MarketColumn({
  market,
  selectedIndex,
  onSelect,
  onEditCombo,
  onEditCoins,
  editingIndex,
  onToggleEdit,
  idPrefix = 'market',
  usedCombos = [],
}: Props) {
  const takenExcept = (index: number) =>
    takenIds([
      ...market.slots.flatMap((slot, i) =>
        slot.combo && i !== index ? [slot.combo] : [],
      ),
      ...usedCombos,
    ])

  return (
    <div className={styles.column}>
      <p className={styles.caption}>
        Шесть связок как на столе. Верхняя бесплатна, за каждую выше выбранной
        кладёте монету, а монеты с выбранной забираете.
      </p>
      {market.slots.map((slot, index) => {
        const editing = editingIndex === index
        const taken = editing ? takenExcept(index) : null
        const draft = slot.combo ?? (taken ? firstFreeCombo(taken) : null)
        const label = slot.combo
          ? formatCombo(slot.combo.race, slot.combo.power)
          : 'пусто — впишите связку'
        return (
          <div
            key={index}
            className={index === selectedIndex ? styles.selected : styles.slot}
          >
            <div className={styles.head}>
              <button
                type="button"
                className={styles.pick}
                disabled={!onSelect || !slot.combo}
                onClick={() => onSelect?.(index)}
              >
                <span className={styles.meta}>
                  {index === 0 ? 'бесплатно' : `${index} монет`}
                  {slot.coins > 0 ? ` · на связке ${slot.coins}` : ''}
                </span>
                <span className={slot.combo ? styles.name : styles.empty}>
                  {label}
                </span>
              </button>
              {onToggleEdit && (
                <button
                  type="button"
                  className={styles.edit}
                  onClick={() => onToggleEdit(editing ? null : index)}
                  aria-label={editing ? 'Закрыть правку' : 'Править связку'}
                >
                  {editing ? '×' : '✎'}
                </button>
              )}
            </div>
            {editing && onEditCombo && taken && (
              <div className={styles.editor}>
                {draft ? (
                  <ComboPicker
                    idPrefix={`${idPrefix}-${index}`}
                    value={draft}
                    taken={taken}
                    onChange={(combo) => onEditCombo(index, combo)}
                  />
                ) : (
                  <p className={styles.exhausted}>
                    Свободных рас или сил не осталось — колонка больше не
                    пополняется.
                  </p>
                )}
                {onEditCoins && (
                  <label className={styles.coins}>
                    Монет на связке
                    <input
                      type="number"
                      min={0}
                      value={slot.coins}
                      onChange={(e) =>
                        onEditCoins(index, parseNonNeg(e.target.value))
                      }
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
