import { describe, expect, test } from 'vitest'
import { scoreTotal, toTurnScore, validateTurnScore } from './score'

describe('turn score', () => {
  test('derives total from the complete breakdown', () => {
    const breakdown = { activeRegions: 5, declineRegions: 2, bonus: 3 }
    expect(scoreTotal(breakdown)).toBe(10)
    expect(toTurnScore(breakdown)).toEqual({ total: 10, ...breakdown })
  })

  test('accepts legacy total-only scores', () => {
    expect(() => validateTurnScore({ total: 7 })).not.toThrow()
  })

  test('rejects incomplete or contradictory itemized scores', () => {
    expect(() =>
      validateTurnScore({ total: 4, activeRegions: 3, bonus: 1 }),
    ).toThrow(/all score parts/i)
    expect(() =>
      validateTurnScore({
        total: 9,
        activeRegions: 3,
        declineRegions: 2,
        bonus: 1,
      }),
    ).toThrow(/total.*breakdown/i)
  })

  test.each([
    { total: -1 },
    { total: Number.NaN },
    { total: 1.5 },
  ])('rejects invalid coin values: $total', (score) => {
    expect(() => validateTurnScore(score)).toThrow(/non-negative integer/i)
  })
})
