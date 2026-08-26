import type { TurnScore } from './types'

export type ScoreBreakdown = {
  activeRegions: number
  declineRegions: number
  bonus: number
}

const SCORE_PARTS = ['activeRegions', 'declineRegions', 'bonus'] as const

function assertCoinValue(value: number): void {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error('Score values must be non-negative integers')
  }
}

export function scoreTotal(score: ScoreBreakdown): number {
  return score.activeRegions + score.declineRegions + score.bonus
}

export function toTurnScore(score: ScoreBreakdown): TurnScore {
  return { total: scoreTotal(score), ...score }
}

export function validateTurnScore(score: TurnScore): void {
  assertCoinValue(score.total)
  const suppliedParts = SCORE_PARTS.filter((part) => score[part] !== undefined)
  if (suppliedParts.length === 0) return
  if (suppliedParts.length !== SCORE_PARTS.length) {
    throw new Error('All score parts are required for an itemized score')
  }

  const breakdown: ScoreBreakdown = {
    activeRegions: score.activeRegions!,
    declineRegions: score.declineRegions!,
    bonus: score.bonus!,
  }
  SCORE_PARTS.forEach((part) => assertCoinValue(breakdown[part]))
  if (score.total !== scoreTotal(breakdown)) {
    throw new Error('Score total must equal its breakdown')
  }
}
