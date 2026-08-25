import type { CSSProperties } from 'react'
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
}: Props) {
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100
  const sliderStyle = { '--progress': `${progress}%` } as CSSProperties

  return (
    <label className={styles.control} htmlFor={id}>
      <span className={styles.heading}>
        <span>{label}</span>
        <strong>{value}</strong>
      </span>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
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
    </label>
  )
}
