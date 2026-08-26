import { describe, expect, test } from 'vitest'
import { COPYRIGHT_LINE, PUBLISHER_NAME, PUBLISHER_URL } from './legal'

describe('publisher credit', () => {
  test('points at the official Days of Wonder product page', () => {
    expect(PUBLISHER_URL).toBe('https://www.daysofwonder.com/game/small-world/')
    expect(PUBLISHER_NAME).toBe('Days of Wonder')
    expect(COPYRIGHT_LINE).toContain('© 2009–2018 Days of Wonder, Inc.')
  })
})
