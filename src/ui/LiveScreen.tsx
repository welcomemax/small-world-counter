import { useEffect, useMemo, useRef, useState } from 'react'
import { formatCombo } from '../game/catalog'
import { currentActor, isComplete, playerTotal } from '../game/game'
import { isMarketReady } from '../game/market'
import { pickedCombos, randomReplacementCombo } from '../game/pool'
import type { TurnAction, TurnScore } from '../game/types'
import { useGame } from '../state/GameContext'
import { ConfirmDialog } from './ConfirmDialog'
import { MarketColumn } from './MarketColumn'
import { parseNonNeg } from './parseNumber'
import { ToggleSwitch } from './ToggleSwitch'
import styles from './LiveScreen.module.css'

const emptyScore: TurnScore = { total: 0 }

export function LiveScreen() {
  const {
    game,
    recordTurn,
    undoTurn,
    setMarketCombo,
    setMarketCoins,
    toggleHidden,
    goAnalytics,
    newGame,
  } = useGame()
  const [action, setAction] = useState<TurnAction>('expand')
  const [score, setScore] = useState<TurnScore>(emptyScore)
  const [marketIndex, setMarketIndex] = useState(0)
  const [editingSlot, setEditingSlot] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmingNewGame, setConfirmingNewGame] = useState(false)
  const [randomizedIndex, setRandomizedIndex] = useState<number | null>(null)
  const randomizedTimer = useRef<number | null>(null)

  const actor = game ? currentActor(game) : null
  const player =
    game && actor ? game.players.find((p) => p.id === actor.playerId) : null
  const showTotals = Boolean(game && (!game.scoreHidden || isComplete(game)))
  const activeAction: TurnAction = player?.awaitingSelect ? 'select' : action
  const rivals = useMemo(
    () => (game && player ? game.players.filter((p) => p.id !== player.id) : []),
    [game, player],
  )
  const usedCombos = useMemo(() => (game ? pickedCombos(game) : []), [game])

  useEffect(
    () => () => {
      if (randomizedTimer.current !== null) {
        window.clearTimeout(randomizedTimer.current)
      }
    },
    [],
  )

  if (!game || !actor || !player) return null

  const submit = () => {
    setError(null)
    try {
      recordTurn({
        action: activeAction,
        score,
        marketIndex: activeAction === 'select' ? marketIndex : undefined,
      })
      setScore(emptyScore)
      setMarketIndex(0)
      setEditingSlot(null)
      setAction('expand')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось записать ход')
    }
  }

  const randomizeDraft = (index: number) => {
    const combo = randomReplacementCombo(game.market, usedCombos, index)
    if (!combo) return
    setMarketCombo(index, combo)
    setRandomizedIndex(null)
    if (randomizedTimer.current !== null) {
      window.clearTimeout(randomizedTimer.current)
    }
    randomizedTimer.current = window.setTimeout(() => {
      setRandomizedIndex(index)
      randomizedTimer.current = null
    }, 0)
  }

  return (
    <div className={styles.layout}>
      <ConfirmDialog
        open={confirmingNewGame}
        title="Начать новую партию?"
        description="Текущий прогресс будет удалён без возможности восстановления."
        cancelLabel="Продолжить игру"
        confirmLabel="Начать заново"
        onCancel={() => setConfirmingNewGame(false)}
        onConfirm={() => {
          setConfirmingNewGame(false)
          newGame()
        }}
      />
      <main className={styles.main}>
        <header className={styles.top}>
          <div>
            <p className={styles.kicker}>
              Ход {Math.min(actor.round, game.turnCount)} из {game.turnCount}
            </p>
            <h1>{player.name}</h1>
          </div>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setConfirmingNewGame(true)}
          >
            Новая партия
          </button>
        </header>

        <section className={styles.status}>
          <p>
            <strong>Активная:</strong>{' '}
            {player.activeCombo
              ? formatCombo(player.activeCombo.race, player.activeCombo.power)
              : 'нет — берём связку из колонки'}
          </p>
          <p>
            <strong>В упадке:</strong>{' '}
            {player.declined.length === 0
              ? 'нет'
              : player.declined
                  .map((c) => formatCombo(c.race, c.power))
                  .join('; ')}
          </p>
          {showTotals ? (
            <p>
              <strong>Монеты:</strong> {playerTotal(game, player.id)}
            </p>
          ) : (
            <p className={styles.muted}>Итоги скрыты до конца партии</p>
          )}
        </section>

        {player.awaitingSelect ? (
          <p className={styles.banner}>
            {player.declined.length === 0
              ? 'Первый ход: возьмите связку из колонки в сайдбаре, завоюйте регионы за столом и впишите очки.'
              : 'После упадка возьмите новую связку из колонки в сайдбаре, затем впишите очки за новую расу и регионы в упадке.'}
          </p>
        ) : (
          <div className={styles.actions}>
            <button
              type="button"
              className={action === 'expand' ? styles.on : styles.off}
              onClick={() => setAction('expand')}
            >
              Расширение
            </button>
            <button
              type="button"
              className={action === 'decline' ? styles.on : styles.off}
              onClick={() => setAction('decline')}
            >
              Упадок
            </button>
          </div>
        )}

        {activeAction === 'decline' && (
          <p className={styles.hint}>
            В ход упадка нет завоеваний. Считайте регионы с перевёрнутыми
            жетонами (без бонусов силы, кроме исключений вроде гномов).
          </p>
        )}

        <div className={styles.card}>
          <h2>Очки этого хода</h2>
          <label>
            Всего монет
            <input
              type="number"
              min={0}
              value={score.total}
              onChange={(e) =>
                setScore({ ...score, total: parseNonNeg(e.target.value) })
              }
            />
          </label>
          <details>
            <summary>Разбивка (необязательно)</summary>
            <div className={styles.row}>
              <label>
                Регионы активной
                <input
                  type="number"
                  min={0}
                  value={score.activeRegions ?? ''}
                  onChange={(e) =>
                    setScore({
                      ...score,
                      activeRegions:
                        e.target.value === ''
                          ? undefined
                          : parseNonNeg(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Регионы упадка
                <input
                  type="number"
                  min={0}
                  value={score.declineRegions ?? ''}
                  onChange={(e) =>
                    setScore({
                      ...score,
                      declineRegions:
                        e.target.value === ''
                          ? undefined
                          : parseNonNeg(e.target.value),
                    })
                  }
                />
              </label>
              <label>
                Бонусы
                <input
                  type="number"
                  min={0}
                  value={score.bonus ?? ''}
                  onChange={(e) =>
                    setScore({
                      ...score,
                      bonus:
                        e.target.value === ''
                          ? undefined
                          : parseNonNeg(e.target.value),
                    })
                  }
                />
              </label>
            </div>
          </details>
        </div>

        {error ? <p className={styles.error}>{error}</p> : null}

        <button type="button" className={styles.submit} onClick={submit}>
          {activeAction === 'select' ? 'Взять связку и записать ход' : 'Записать ход'}
        </button>
      </main>

      <aside className={styles.sidebar}>
        <section className={styles.panel}>
          <h2>Драфт</h2>
          <MarketColumn
            market={game.market}
            selectedIndex={activeAction === 'select' ? marketIndex : undefined}
            onSelect={activeAction === 'select' ? setMarketIndex : undefined}
            onEditCombo={setMarketCombo}
            onEditCoins={setMarketCoins}
            editingIndex={editingSlot}
            onToggleEdit={setEditingSlot}
            usedCombos={usedCombos}
            onRandomize={randomizeDraft}
            randomizedIndex={randomizedIndex}
            randomizeEmptyOnly
          />
          {!isMarketReady(game.market) && (
            <p className={styles.warn}>
              Освободившуюся строку заполните связкой, которая открылась на столе.
            </p>
          )}
        </section>

        <section className={styles.panel}>
          <h2>За столом</h2>
          <ul className={styles.rivals}>
            {rivals.map((p) => (
              <li key={p.id}>
                {p.name}
                {p.activeCombo
                  ? ` · ${formatCombo(p.activeCombo.race, p.activeCombo.power)}`
                  : ' · берёт расу'}
                {p.declined.length > 0
                  ? ` · в упадке: ${p.declined
                      .map((c) => formatCombo(c.race, c.power))
                      .join(', ')}`
                  : ''}
                {p.id === `p${game.firstPlayerIndex}` ? ' · первый' : ''}
                {showTotals ? ` · ${playerTotal(game, p.id)}` : ''}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <h2>Партия</h2>
          <div className={styles.toolbar}>
            <button
              type="button"
              disabled={game.history.length === 0}
              onClick={undoTurn}
            >
              Отменить ход
            </button>
            {game.history.length > 0 && (
              <button type="button" onClick={goAnalytics}>
                К аналитике
              </button>
            )}
          </div>
          <ToggleSwitch
            checked={game.scoreHidden}
            label="Скрытый счёт"
            description="Не показывать итоги до конца партии"
            onChange={toggleHidden}
          />
          <p className={styles.muted}>Записано ходов: {game.history.length}</p>
        </section>
      </aside>
    </div>
  )
}
