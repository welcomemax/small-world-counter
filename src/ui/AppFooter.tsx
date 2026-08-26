import { COPYRIGHT_LINE, DESIGNER_LINE, PUBLISHER_NAME, PUBLISHER_URL } from './legal'
import { Button } from './Button'
import styles from './AppFooter.module.css'

type Props = {
  onOpenRules: () => void
}

export function AppFooter({ onOpenRules }: Props) {
  return (
    <footer className={styles.footer}>
      <p>
        {DESIGNER_LINE} {COPYRIGHT_LINE}{' '}
        <a href={PUBLISHER_URL} target="_blank" rel="noopener noreferrer">
          {PUBLISHER_NAME}
        </a>
      </p>
      <Button size="compact" onClick={onOpenRules}>
        Правила
      </Button>
    </footer>
  )
}
