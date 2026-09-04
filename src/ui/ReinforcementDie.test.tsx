// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ReinforcementDie } from './ReinforcementDie'
import { soundEngine } from '../audio/engine'

const roll = vi.hoisted(() => vi.fn())

vi.mock('../game/reinforcementDie', () => ({
  DIE_FACES: [0, 0, 0, 1, 2, 3] as const,
  rollReinforcementDie: roll,
}))

function prefersReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

const open = () =>
  fireEvent.click(
    screen.getByRole('button', { name: 'Бросить кубик подкрепления' }),
  )

const settle = () => act(() => vi.runAllTimers())

beforeEach(() => {
  vi.useFakeTimers()
  prefersReducedMotion(false)
  roll.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe('ReinforcementDie', () => {
  test('rattles when the overlay opens', () => {
    const play = vi.spyOn(soundEngine, 'play')
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)
    open()
    expect(play).toHaveBeenCalledWith('die')
    play.mockRestore()
  })

  test('sings the revealed face after the tumble', () => {
    const play = vi.spyOn(soundEngine, 'play')
    roll.mockReturnValue(2)
    render(<ReinforcementDie />)
    open()
    settle()
    expect(play).toHaveBeenCalledWith('die2')
    play.mockRestore()
  })

  test('sings a blank face when reduced motion skips the tumble', () => {
    prefersReducedMotion(true)
    const play = vi.spyOn(soundEngine, 'play')
    roll.mockReturnValue(0)
    render(<ReinforcementDie />)
    open()
    expect(play).toHaveBeenCalledWith('dieBlank')
    play.mockRestore()
  })

  test('shows a numbered face as extra strength for the conquest', () => {
    roll.mockReturnValue(2)
    render(<ReinforcementDie />)

    open()
    settle()

    expect(screen.getByRole('dialog', { name: 'Кубик подкрепления' })).toBeTruthy()
    expect(screen.getByText('+2 к завоеванию')).toBeTruthy()
  })

  test('spells out a blank face instead of showing a bare zero', () => {
    roll.mockReturnValue(0)
    render(<ReinforcementDie />)

    open()
    settle()

    expect(screen.getByText('Пусто — подкрепления нет')).toBeTruthy()
  })

  test('ignores a second roll while the die is still tumbling', () => {
    roll.mockReturnValue(3)
    render(<ReinforcementDie />)

    open()
    fireEvent.click(screen.getByRole('button', { name: 'Бросить ещё раз' }))
    settle()

    expect(roll).toHaveBeenCalledTimes(1)
  })

  test('closes with Escape and forgets the result', () => {
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)

    open()
    settle()
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText('+1 к завоеванию')).toBeNull()
  })

  test('skips the tumble when the player prefers reduced motion', () => {
    prefersReducedMotion(true)
    roll.mockReturnValue(3)
    render(<ReinforcementDie />)

    open()

    expect(screen.getByText('+3 к завоеванию')).toBeTruthy()
  })
})
