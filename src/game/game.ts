import { isSpiritPower } from './catalog'
import {
  MARKET_SIZE,
  emptyMarket,
  setSlotCoins,
  setSlotCombo,
  takeSlot,
  type ComboMarket,
} from './market'
import {
  STARTING_COINS,
  type Actor,
  type Combo,
  type ComboCoins,
  type CreateGameInput,
  type Game,
  type PlayerSetup,
  type PlayerState,
  type PlayerTurn,
  type TurnInput,
} from './types'
import { validateTurnScore } from './score'

export function defaultTurnCount(playerCount: number): number {
  if (playerCount === 2) return 10
  if (playerCount === 5) return 8
  return 9
}

function comboNet(coins: ComboCoins | undefined): number {
  if (!coins) return 0
  return coins.taken - coins.paid
}

function nextDeclined(current: Combo[], incoming: Combo): Combo[] {
  if (isSpiritPower(incoming.power)) {
    return [...current, incoming]
  }
  return [...current.filter((combo) => isSpiritPower(combo.power)), incoming]
}

function derivePlayers(setup: PlayerSetup[], history: PlayerTurn[]): PlayerState[] {
  const players: PlayerState[] = setup.map((entry, index) => ({
    id: `p${index}`,
    name: entry.name,
    activeCombo: null,
    declined: [],
    awaitingSelect: true,
  }))

  const byId = new Map(players.map((p) => [p.id, p]))
  for (const turn of history) {
    const player = byId.get(turn.playerId)
    if (!player) {
      throw new Error(`Unknown player ${turn.playerId}`)
    }
    if (turn.action === 'expand') {
      if (player.awaitingSelect || !player.activeCombo) {
        throw new Error('Player must select a new race before expanding')
      }
    } else if (turn.action === 'decline') {
      if (player.awaitingSelect || !player.activeCombo) {
        throw new Error('Player must select a new race before declining')
      }
      player.declined = nextDeclined(player.declined, player.activeCombo)
      player.activeCombo = null
      player.awaitingSelect = true
    } else if (turn.action === 'select') {
      if (!player.awaitingSelect) {
        throw new Error('Select is only allowed when picking a race')
      }
      if (!turn.newCombo) {
        throw new Error('New combo is required')
      }
      player.activeCombo = turn.newCombo
      player.awaitingSelect = false
    }
  }

  return players
}

function withPlayers(
  game: Omit<Game, 'players'> & { players?: PlayerState[] },
): Game {
  return { ...game, players: derivePlayers(game.setup, game.history) }
}

export function createGame(input: CreateGameInput): Game {
  if (input.players.length < 2 || input.players.length > 5) {
    throw new Error('Small World is for 2–5 players')
  }
  const firstPlayerIndex = input.firstPlayerIndex ?? 0
  if (firstPlayerIndex < 0 || firstPlayerIndex >= input.players.length) {
    throw new Error('Invalid first player')
  }
  return withPlayers({
    setup: input.players.map((p) => ({ name: p.name })),
    turnCount: input.turnCount ?? defaultTurnCount(input.players.length),
    scoreHidden: input.scoreHidden ?? true,
    history: [],
    firstPlayerIndex,
    market: input.market ?? emptyMarket(),
    marketHistory: [],
  })
}

/** Rebuilds derived player state from a stored game, keeping the hand-edited column. */
export function hydrateGame(stored: unknown): Game | null {
  const game = stored as Game | null
  if (!game?.setup?.length || !Array.isArray(game.history)) return null
  if (!game.market?.slots || game.market.slots.length !== MARKET_SIZE) return null
  return withPlayers({
    setup: game.setup.map((p) => ({ name: p.name })),
    turnCount: game.turnCount,
    scoreHidden: game.scoreHidden,
    history: game.history,
    firstPlayerIndex: game.firstPlayerIndex ?? 0,
    market: game.market,
    marketHistory: Array.isArray(game.marketHistory) ? game.marketHistory : [],
  })
}

export function currentActor(game: Game): Actor {
  const n = game.setup.length
  const i = game.history.length
  return {
    playerId: `p${(game.firstPlayerIndex + i) % n}`,
    round: Math.floor(i / n) + 1,
  }
}

export function isComplete(game: Game): boolean {
  return game.history.length >= game.turnCount * game.setup.length
}

export function playerTotal(game: Game, playerId: string): number {
  const index = Number(playerId.slice(1))
  const setup = game.setup[index]
  if (!setup) throw new Error(`Unknown player ${playerId}`)
  const fromTurns = game.history
    .filter((turn) => turn.playerId === playerId)
    .reduce((sum, turn) => sum + turn.score.total + comboNet(turn.comboCoins), 0)
  return STARTING_COINS + fromTurns
}

export function editMarketCombo(
  game: Game,
  index: number,
  combo: Combo | null,
): Game {
  return { ...game, market: setSlotCombo(game.market, index, combo) }
}

export function editMarketCoins(game: Game, index: number, coins: number): Game {
  return { ...game, market: setSlotCoins(game.market, index, coins) }
}

type ResolvedSelect = {
  newCombo: Combo
  comboCoins: ComboCoins
  marketIndex?: number
  market: ComboMarket
}

function resolveSelect(game: Game, input: TurnInput): ResolvedSelect {
  if (input.marketIndex != null) {
    const pick = takeSlot(game.market, input.marketIndex)
    return {
      newCombo: pick.combo,
      comboCoins: { paid: pick.paid, taken: pick.taken },
      marketIndex: input.marketIndex,
      market: pick.market,
    }
  }
  if (!input.newCombo) {
    throw new Error('Pick a combo from the column')
  }
  return {
    newCombo: input.newCombo,
    comboCoins: input.comboCoins ?? { paid: 0, taken: 0 },
    market: game.market,
  }
}

export function applyTurn(game: Game, input: TurnInput): Game {
  if (isComplete(game)) {
    throw new Error('Game is already complete')
  }
  validateTurnScore(input.score)
  const actor = currentActor(game)
  const select =
    input.action === 'select' ? resolveSelect(game, input) : undefined
  const turn: PlayerTurn = {
    ...input,
    ...(select
      ? {
          newCombo: select.newCombo,
          comboCoins: select.comboCoins,
          marketIndex: select.marketIndex,
        }
      : {}),
    playerId: actor.playerId,
    round: actor.round,
    mapSnapshot: null,
  }
  return withPlayers({
    ...game,
    history: [...game.history, turn],
    market: select?.market ?? game.market,
    marketHistory: [...game.marketHistory, game.market],
  })
}

export function undo(game: Game): Game {
  if (game.history.length === 0) return game
  const restored = game.marketHistory.at(-1) ?? game.market
  return withPlayers({
    ...game,
    history: game.history.slice(0, -1),
    market: restored,
    marketHistory: game.marketHistory.slice(0, -1),
  })
}

export function setScoreHidden(game: Game, scoreHidden: boolean): Game {
  return { ...game, scoreHidden }
}

export function setTokensOnBoard(
  game: Game,
  tokens: Record<string, number>,
): Game {
  return {
    ...game,
    players: game.players.map((player) => ({
      ...player,
      tokensOnBoard: tokens[player.id],
    })),
  }
}
