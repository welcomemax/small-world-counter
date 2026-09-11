import { afterEach, describe, expect, test } from 'vitest'
import {
  loadExpansionPreferences,
  saveExpansionPreferences,
} from './setupPreferences'

const KEY = 'small-world-counter.setup.expansions.v1'
const memory = new Map<string, string>()

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
  },
  configurable: true,
})

afterEach(() => memory.clear())

describe('setup expansion preferences', () => {
  test('uses a fresh base-only default when no preference is saved', () => {
    const first = loadExpansionPreferences()
    first.skyIslands = true

    expect(loadExpansionPreferences()).toEqual({ skyIslands: false })
  })

  test('restores the saved Sky Islands preference', () => {
    saveExpansionPreferences({ skyIslands: true })

    expect(memory.get(KEY)).toBe('{"skyIslands":true}')
    expect(loadExpansionPreferences()).toEqual({ skyIslands: true })
  })

  test.each(['{nope', 'null', '[]', '{"skyIslands":"yes"}'])(
    'falls back safely for malformed data: %s',
    (stored) => {
      memory.set(KEY, stored)

      expect(loadExpansionPreferences()).toEqual({ skyIslands: false })
    },
  )
})
