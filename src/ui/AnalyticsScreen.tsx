import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { generateRecap } from '../analytics/templateRecap'
import { scoreLineData, scoreStackData } from '../analytics/charts'
import { formatCombo } from '../game/catalog'
import { isComplete, playerTotal } from '../game/game'
import { VISION_ENABLED } from '../vision'
import { useGame } from '../state/GameContext'
import styles from './AnalyticsScreen.module.css'

const COLORS = ['#7a2d12', '#2f5d3a', '#1f4b73', '#8a5a12', '#4a3d73']

export function AnalyticsScreen() {
  const { game, goLive, newGame, undoTurn } = useGame()
  if (!game) return null

  const recap = generateRecap(game)
  const line = scoreLineData(game)
  const stack = scoreStackData(game)
  const complete = isComplete(game)

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div>
          <p className={styles.kicker}>Финал и разбор</p>
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
            <button type="button" onClick={goLive}>
              К ходам
            </button>
          )}
          <button type="button" onClick={undoTurn}>
            Отменить последний ход
          </button>
          <button type="button" onClick={newGame}>
            Новая партия
          </button>
        </div>
      </header>

      <section className={styles.card}>
        <h2>Счёт</h2>
        <ol className={styles.scores}>
          {game.players
            .toSorted((a, b) => playerTotal(game, b.id) - playerTotal(game, a.id))
            .map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                <span>{playerTotal(game, p.id)}</span>
              </li>
            ))}
        </ol>
      </section>

      <section className={styles.card}>
        <h2>Монеты по ходам</h2>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={line}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" />
              <YAxis />
              <Tooltip />
              <Legend />
              {game.players.map((p, i) => (
                <Line
                  key={p.id}
                  type="monotone"
                  dataKey={p.name}
                  stroke={COLORS[i] ?? '#333'}
                  strokeWidth={2}
                  dot
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.card}>
        <h2>Откуда очки</h2>
        <p className={styles.note}>
          Если разбивку не вводили, всё попадает в «ход целиком».
        </p>
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stack}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" name="Активные регионы" stackId="a" fill="#2f5d3a" />
              <Bar dataKey="decline" name="Упадок" stackId="a" fill="#7a2d12" />
              <Bar dataKey="bonus" name="Бонусы" stackId="a" fill="#8a5a12" />
              <Bar dataKey="other" name="Ход целиком" stackId="a" fill="#1f4b73" />
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
                      {t.mapSnapshot || VISION_ENABLED
                        ? ' · есть снимок карты'
                        : ' · карта не записана'}
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
