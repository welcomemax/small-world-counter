import { playerTotal } from '../game/game'
import type { Game } from '../game/types'

export type LinePoint = {
  round: number
  /** Running coin total by player name. */
  totals: Record<string, number>
  /** Coins this round added, by player name. Empty at the starting point. */
  gains: Record<string, number>
}

function turnGain(turn: Game['history'][number]): number {
  const combo = turn.comboCoins
  return turn.score.total + (combo ? combo.taken - combo.paid : 0)
}

export function scoreLineData(game: Game): LinePoint[] {
  const running: Record<string, number> = {}
  for (const player of game.players) {
    running[player.id] = playerTotal({ ...game, history: [] }, player.id)
  }
  const totalsByName = (): Record<string, number> =>
    Object.fromEntries(
      game.players.map((player) => [player.name, running[player.id] ?? 0]),
    )

  const points: LinePoint[] = [
    { round: 0, totals: totalsByName(), gains: {} },
  ]
  const maxRound = Math.max(0, ...game.history.map((t) => t.round))
  const nameById = new Map(game.players.map((player) => [player.id, player.name]))

  for (let round = 1; round <= maxRound; round++) {
    const gains: Record<string, number> = {}
    for (const turn of game.history.filter((t) => t.round === round)) {
      const gain = turnGain(turn)
      running[turn.playerId] = (running[turn.playerId] ?? 0) + gain
      const name = nameById.get(turn.playerId)
      if (name) gains[name] = (gains[name] ?? 0) + gain
    }
    points.push({ round, totals: totalsByName(), gains })
  }
  return points
}

export type StackRow = {
  name: string
  active: number
  decline: number
  bonus: number
  other: number
}

export function scoreStackData(game: Game): StackRow[] {
  return game.players.map((player) => {
    const turns = game.history.filter((t) => t.playerId === player.id)
    let active = 0
    let decline = 0
    let bonus = 0
    let other = 0
    for (const turn of turns) {
      const { activeRegions, declineRegions, bonus: b, total } = turn.score
      if (activeRegions == null && declineRegions == null && b == null) {
        other += total
      } else {
        active += activeRegions ?? 0
        decline += declineRegions ?? 0
        bonus += b ?? 0
        const accounted = (activeRegions ?? 0) + (declineRegions ?? 0) + (b ?? 0)
        other += Math.max(0, total - accounted)
      }
    }
    return { name: player.name, active, decline, bonus, other }
  })
}
