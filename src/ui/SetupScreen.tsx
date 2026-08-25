import { useMemo, useState } from 'react'
import { defaultTurnCount } from '../game/game'
import { emptyMarket, isMarketReady, setSlotCombo } from '../game/market'
import type { Combo } from '../game/types'
import { useGame } from '../state/GameContext'
import { MarketColumn } from './MarketColumn'
import { parseNonNeg } from './parseNumber'
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
  const [editingSlot, setEditingSlot] = useState<number | null>(0)

  const setPlayerCount = (n: number) => {
    setCount(n)
    setTurnCount(defaultTurnCount(n))
    setFirstPlayerIndex((current) => (current >= n ? 0 : current))
    setPlayers((current) => {
      const next = current.slice(0, n)
      while (next.length < n) next.push(emptyDraft())
      return next
    })
  }

  const namesReady = useMemo(
    () => players.every((p) => p.name.trim().length > 0),
    [players],
  )
  const columnReady = isMarketReady(market)
  const ready = namesReady && columnReady

  const turnOrder = useMemo(
    () =>
      players.map((_, i) => players[(firstPlayerIndex + i) % players.length]!),
    [players, firstPlayerIndex],
  )

  const editCombo = (index: number, combo: Combo) => {
    setMarket((current) => setSlotCombo(current, index, combo))
  }

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        if (!ready) return
        startGame({
          players: players.map((p) => ({ name: p.name.trim() })),
          turnCount,
          scoreHidden,
          firstPlayerIndex,
          market,
        })
      }}
    >
      <header className={styles.hero}>
        <p className={styles.kicker}>Days of Wonder · базовая коробка</p>
        <h1>Счётчик Small World</h1>
        <p>
          Состав, первый игрок и колонка комбо со стола. Расу берут уже в свой
          первый ход.
        </p>
      </header>

      <fieldset className={styles.card}>
        <legend>Партия</legend>
        <label>
          Игроков
          <select
            value={count}
            onChange={(e) => setPlayerCount(parseNonNeg(e.target.value))}
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ходов (по карте)
          <input
            type="number"
            min={1}
            max={10}
            value={turnCount}
            onChange={(e) => setTurnCount(Math.max(1, parseNonNeg(e.target.value)))}
          />
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={scoreHidden}
            onChange={(e) => setScoreHidden(e.target.checked)}
          />
          Скрывать итоги до конца (как в правилах)
        </label>
      </fieldset>

      <fieldset className={styles.card}>
        <legend>Кто играет</legend>
        {players.map((player, index) => (
          <label key={index}>
            Игрок {index + 1}
            <input
              required
              value={player.name}
              onChange={(e) =>
                setPlayers((current) =>
                  current.map((p, i) =>
                    i === index ? { name: e.target.value } : p,
                  ),
                )
              }
              placeholder={`Имя ${index + 1}`}
            />
          </label>
        ))}
        <p className={styles.seating}>
          Порядок вокруг стола — как в списке, по часовой стрелке.
        </p>
      </fieldset>

      <fieldset className={styles.card}>
        <legend>Кто ходит первым</legend>
        <p className={styles.seating}>
          В правилах — у кого острее уши. Здесь можно бросить жребий или указать
          вручную.
        </p>
        <div className={styles.firstRow}>
          {players.map((player, index) => (
            <button
              key={index}
              type="button"
              className={
                index === firstPlayerIndex ? styles.firstOn : styles.firstOff
              }
              onClick={() => setFirstPlayerIndex(index)}
            >
              {player.name.trim() || `Игрок ${index + 1}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.roll}
          onClick={() =>
            setFirstPlayerIndex(Math.floor(Math.random() * players.length))
          }
        >
          Случайный первый игрок
        </button>
        {namesReady && (
          <ol className={styles.order}>
            {turnOrder.map((p, i) => (
              <li key={`${p.name}-${i}`}>
                {i === 0 ? '1-й ход: ' : 'далее: '}
                {p.name.trim()}
              </li>
            ))}
          </ol>
        )}
      </fieldset>

      <fieldset className={styles.card}>
        <legend>Колонка комбо со стола</legend>
        <MarketColumn
          market={market}
          idPrefix="setup-market"
          onEditCombo={editCombo}
          editingIndex={editingSlot}
          onToggleEdit={setEditingSlot}
        />
        {!columnReady && (
          <p className={styles.warn}>
            Впишите все шесть связок — они должны совпадать со столом.
          </p>
        )}
      </fieldset>

      <button className={styles.submit} type="submit" disabled={!ready}>
        К первому ходу
      </button>
    </form>
  )
}
