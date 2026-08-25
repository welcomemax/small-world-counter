import { formatCombo } from '../game/catalog'
import { isComplete, playerTotal } from '../game/game'
import type { Game } from '../game/types'
import { LLM_RECAP_ENABLED } from './llmRecap'

export type Recap = {
  winnerNames: string[]
  paragraphs: string[]
}

export type RecapGenerator = (game: Game) => Recap

function peakRound(game: Game, playerId: string): { round: number; score: number } | null {
  const turns = game.history.filter((t) => t.playerId === playerId)
  if (turns.length === 0) return null
  return turns.reduce(
    (best, turn) =>
      turn.score.total > best.score
        ? { round: turn.round, score: turn.score.total }
        : best,
    { round: turns[0]!.round, score: turns[0]!.score.total },
  )
}

export const generateRecap: RecapGenerator = (game) => {
  const totals = game.players.map((player) => ({
    name: player.name,
    id: player.id,
    total: playerTotal(game, player.id),
  }))
  const best = Math.max(...totals.map((t) => t.total))
  const winnerNames = totals.filter((t) => t.total === best).map((t) => t.name)

  const paragraphs: string[] = []
  if (isComplete(game)) {
    if (winnerNames.length === 1) {
      paragraphs.push(
        `Партия окончена. Победа у ${winnerNames[0]} с ${best} монетами победы.`,
      )
    } else {
      paragraphs.push(
        `Партия окончена вничью: ${winnerNames.join(', ')} по ${best} монет. При равенстве побеждает тот, у кого больше жетонов на поле.`,
      )
    }
  } else {
    paragraphs.push('Партия ещё идёт. Ниже — промежуточный разбор по уже записанным ходам.')
  }

  for (const player of game.players) {
    const firstPick = game.history.find(
      (t) => t.playerId === player.id && t.action === 'select' && t.newCombo,
    )
    const startCombo = firstPick?.newCombo
      ? formatCombo(firstPick.newCombo.race, firstPick.newCombo.power)
      : 'раса ещё не взята'
    const declines = game.history.filter(
      (t) => t.playerId === player.id && t.action === 'decline',
    )
    const peak = peakRound(game, player.id)
    const declineText =
      declines.length === 0
        ? 'упадок не брали'
        : `уход в упадок на ходе ${declines.map((d) => d.round).join(', ')}`
    const peakText = peak
      ? `лучший ход — ${peak.round}-й (${peak.score} монет)`
      : 'ходов пока нет'
    paragraphs.push(
      `${player.name}: старт — ${startCombo}. ${declineText}; ${peakText}. Итог: ${playerTotal(game, player.id)}.`,
    )
  }

  paragraphs.push(
    LLM_RECAP_ENABLED
      ? 'Разбор сгенерирован языковой моделью.'
      : 'Это шаблонный разбор по фактам партии. Позже его можно заменить вызовом LLM (см. analytics/llmRecap.ts). Снимки карты по ходам пока пустые (mapSnapshot).',
  )

  return { winnerNames, paragraphs }
}
