import { useEffect } from 'react'
import styles from './TurnTransition.module.css'

export const TURN_TRANSITION_MS = 1400

type Props = {
  name: string
  round: number
  turnCount: number
  newRound: boolean
  opening: boolean
  onDone: () => void
}

export function TurnTransition({
  name,
  round,
  turnCount,
  newRound,
  opening,
  onDone,
}: Props) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, TURN_TRANSITION_MS)
    const skip = () => onDone()
    window.addEventListener('keydown', skip)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', skip)
    }
  }, [onDone])

  return (
    <div className={styles.overlay} role="status" onClick={onDone}>
      <div className={styles.veil} />
      <div className={styles.sweep} />
      <div className={styles.panel}>
        <p className={styles.kicker}>
          Ход {round} из {turnCount}
          {newRound ? ' · новый круг' : ''}
        </p>
        <p className={styles.name}>{name}</p>
        <p className={styles.hint}>
          {opening ? 'Начинаем — выбирайте связку' : 'Передайте счётчик'} · коснитесь,
          чтобы пропустить
        </p>
      </div>
    </div>
  )
}
