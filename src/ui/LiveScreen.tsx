import { useEffect, useMemo, useRef, useState } from 'react'
import { formatCombo } from '../game/catalog'
import { currentActor, isComplete, playerTotal } from '../game/game'
import { isMarketReady } from '../game/market'
import { occupiedCombos, randomReplacementCombo } from '../game/pool'
import { soundEngine } from '../audio/engine'
import { toTurnScore, type ScoreBreakdown } from '../game/score'
import { scoringRemindersForTurn } from '../game/scoringReminders'
import type { TurnAction } from '../game/types'
import { useGame } from '../state/GameContext'
import { ConfirmDialog } from './ConfirmDialog'
import { Button } from './Button'
import { MarketColumn } from './MarketColumn'
import { ReinforcementDie } from './ReinforcementDie'
import { ToggleSwitch } from './ToggleSwitch'
import { TurnScoreInput } from './TurnScoreInput'
import styles from './LiveScreen.module.css'

const emptyScore: ScoreBreakdown = {
  activeRegions: 0,
  declineRegions: 0,
  bonus: 0,
}

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
  const [score, setScore] = useState<ScoreBreakdown>(emptyScore)
  /** No row is picked up front: a leftover default is too easy to submit by accident. */
  const [marketIndex, setMarketIndex] = useState<number | null>(null)
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
  const usedCombos = useMemo(() => (game ? occupiedCombos(game) : []), [game])

  useEffect(
    () => () => {
      if (randomizedTimer.current !== null) {
        window.clearTimeout(randomizedTimer.current)
      }
    },
    [],
  )

  if (!game || !actor || !player) return null

  const pickedSlot =
    marketIndex === null ? null : game.market.slots[marketIndex]?.combo ?? null
  const needsPick = activeAction === 'select' && marketIndex === null
  const scoringCombo =
    activeAction === 'select' ? pickedSlot : player.activeCombo
  const scoreReminders = scoringRemindersForTurn({
    action: activeAction,
    activeCombo: scoringCombo,
    declined: player.declined,
    expansions: game.expansions,
    player,
    rivals,
  })

  const submit = () => {
    setError(null)
    try {
      recordTurn({
        action: activeAction,
        score: toTurnScore(score),
        marketIndex:
          activeAction === 'select' && marketIndex !== null
            ? marketIndex
            : undefined,
      })
      setScore(emptyScore)
      setMarketIndex(null)
      setEditingSlot(null)
      setAction('expand')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось записать ход')
    }
  }

  const randomizeDraft = (index: number) => {
    const combo = randomReplacementCombo(
      game.market,
      usedCombos,
      index,
      game.expansions,
    )
    if (!combo) return
    soundEngine.play('deal')
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
          <div className={styles.headerActions}>
            <ReinforcementDie />
            <Button
              size="compact"
              onClick={() => setConfirmingNewGame(true)}
            >
              Новая партия
            </Button>
          </div>
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
            <Button
              variant={action === 'expand' ? 'selected' : 'secondary'}
              onClick={() => setAction('expand')}
            >
              Расширение
            </Button>
            <Button
              variant={action === 'decline' ? 'selected' : 'secondary'}
              onClick={() => {
                setAction('decline')
                setScore((current) => ({ ...current, activeRegions: 0 }))
              }}
            >
              Упадок
            </Button>
          </div>
        )}

        {activeAction === 'decline' && (
          <p className={styles.hint}>
            В ход упадка нет завоеваний. Считайте регионы с перевёрнутыми
            жетонами (без бонусов силы, кроме исключений вроде гномов).
          </p>
        )}

        <TurnScoreInput
          action={activeAction}
          value={score}
          reminders={scoreReminders}
          onChange={setScore}
        />

        {error ? <p className={styles.error}>{error}</p> : null}

        {needsPick && (
          <p className={styles.muted}>
            Строка драфта не выбрана заранее — отметьте её в колонке.
          </p>
        )}

        <Button
          variant="primary"
          className={styles.submit}
          disabled={needsPick}
          onClick={submit}
        >
          {activeAction === 'select' ? 'Взять связку и записать ход' : 'Записать ход'}
        </Button>
      </main>

      <aside className={styles.sidebar}>
        <section className={styles.panel}>
          <h2>Драфт</h2>
          <MarketColumn
            market={game.market}
            selectedIndex={
              activeAction === 'select' && marketIndex !== null
                ? marketIndex
                : undefined
            }
            onSelect={activeAction === 'select' ? setMarketIndex : undefined}
            onEditCombo={setMarketCombo}
            onEditCoins={setMarketCoins}
            editingIndex={editingSlot}
            onToggleEdit={setEditingSlot}
            usedCombos={usedCombos}
            onRandomize={randomizeDraft}
            randomizedIndex={randomizedIndex}
            randomizeEmptyOnly
            expansions={game.expansions}
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
            <Button
              size="compact"
              disabled={game.history.length === 0}
              onClick={undoTurn}
            >
              Отменить ход
            </Button>
            {game.history.length > 0 && (
              <Button size="compact" onClick={goAnalytics}>
                К аналитике
              </Button>
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
