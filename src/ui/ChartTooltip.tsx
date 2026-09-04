import styles from './ChartTooltip.module.css'

type Entry = {
  name?: string | number
  value?: string | number | readonly (string | number)[]
  color?: string
  dataKey?: unknown
  payload?: unknown
}

type Props = {
  active?: boolean
  label?: string | number
  payload?: readonly Entry[]
  /** Stacked bars: drop the segments a player never scored. */
  skipZeros?: boolean
}

/** Coins the hovered round added, when the series carries a per-round gain. */
function gainFor(entry: Entry): number | null {
  const row = entry.payload
  if (typeof row !== 'object' || row === null) return null
  const gains = (row as { gains?: unknown }).gains
  if (typeof gains !== 'object' || gains === null) return null
  const gain = (gains as Record<string, unknown>)[String(entry.name)]
  return typeof gain === 'number' ? gain : null
}

function formatGain(gain: number): string {
  if (gain > 0) return `+${gain}`
  if (gain < 0) return `−${Math.abs(gain)}`
  return '0'
}

function heading(label: Props['label']): string {
  if (typeof label !== 'number') return String(label ?? '')
  return label === 0 ? 'Старт' : `Ход ${label}`
}

export function ChartTooltip({ active, label, payload, skipZeros }: Props) {
  if (!active || !payload?.length) return null
  const rows = skipZeros
    ? payload.filter((entry) => Number(entry.value) > 0)
    : payload
  if (rows.length === 0) return null

  return (
    <div className={styles.tooltip}>
      <p className={styles.label}>{heading(label)}</p>
      <ul>
        {rows.map((entry, index) => {
          const gain = gainFor(entry)
          return (
            <li key={`${String(entry.name)}-${index}`} style={{ color: entry.color }}>
              <span>{entry.name}</span>
              <span className={styles.numbers}>
                <strong>{entry.value}</strong>
                {gain !== null && (
                  <em className={styles.gain}>{formatGain(gain)}</em>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
