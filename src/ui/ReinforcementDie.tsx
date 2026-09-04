import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  DIE_FACES,
  rollReinforcementDie,
  type DieFace,
} from '../game/reinforcementDie'
import { cueForDieFace, soundEngine } from '../audio/engine'
import styles from './ReinforcementDie.module.css'
import { Button } from './Button'

const TUMBLE_STEPS = 6
const TUMBLE_STEP_MS = 110

/** Pip cells of a 3×3 face grid, so 2 and 3 read as proper die diagonals. */
const PIPS: Record<DieFace, [row: number, column: number][]> = {
  0: [],
  1: [[2, 2]],
  2: [
    [1, 1],
    [3, 3],
  ],
  3: [
    [1, 1],
    [2, 2],
    [3, 3],
  ],
}

function outcomeText(face: DieFace): string {
  return face === 0 ? 'Пусто — подкрепления нет' : `+${face} к завоеванию`
}

export function ReinforcementDie() {
  const titleId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const timers = useRef<number[]>([])
  const [open, setOpen] = useState(false)
  const [face, setFace] = useState<DieFace | null>(null)
  const [tumbleStep, setTumbleStep] = useState(0)

  const rolling = open && face === null

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
  }, [])

  const roll = useCallback(() => {
    clearTimers()
    setFace(null)
    soundEngine.play('die')

    const reveal = (next: DieFace) => {
      setFace(next)
      soundEngine.play(cueForDieFace(next))
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal(rollReinforcementDie())
      return
    }

    for (let step = 1; step <= TUMBLE_STEPS; step++) {
      timers.current.push(
        window.setTimeout(() => setTumbleStep(step), step * TUMBLE_STEP_MS),
      )
    }
    timers.current.push(
      window.setTimeout(
        () => reveal(rollReinforcementDie()),
        (TUMBLE_STEPS + 1) * TUMBLE_STEP_MS,
      ),
    )
  }, [clearTimers])

  const close = useCallback(() => {
    clearTimers()
    setOpen(false)
    setFace(null)
  }, [clearTimers])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    if (!open) return
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      close()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [close, open])

  const shownFace = face ?? DIE_FACES[tumbleStep % DIE_FACES.length]!

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="Бросить кубик подкрепления"
        title="Бросить кубик подкрепления"
        onClick={() => {
          setOpen(true)
          roll()
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
          <circle cx="8" cy="8" r="1.35" />
          <circle cx="16" cy="16" r="1.35" />
          <circle cx="12" cy="12" r="1.35" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.backdrop}
          data-dialog-backdrop
          onClick={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <section
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-busy={rolling}
          >
            <h2 id={titleId}>Кубик подкрепления</h2>
            <p className={styles.hint}>
              Три грани пустые, остальные — 1, 2 и 3. Бросок нигде не сохраняется.
            </p>

            <div className={styles.die} data-rolling={rolling} aria-hidden="true">
              {PIPS[shownFace].map(([row, column]) => (
                <span key={`${row}-${column}`} style={{ gridRow: row, gridColumn: column }} />
              ))}
            </div>

            <p className={styles.outcome} aria-live="polite">
              {face === null ? 'Кубик катится…' : outcomeText(face)}
            </p>

            <div className={styles.actions}>
              <Button size="compact" disabled={rolling} onClick={roll}>
                Бросить ещё раз
              </Button>
              <Button ref={closeRef} size="compact" onClick={close}>
                Закрыть
              </Button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}
