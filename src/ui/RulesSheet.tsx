import { useEffect, useId, useRef } from 'react'
import { COPYRIGHT_LINE, PUBLISHER_URL } from './legal'
import { RULES_INTRO, RULES_SECTIONS, RULES_TITLE } from './rulesCopy'
import { Button } from './Button'
import styles from './RulesSheet.module.css'

type Props = {
  open: boolean
  onClose: () => void
}

export function RulesSheet({ open, onClose }: Props) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      data-dialog-backdrop
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.head}>
          <div>
            <p className={styles.kicker}>Small World · база 2018</p>
            <h2 id={titleId}>{RULES_TITLE}</h2>
          </div>
          <Button ref={closeRef} size="compact" onClick={onClose}>
            Закрыть
          </Button>
        </header>
        <p className={styles.intro}>{RULES_INTRO}</p>
        {RULES_SECTIONS.map((section) => (
          <section key={section.title} className={styles.block}>
            <h3>{section.title}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        <p className={styles.credit}>
          {COPYRIGHT_LINE} Полный буклет и актуальные материалы — на сайте издателя:{' '}
          <a href={PUBLISHER_URL} target="_blank" rel="noopener noreferrer">
            официальная страница Small World
          </a>
          .
        </p>
      </section>
    </div>
  )
}
