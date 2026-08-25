import { describe, expect, test } from 'vitest'
import { applyTurn, createGame } from '../game/game'
import { generateRecap } from './templateRecap'

describe('generateRecap', () => {
  test('names the winner and decline timing from recorded turns', () => {
    let game = createGame({
      players: [{ name: 'Анна' }, { name: 'Борис' }],
      turnCount: 2,
      scoreHidden: true,
    })
    game = applyTurn(game, {
      action: 'select',
      score: { total: 4 },
      newCombo: { race: 'humans', power: 'merchant' },
    })
    game = applyTurn(game, {
      action: 'select',
      score: { total: 3 },
      newCombo: { race: 'orcs', power: 'flying' },
    })
    game = applyTurn(game, { action: 'decline', score: { total: 8 } })
    game = applyTurn(game, { action: 'expand', score: { total: 2 } })

    const recap = generateRecap(game)
    expect(recap.winnerNames).toEqual(['Анна'])
    expect(recap.paragraphs.join('\n')).toMatch(/Анна/)
    expect(recap.paragraphs.join('\n')).toMatch(/упад/)
    expect(recap.paragraphs.join('\n')).toMatch(/Борис/)
  })
})
