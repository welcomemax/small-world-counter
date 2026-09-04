// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { TurnTransition } from './TurnTransition'

afterEach(cleanup)

describe('TurnTransition cues', () => {
  test('announces the next player', () => {
    const play = vi.fn()
    render(
      <TurnTransition
        name="Анна"
        round={2}
        turnCount={9}
        newRound={false}
        opening={false}
        onDone={() => undefined}
        playCue={play}
      />,
    )
    expect(play).toHaveBeenCalledWith('handover')
  })

  test('uses a brighter cue at the start of a round', () => {
    const play = vi.fn()
    render(
      <TurnTransition
        name="Борис"
        round={3}
        turnCount={9}
        newRound
        opening={false}
        onDone={() => undefined}
        playCue={play}
      />,
    )
    expect(play).toHaveBeenCalledWith('newRound')
  })

  test('opens the party with a longer phrase', () => {
    const play = vi.fn()
    render(
      <TurnTransition
        name="Анна"
        round={1}
        turnCount={9}
        newRound={false}
        opening
        onDone={() => undefined}
        playCue={play}
      />,
    )
    expect(play).toHaveBeenCalledWith('opening')
  })
})
