import { FUNNY_NAMES } from '../game/recentNames'
import { NameCombobox } from './NameCombobox'
import styles from './SetupScreen.module.css'

type PlayerDraft = { name: string }

type Props = {
  players: PlayerDraft[]
  suggestions: string[][]
  firstPlayerIndex: number
  highlightedPlayer: number
  winnerPulse: number | null
  isRolling: boolean
  onRoll: () => void
  onChooseFirst: (index: number) => void
  onNameChange: (index: number, name: string) => void
}

function DiceIcon({ rolling }: { rolling: boolean }) {
  return (
    <svg
      className={rolling ? styles.rollingDice : undefined}
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-rolling={rolling}
    >
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z" />
      <circle cx="8" cy="8" r="1.35" />
      <circle cx="16" cy="8" r="1.35" />
      <circle cx="12" cy="12" r="1.35" />
      <circle cx="8" cy="16" r="1.35" />
      <circle cx="16" cy="16" r="1.35" />
    </svg>
  )
}

function CrownIcon({ selected }: { selected: boolean }) {
  return (
    <svg
      className={selected ? styles.crownSelected : styles.crown}
      viewBox="0 0 24 24"
      aria-hidden="true"
      data-icon="crown"
    >
      <path d="m4 7 4.2 4L12 4l3.8 7L20 7l-2 11H6L4 7Z" />
      <path d="M7 21h10" />
      {selected && <path className={styles.crownCheck} d="m9.2 13.8 1.8 1.8 3.9-4" />}
    </svg>
  )
}

export function PlayerSetupCard({
  players,
  suggestions,
  firstPlayerIndex,
  highlightedPlayer,
  winnerPulse,
  isRolling,
  onRoll,
  onChooseFirst,
  onNameChange,
}: Props) {
  const firstName =
    players[firstPlayerIndex]?.name.trim() || `Игрок ${firstPlayerIndex + 1}`

  return (
    <section className={`${styles.card} ${styles.playersCard}`}>
      <header className={styles.sectionHead}>
        <div>
          <p className={styles.step}>02</p>
          <h2>Игроки и первый ход</h2>
        </div>
        <button
          type="button"
          className={styles.roll}
          disabled={isRolling}
          onClick={onRoll}
          aria-label="Случайно выбрать первого игрока"
          title="Случайно выбрать первого игрока"
        >
          <DiceIcon rolling={isRolling} />
        </button>
      </header>

      <div className={styles.players}>
        {players.map((player, index) => {
          const highlighted = highlightedPlayer === index
          const winner = winnerPulse === index
          const selected = firstPlayerIndex === index
          const playerName = player.name.trim() || `Игрок ${index + 1}`
          const firstLabel = selected
            ? `Первый игрок — ${playerName}`
            : `Выбрать первым: ${playerName}`
          return (
            <div
              key={index}
              className={[
                styles.player,
                highlighted ? styles.first : '',
                winner ? styles.winner : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.order}>{index + 1}</span>
              <NameCombobox
                id={`player-${index}`}
                label={`Имя игрока ${index + 1}`}
                value={player.name}
                disabled={isRolling}
                suggestions={suggestions[index] ?? []}
                placeholder={
                  suggestions[index]?.[0] ??
                  FUNNY_NAMES[index % FUNNY_NAMES.length]!
                }
                onChange={(name) => onNameChange(index, name)}
              />
              <button
                type="button"
                className={styles.firstButton}
                disabled={isRolling}
                onClick={() => onChooseFirst(index)}
                aria-pressed={selected}
                aria-label={firstLabel}
                title={firstLabel}
              >
                <CrownIcon selected={highlighted} />
              </button>
            </div>
          )
        })}
      </div>
      <p className={styles.firstSummary}>
        Первым ходит <strong>{firstName}</strong>, далее — по списку.
      </p>
    </section>
  )
}
