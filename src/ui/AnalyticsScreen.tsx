import { useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { generateRecap } from '../analytics/templateRecap'
import {
  scoreLineData,
  scoreStackData,
  type LinePoint,
} from '../analytics/charts'
import { formatCombo } from '../game/catalog'
import { currentActor, isComplete, playerTotal } from '../game/game'
import { useGame } from '../state/GameContext'
import { Button } from './Button'
import { ChartTooltip } from './ChartTooltip'
import { ConfirmDialog } from './ConfirmDialog'
import styles from './AnalyticsScreen.module.css'

const PLAYER_COLORS = ['#c45c3a', '#4a9a68', '#4d7eb8', '#c4923a', '#7d6bb8']

const STACK_SERIES = [
  { key: 'active', name: 'Активные', fill: '#4a9a68' },
  { key: 'bonus', name: 'Бонусы', fill: '#c4923a' },
  { key: 'decline', name: 'Упадок', fill: '#c45c3a' },
  { key: 'other', name: 'Ход целиком', fill: '#4d7eb8' },
] as const

const AXIS_TICK = { fill: 'var(--muted)', fontSize: 11 }

function playerColor(index: number): string {
  return PLAYER_COLORS[index] ?? PLAYER_COLORS[0]!
}

export function AnalyticsScreen() {
  const { game, goLive, newGame } = useGame()
  const [confirmingNewGame, setConfirmingNewGame] = useState(false)
  if (!game) return null

  const recap = generateRecap(game)
  const line = scoreLineData(game)
  const stack = scoreStackData(game)
  const complete = isComplete(game)
  const actor = currentActor(game)
  const colorById = Object.fromEntries(
    game.players.map((player, index) => [player.id, playerColor(index)]),
  )
  const hasWholeTurn = stack.some((row) => row.other > 0)
  const stackSeries = STACK_SERIES.filter(
    (series) => series.key !== 'other' || hasWholeTurn,
  )

  return (
    <div className={styles.page}>
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
      <header className={styles.top}>
        <div>
          <p className={styles.kicker}>
            {complete
              ? 'Финал и разбор'
              : `Ход ${Math.min(actor.round, game.turnCount)} из ${game.turnCount}`}
          </p>
          <h1>
            {complete
              ? recap.winnerNames.length === 1
                ? `Побеждает ${recap.winnerNames[0]}`
                : `Ничья: ${recap.winnerNames.join(', ')}`
              : 'Промежуточная аналитика'}
          </h1>
        </div>
        <div className={styles.headerBtns}>
          {!complete && (
            <Button size="compact" onClick={goLive}>
              К ходам
            </Button>
          )}
          <Button
            size="compact"
            onClick={() => {
              if (complete) newGame()
              else setConfirmingNewGame(true)
            }}
          >
            Новая партия
          </Button>
        </div>
      </header>

      <section className={styles.card}>
        <h2>Счёт</h2>
        <ol className={styles.scores}>
          {game.players
            .toSorted((a, b) => playerTotal(game, b.id) - playerTotal(game, a.id))
            .map((player) => (
              <li key={player.id}>
                <span className={styles.player}>
                  <span
                    className={styles.swatch}
                    data-testid="player-swatch"
                    style={{ background: colorById[player.id] }}
                    aria-hidden="true"
                  />
                  <strong>{player.name}</strong>
                </span>
                <span>{playerTotal(game, player.id)}</span>
              </li>
            ))}
        </ol>
      </section>

      <section className={styles.card}>
        <h2>Монеты по ходам</h2>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={line} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="var(--line)"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                dataKey="round"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={28}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={(props) => <ChartTooltip {...props} />}
                cursor={{ stroke: 'var(--muted)', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              {game.players.map((player, index) => (
                <Line
                  key={player.id}
                  type="monotone"
                  name={player.name}
                  dataKey={(row: LinePoint) => row.totals[player.name] ?? 0}
                  stroke={playerColor(index)}
                  strokeWidth={2}
                  dot={{ r: 2.5, strokeWidth: 0, fill: playerColor(index) }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Откуда очки</h2>
        <ul className={styles.stackKey} aria-label="Состав очков">
          {stackSeries.map((series) => (
            <li key={series.key}>
              <span style={{ background: series.fill }} />
              {series.name}
            </li>
          ))}
        </ul>
        {hasWholeTurn && (
          <p className={styles.note}>
            Если разбивку не вводили, всё попадает в «ход целиком».
          </p>
        )}
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stack} barCategoryGap="28%" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke="var(--line)"
                strokeDasharray="4 6"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={28}
                tick={AXIS_TICK}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={(props) => <ChartTooltip {...props} skipZeros />}
                cursor={{ fill: 'var(--warn-bg)', fillOpacity: 0.35 }}
              />
              {stackSeries.map((series) => (
                <Bar
                  key={series.key}
                  dataKey={series.key}
                  name={series.name}
                  stackId="a"
                  fill={series.fill}
                  maxBarSize={56}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Таймлайн рас</h2>
        <ul className={styles.timeline}>
          {game.players.map((p) => {
            const events = game.history.filter((t) => t.playerId === p.id)
            const firstPick = events.find((t) => t.newCombo)
            return (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <span>
                  {' '}
                  старт:{' '}
                  {firstPick?.newCombo
                    ? formatCombo(firstPick.newCombo.race, firstPick.newCombo.power)
                    : 'ещё не брали'}
                </span>
                <ul>
                  {events.map((t) => (
                    <li key={`${t.playerId}-${t.round}-${t.action}-${t.score.total}`}>
                      Ход {t.round}: {labelAction(t.action)}
                      {t.newCombo
                        ? ` → ${formatCombo(t.newCombo.race, t.newCombo.power)}`
                        : ''}
                      {` · +${t.score.total}`}
                      {t.mapSnapshot ? ' · есть снимок карты' : ''}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.card}>
        <h2>Разбор партии</h2>
        {recap.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>
    </div>
  )
}

function labelAction(action: string): string {
  if (action === 'decline') return 'упадок'
  if (action === 'select') return 'новая раса'
  return 'расширение'
}
