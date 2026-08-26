import { describe, expect, test } from 'vitest'
import { DIE_FACES, rollReinforcementDie } from './reinforcementDie'

describe('reinforcement die', () => {
  test('has three blank faces and one each of 1, 2 and 3', () => {
    expect([...DIE_FACES]).toEqual([0, 0, 0, 1, 2, 3])
  })

  test.each([
    [0, 0],
    [0.2, 0],
    [0.4, 0],
    [0.55, 1],
    [0.75, 2],
    [0.9, 3],
  ])('random %s lands on face %s', (random, face) => {
    expect(rollReinforcementDie(() => random)).toBe(face)
  })

  test('stays on the die when the random source returns its upper bound', () => {
    expect(rollReinforcementDie(() => 1)).toBe(3)
  })
})
