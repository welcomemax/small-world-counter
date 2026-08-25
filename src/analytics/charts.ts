import { playerTotal } from '../game/game'
import type { Game } from '../game/types'

export type LinePoint = {
  round: number
} & Record<string, number | string>

export function scoreLineData(game: Game): LinePoint[] {
  const running: Record<string, number> = {}
  for (const player of game.players) {
    running[player.id] = playerTotal({ ...game, history: [] }, player.id)
  }
  const start: LinePoint = { round: 0 }
  for (const player of game.players) {
    start[player.name] = running[player.id]!
  }
  const points: LinePoint[] = [start]
  const maxRound = Math.max(0, ...game.history.map((t) => t.round))
  for (let round = 1; round <= maxRound; round++) {
    const slice = game.history.filter((t) => t.round === round)
    for (const turn of slice) {
      running[turn.playerId] = (running[turn.playerId] ?? 0) + turn.score.total
      if (turn.comboCoins) {
        running[turn.playerId]! += turn.comboCoins.taken - turn.comboCoins.paid
      }
    }
    const row: LinePoint = { round }
    for (const player of game.players) {
      row[player.name] = running[player.id] ?? 0
    }
    points.push(row)
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
