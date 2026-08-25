import { hydrateGame } from './game'
import type { Game } from './types'

const KEY = 'small-world-counter.game.v3'

export function saveGame(game: Game): void {
  localStorage.setItem(KEY, JSON.stringify(game))
}

export function clearSavedGame(): void {
  localStorage.removeItem(KEY)
}

export function loadGame(): Game | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    return hydrateGame(JSON.parse(raw))
  } catch {
    return null
  }
}
