import { describe, expect, test } from 'vitest'
import { emptyMarket, setSlotCombo } from '../game/market'
import type { Combo } from '../game/types'
import { setupIssue } from './setupModel'

const COMBOS: Combo[] = [
  { race: 'amazons', power: 'alchemist' },
  { race: 'dwarves', power: 'berserk' },
  { race: 'elves', power: 'bivouacking' },
  { race: 'ghouls', power: 'commando' },
  { race: 'giants', power: 'diplomat' },
  { race: 'halflings', power: 'dragonMaster' },
]

function fullMarket(combos = COMBOS) {
  return combos.reduce(
    (market, combo, index) => setSlotCombo(market, index, combo),
    emptyMarket(),
  )
}

describe('setupIssue', () => {
  test('asks for all player names first', () => {
    expect(setupIssue(['Анна', ''], emptyMarket())).toBe(
      'Введите имена всех игроков',
    )
  })

  test('rejects duplicate names ignoring whitespace and case', () => {
    expect(setupIssue([' Анна ', 'анна'], fullMarket())).toBe(
      'Имена игроков не должны повторяться',
    )
  })

  test('asks for all six market rows', () => {
    expect(setupIssue(['Анна', 'Борис'], emptyMarket())).toBe(
      'Заполните все шесть связок',
    )
  })

  test('rejects a repeated race or power in the market', () => {
    const duplicate = [...COMBOS]
    duplicate[5] = { race: 'amazons', power: 'flying' }
    expect(setupIssue(['Анна', 'Борис'], fullMarket(duplicate))).toBe(
      'Расы и силы в колонке не должны повторяться',
    )
  })

  test('returns null when setup is ready', () => {
    expect(setupIssue(['Анна', 'Борис'], fullMarket())).toBeNull()
  })
})
