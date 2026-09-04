import { useId } from 'react'
import { scoreTotal, type ScoreBreakdown } from '../game/score'
import type { TurnAction } from '../game/types'
import { DiscreteSlider } from './DiscreteSlider'
import styles from './TurnScoreInput.module.css'

type Props = {
  action: TurnAction
  value: ScoreBreakdown
  reminders: string[]
  onChange: (value: ScoreBreakdown) => void
}

const MARKS = [0, 5, 10, 15, 20]

export function TurnScoreInput({
  action,
  value,
  reminders,
  onChange,
}: Props) {
  const id = useId()
  const setPart = (part: keyof ScoreBreakdown, next: number) => {
    onChange({ ...value, [part]: Math.max(0, Math.floor(next)) })
  }

  return (
    <section className={styles.card} aria-labelledby={`${id}-title`}>
      <header className={styles.header}>
        <div>
          <h2 id={`${id}-title`}>Очки этого хода</h2>
          <p>Укажите регионы и бонусы — итог сложится автоматически.</p>
        </div>
        <output className={styles.total} aria-live="polite">
          Итого: {scoreTotal(value)} монет
        </output>
      </header>

      {action === 'decline' && (
        <p className={styles.declineNote}>
          В ход упадка считайте новую расу в поле «Регионы в упадке».
        </p>
      )}

      <DiscreteSlider
        id={`${id}-decline`}
        label="Регионы в упадке"
        valueInputLabel="Точное число регионов в упадке"
        value={value.declineRegions}
        min={0}
        max={20}
        marks={MARKS}
        steppers
        onChange={(next) => setPart('declineRegions', next)}
      />

      {action !== 'decline' && (
        <DiscreteSlider
          id={`${id}-active`}
          label="Регионы активной расы"
          valueInputLabel="Точное число активных регионов"
          value={value.activeRegions}
          min={0}
          max={20}
          marks={MARKS}
          steppers
          onChange={(next) => setPart('activeRegions', next)}
        />
      )}

      <div className={styles.bonusBlock}>
        <DiscreteSlider
          id={`${id}-bonus`}
          label="Бонусы"
          valueInputLabel="Точное число бонусных монет"
          value={value.bonus}
          min={0}
          max={20}
          marks={MARKS}
          steppers
          onChange={(next) => setPart('bonus', next)}
        />
        {reminders.length > 0 && (
          <aside className={styles.reminders} aria-label="Напоминания о бонусах">
            {reminders.map((reminder) => (
              <p key={reminder}>{reminder}</p>
            ))}
          </aside>
        )}
      </div>
    </section>
  )
}
