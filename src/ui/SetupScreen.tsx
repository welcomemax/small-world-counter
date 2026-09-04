import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { defaultTurnCount } from '../game/game'
import { emptyMarket, setSlotCombo } from '../game/market'
import { randomFreeCombo, randomIndex, takenIds } from '../game/pool'
import {
  loadRecentNames,
  nameSuggestions,
  saveRecentNames,
} from '../game/recentNames'
import type { Combo } from '../game/types'
import { soundEngine } from '../audio/engine'
import { useGame } from '../state/GameContext'
import { Button } from './Button'
import { DiscreteSlider } from './DiscreteSlider'
import { MarketColumn } from './MarketColumn'
import { PlayerSetupCard } from './PlayerSetupCard'
import { setupIssue } from './setupModel'
import { ToggleSwitch } from './ToggleSwitch'
import styles from './SetupScreen.module.css'

type Draft = { name: string }

function emptyDraft(): Draft {
  return { name: '' }
}

export function SetupScreen() {
  const { startGame } = useGame()
  const [count, setCount] = useState(2)
  const [turnCount, setTurnCount] = useState(() => defaultTurnCount(2))
  const [scoreHidden, setScoreHidden] = useState(true)
  const [firstPlayerIndex, setFirstPlayerIndex] = useState(0)
  const [players, setPlayers] = useState<Draft[]>(() => [
    emptyDraft(),
    emptyDraft(),
  ])
  const [market, setMarket] = useState(() => emptyMarket())
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [randomizedIndex, setRandomizedIndex] = useState<number | null>(null)
  const [recentNames] = useState(loadRecentNames)
  const [rollingIndex, setRollingIndex] = useState<number | null>(null)
  const [winnerPulse, setWinnerPulse] = useState<number | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const setPlayerCount = (nextCount: number) => {
    setCount(nextCount)
    setTurnCount(defaultTurnCount(nextCount))
    setFirstPlayerIndex((current) => (current >= nextCount ? 0 : current))
    setPlayers((current) => {
      const next = current.slice(0, nextCount)
      while (next.length < nextCount) next.push(emptyDraft())
      return next
    })
  }

  const playerNames = players.map((player) => player.name)
  const issue = setupIssue(playerNames, market)
  const ready = issue === null
  const highlightedPlayer = rollingIndex ?? firstPlayerIndex

  const editCombo = (index: number, combo: Combo) => {
    setMarket((current) => setSlotCombo(current, index, combo))
  }

  const randomizeCombo = (index: number) => {
    let dealt = false
    setMarket((current) => {
      const used = current.slots.flatMap((slot, slotIndex) =>
        slot.combo && slotIndex !== index ? [slot.combo] : [],
      )
      const combo = randomFreeCombo(takenIds(used))
      if (!combo) return current
      dealt = true
      return setSlotCombo(current, index, combo)
    })
    if (!dealt) return
    soundEngine.play('deal')
    setRandomizedIndex(null)
    timers.current.push(
      window.setTimeout(() => setRandomizedIndex(index), 0),
    )
  }

  const chooseFirst = (index: number) => {
    if (isRolling) return
    setFirstPlayerIndex(index)
    setWinnerPulse(index)
    timers.current.push(
      window.setTimeout(() => setWinnerPulse(null), 900),
    )
  }

  const rollFirst = () => {
    if (isRolling) return
    clearTimers()
    const winner = randomIndex(players.length)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setWinnerPulse(null)

    if (reduceMotion) {
      setFirstPlayerIndex(winner)
      setWinnerPulse(winner)
      soundEngine.play('shuffle')
      soundEngine.play('first')
      return
    }

    setIsRolling(true)
    soundEngine.play('shuffle')
    let elapsed = 0
    const distance =
      (winner - firstPlayerIndex + players.length) % players.length
    const steps = players.length * 3 + distance

    for (let step = 1; step <= steps; step += 1) {
      const delay = 65 + Math.round((step / steps) ** 2 * 150)
      elapsed += delay
      timers.current.push(
        window.setTimeout(() => {
          const active = (firstPlayerIndex + step) % players.length
          setRollingIndex(active)
          if (step === steps) {
            setFirstPlayerIndex(winner)
            setRollingIndex(null)
            setIsRolling(false)
            setWinnerPulse(winner)
            soundEngine.play('first')
            timers.current.push(
              window.setTimeout(() => setWinnerPulse(null), 1000),
            )
          }
        }, elapsed),
      )
    }
  }

  const filledCombos = market.slots.filter((slot) => slot.combo).length
  const readyNames = players.filter((player) => player.name.trim()).length
  const playerSuggestions = useMemo(
    () =>
      players.map((_, index) =>
        nameSuggestions(recentNames, playerNames, index),
      ),
    [players, recentNames, playerNames],
  )

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready || isRolling) return
        const names = players.map((player) => player.name.trim())
        saveRecentNames(names)
        startGame({
          players: names.map((name) => ({ name })),
          turnCount,
          scoreHidden,
          firstPlayerIndex,
          market,
        })
      }}
    >
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Small World · счётчик партии</p>
          <h1>Соберите игроков.<br />Остальное посчитаем.</h1>
          <p className={styles.lead}>
            Настройте стол за минуту — затем передавайте счётчик по кругу.
          </p>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <span>SW</span>
          <small>живой счёт</small>
        </div>
      </header>

      <div className={styles.workspace}>
        <div className={styles.left}>
          <section className={styles.card}>
            <header className={styles.sectionHead}>
              <div>
                <p className={styles.step}>01</p>
                <h2>Партия</h2>
              </div>
              <span className={styles.official}>по правилам базы</span>
            </header>
            <div className={styles.sliders}>
              <DiscreteSlider
                id="player-count"
                label="Игроков"
                value={count}
                min={2}
                max={5}
                marks={[2, 3, 4, 5]}
                disabled={isRolling}
                onChange={setPlayerCount}
              />
              <DiscreteSlider
                id="turn-count"
                label="Ходов"
                value={turnCount}
                min={8}
                max={10}
                marks={[8, 9, 10]}
                disabled={isRolling}
                onChange={setTurnCount}
              />
            </div>
            <div className={styles.switchRow}>
              <ToggleSwitch
                checked={scoreHidden}
                label="Скрытый счёт"
                description="Не показывать итоги до конца партии"
                disabled={isRolling}
                onChange={setScoreHidden}
              />
            </div>
          </section>

          <PlayerSetupCard
            players={players}
            suggestions={playerSuggestions}
            firstPlayerIndex={firstPlayerIndex}
            highlightedPlayer={highlightedPlayer}
            winnerPulse={winnerPulse}
            isRolling={isRolling}
            onRoll={rollFirst}
            onChooseFirst={chooseFirst}
            onNameChange={(index, name) =>
              setPlayers((current) =>
                current.map((draft, draftIndex) =>
                  draftIndex === index ? { name } : draft,
                ),
              )
            }
          />
        </div>

        <section className={`${styles.card} ${styles.marketCard}`}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.step}>03</p>
              <h2>Драфт</h2>
            </div>
            <span className={styles.counter}>{filledCombos} / 6</span>
          </header>
          <p className={styles.intro}>
            Перенесите связки со стола или бросайте кубик у каждой строки и
            выкладывайте выпавшие жетоны.
          </p>
          <MarketColumn
            market={market}
            idPrefix="setup-market"
            onEditCombo={editCombo}
            onRandomize={randomizeCombo}
            randomizedIndex={randomizedIndex}
            editingIndex={editingSlot}
            onToggleEdit={setEditingSlot}
            showCaption={false}
          />
        </section>
      </div>

      <footer className={styles.launch}>
        <div className={ready ? styles.ready : styles.notReady}>
          <span aria-hidden="true">{ready ? '✓' : '·'}</span>
          <p>
            <strong>{ready ? 'Всё готово' : issue}</strong>
            <small>
              {readyNames} из {count} игроков · {filledCombos} из 6 связок
            </small>
          </p>
        </div>
        <Button type="submit" variant="primary" className={styles.play} disabled={!ready || isRolling}>
          Играть <span aria-hidden="true">→</span>
        </Button>
      </footer>
    </form>
  )
}
