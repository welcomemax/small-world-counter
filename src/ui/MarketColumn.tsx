import { DEFAULT_EXPANSIONS, formatCombo } from '../game/catalog'
import type { Expansions } from '../game/catalog'
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
  /** Combos still in play or in decline; wiped ones may return to the stacks. */
  usedCombos?: Combo[]
  onRandomize?: (index: number) => void
  randomizedIndex?: number | null
  randomizeEmptyOnly?: boolean
  showCaption?: boolean
  expansions?: Expansions
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
  onRandomize,
  randomizedIndex,
  randomizeEmptyOnly = false,
  showCaption = true,
  expansions = DEFAULT_EXPANSIONS,
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
      {showCaption && (
        <p className={styles.caption}>
          Шесть связок как на столе. Верхняя бесплатна, за каждую выше выбранной
          кладёте монету, а монеты с выбранной забираете.
        </p>
      )}
      {market.slots.map((slot, index) => {
        const editing = editingIndex === index
        const available = takenExcept(index)
        const taken = editing ? available : null
        const draft =
          slot.combo ?? (taken ? firstFreeCombo(taken, expansions) : null)
        const label = slot.combo
          ? formatCombo(slot.combo.race, slot.combo.power)
          : 'пусто — впишите связку'
        const selected = onSelect ? index === selectedIndex : false
        return (
          <div
            key={index}
            className={[
              styles.slot,
              selected ? styles.selected : '',
              index === randomizedIndex ? styles.dealt : '',
            ]
              .filter(Boolean)
              .join(' ')}
            data-selected={onSelect ? selected : undefined}
          >
            <div className={styles.head}>
              <button
                type="button"
                className={styles.pick}
                disabled={!onSelect || !slot.combo}
                aria-pressed={onSelect ? selected : undefined}
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
              <span className={styles.actions}>
                {onRandomize && (!randomizeEmptyOnly || !slot.combo) && (
                  <button
                    type="button"
                    className={styles.random}
                    disabled={!firstFreeCombo(available, expansions)}
                    onClick={() => onRandomize(index)}
                    aria-label={`Случайная связка для строки ${index + 1}`}
                    title="Подобрать случайную свободную связку"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
                      <circle cx="8" cy="8" r="1.35" />
                      <circle cx="16" cy="8" r="1.35" />
                      <circle cx="12" cy="12" r="1.35" />
                      <circle cx="8" cy="16" r="1.35" />
                      <circle cx="16" cy="16" r="1.35" />
                    </svg>
                  </button>
                )}
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
              </span>
            </div>
            {editing && onEditCombo && taken && (
              <div className={styles.editor}>
                {draft ? (
                  <ComboPicker
                    idPrefix={`${idPrefix}-${index}`}
                    value={draft}
                    taken={taken}
                    expansions={expansions}
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
