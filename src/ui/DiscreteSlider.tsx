import { useRef, type CSSProperties } from 'react'
import { parseDigits } from './parseNumber'
import styles from './DiscreteSlider.module.css'

type Props = {
  id: string
  label: string
  value: number
  min: number
  max: number
  marks: number[]
  onChange: (value: number) => void
  disabled?: boolean
  valueInputLabel?: string
  /** Buttons on both sides of the track, for one-tap corrections. */
  steppers?: boolean
}

export function DiscreteSlider({
  id,
  label,
  value,
  min,
  max,
  marks,
  onChange,
  disabled = false,
  valueInputLabel,
  steppers = false,
}: Props) {
  const effectiveMax = Math.max(max, value)
  const progress =
    effectiveMax === min ? 0 : ((value - min) / (effectiveMax - min)) * 100
  const sliderStyle = { '--progress': `${progress}%` } as CSSProperties

  /* A range input jumps to wherever a finger lands, so a thumb that merely
     brushes the track while scrolling rewrites the turn. The browser cancels
     the pointer once it claims the gesture for a vertical pan, which is our
     cue to put the value back. */
  const valueBeforeDrag = useRef<number | null>(null)
  const undoBrush = () => {
    const before = valueBeforeDrag.current
    valueBeforeDrag.current = null
    if (before !== null && before !== value) onChange(before)
  }

  return (
    <div className={styles.control}>
      <span className={styles.heading}>
        <label htmlFor={id}>{label}</label>
        {valueInputLabel ? (
          <input
            className={styles.exact}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={value}
            disabled={disabled}
            aria-label={valueInputLabel}
            onChange={(event) =>
              onChange(Math.max(min, parseDigits(event.target.value)))
            }
          />
        ) : (
          <strong>{value}</strong>
        )}
      </span>
      <div className={styles.track}>
        {steppers && (
          <button
            type="button"
            className={styles.step}
            aria-label={`Уменьшить: ${label}`}
            disabled={disabled || value <= min}
            onClick={() => onChange(Math.max(min, value - 1))}
          >
            −
          </button>
        )}
        <div className={styles.rangeWrap}>
          <input
            id={id}
            className={styles.range}
            type="range"
            min={min}
            max={effectiveMax}
            step={1}
            value={value}
            disabled={disabled}
            style={sliderStyle}
            onChange={(event) => onChange(Number(event.target.value))}
            onPointerDown={() => {
              valueBeforeDrag.current = value
            }}
            onPointerUp={() => {
              valueBeforeDrag.current = null
            }}
            onPointerCancel={undoBrush}
          />
          <span className={styles.marks} aria-hidden="true">
            {marks.map((mark) => (
              <span key={mark}>{mark}</span>
            ))}
          </span>
        </div>
        {steppers && (
          <button
            type="button"
            className={styles.step}
            aria-label={`Увеличить: ${label}`}
            disabled={disabled}
            onClick={() => onChange(value + 1)}
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}
