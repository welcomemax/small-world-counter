import type { CSSProperties } from 'react'
import { parseNonNeg } from './parseNumber'
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
}: Props) {
  const effectiveMax = Math.max(max, value)
  const progress =
    effectiveMax === min ? 0 : ((value - min) / (effectiveMax - min)) * 100
  const sliderStyle = { '--progress': `${progress}%` } as CSSProperties

  return (
    <div className={styles.control}>
      <span className={styles.heading}>
        <label htmlFor={id}>{label}</label>
        {valueInputLabel ? (
          <input
            className={styles.exact}
            type="number"
            min={min}
            step={1}
            value={value}
            disabled={disabled}
            aria-label={valueInputLabel}
            onChange={(event) =>
              onChange(Math.floor(parseNonNeg(event.target.value)))
            }
          />
        ) : (
          <strong>{value}</strong>
        )}
      </span>
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
      />
      <span className={styles.marks} aria-hidden="true">
        {marks.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </span>
    </div>
  )
}
