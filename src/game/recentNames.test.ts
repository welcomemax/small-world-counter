import { afterEach, describe, expect, test } from 'vitest'
import {
  FUNNY_NAMES,
  loadRecentNames,
  nameSuggestions,
  saveRecentNames,
} from './recentNames'

const memory = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
  },
  configurable: true,
})

afterEach(() => memory.clear())

describe('recent player names', () => {
  test('stores trimmed unique names with the newest first', () => {
    saveRecentNames(['  Миша ', 'Анна', 'миша', '', 'Борис'])
    expect(loadRecentNames()).toEqual(['Борис', 'миша', 'Анна'])
  })

  test('merges new names with history and caps it at twelve', () => {
    saveRecentNames(Array.from({ length: 12 }, (_, i) => `Игрок ${i + 1}`))
    saveRecentNames(['Новый', 'Игрок 12'])
    expect(loadRecentNames()).toHaveLength(12)
    expect(loadRecentNames().slice(0, 2)).toEqual(['Игрок 12', 'Новый'])
  })

  test('recovers from malformed storage', () => {
    memory.set('small-world-counter.recent-names.v1', '{nope')
    expect(loadRecentNames()).toEqual([])
  })
})

describe('nameSuggestions', () => {
  test('uses playful defaults when there is no history', () => {
    expect(nameSuggestions([], ['', ''], 0)).toEqual(FUNNY_NAMES)
  })

  test('filters names already used by another player', () => {
    expect(nameSuggestions(['Анна', 'Борис', 'Миша'], ['Анна', ''], 1)).toEqual([
      'Борис',
      'Миша',
    ])
  })

  test('keeps the current row value available', () => {
    expect(
      nameSuggestions(['Анна', 'Борис'], ['Анна', 'Борис'], 0),
    ).toEqual(['Анна'])
  })
})
