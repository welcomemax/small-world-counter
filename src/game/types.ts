import type { PowerId, RaceId } from './catalog'
import type { ComboMarket } from './market'

export const STARTING_COINS = 5

export type Combo = {
  race: RaceId
  power: PowerId
}

export type ComboCoins = {
  paid: number
  taken: number
}

export type TurnScore = {
  total: number
  activeRegions?: number
  declineRegions?: number
  bonus?: number
}

/** Filled later by a map UI or vision pipeline. Always null in v1. */
export type RegionOwnership = {
  regionId: string
  playerId: string
  occupancy: 'active' | 'decline'
}

export type TurnAction = 'expand' | 'decline' | 'select'

export type TurnInput = {
  action: TurnAction
  score: TurnScore
  newCombo?: Combo
  comboCoins?: ComboCoins
  marketIndex?: number
}

export type PlayerTurn = TurnInput & {
  playerId: string
  round: number
  mapSnapshot: RegionOwnership[] | null
}

export type PlayerSetup = {
  name: string
}

export type CreateGameInput = {
  players: PlayerSetup[]
  turnCount?: number
  scoreHidden?: boolean
  firstPlayerIndex?: number
  market?: ComboMarket
}

export type PlayerState = {
  id: string
  name: string
  activeCombo: Combo | null
  declined: Combo[]
  awaitingSelect: boolean
  tokensOnBoard?: number
}

export type Game = {
  players: PlayerState[]
  turnCount: number
  scoreHidden: boolean
  setup: PlayerSetup[]
  history: PlayerTurn[]
  firstPlayerIndex: number
  market: ComboMarket
  /** Column state before each recorded turn, so undo can restore it. */
  marketHistory: ComboMarket[]
}

export type Actor = {
  playerId: string
  round: number
}
