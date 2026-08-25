import { currentActor, isComplete } from './game'
import type { Game } from './types'

/** Everything the fullscreen handover screen needs to announce a turn. */
export type Handover = {
  name: string
  round: number
  turnCount: number
  newRound: boolean
  opening: boolean
}

function announce(game: Game, extra: Pick<Handover, 'newRound' | 'opening'>): Handover | null {
  const actor = currentActor(game)
  const player = game.players.find((entry) => entry.id === actor.playerId)
  if (!player) return null
  return {
    name: player.name,
    round: Math.min(actor.round, game.turnCount),
    turnCount: game.turnCount,
    ...extra,
  }
}

export function openingHandover(game: Game): Handover | null {
  return announce(game, { newRound: false, opening: true })
}

export function handoverAfterTurn(game: Game): Handover | null {
  if (isComplete(game)) return null
  const actor = currentActor(game)
  return announce(game, {
    newRound: actor.playerId === `p${game.firstPlayerIndex}`,
    opening: false,
  })
}
