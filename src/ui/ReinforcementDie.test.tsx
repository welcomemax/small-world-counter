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

function dispatchTouches(
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: { clientX: number; clientY: number }[],
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'touches', { value: touches })
  window.dispatchEvent(event)
}

function wheelStep(deltaX: number, deltaY: number) {
  const event = new WheelEvent('wheel', {
    deltaX,
    deltaY,
    bubbles: true,
    cancelable: true,
  })
  window.dispatchEvent(event)
  return event
}

function swipeTwoFingersHorizontally() {
  dispatchTouches('touchstart', [
    { clientX: 80, clientY: 240 },
    { clientX: 120, clientY: 248 },
  ])
  dispatchTouches('touchmove', [
    { clientX: 180, clientY: 242 },
    { clientX: 220, clientY: 250 },
  ])
}

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

  test('opens on a two-finger horizontal swipe', () => {
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)
    act(() => {
      vi.runAllTimers()
    })
    act(() => {
      swipeTwoFingersHorizontally()
    })
    expect(screen.getByRole('dialog', { name: 'Кубик подкрепления' })).toBeTruthy()
  })

  test('opens on a trackpad swipe and keeps the page from scrolling sideways', () => {
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)
    const steps: WheelEvent[] = []
    act(() => {
      for (let step = 0; step < 4; step += 1) steps.push(wheelStep(40, 2))
    })

    expect(steps.at(-1)?.defaultPrevented).toBe(true)
    expect(screen.getByRole('dialog', { name: 'Кубик подкрепления' })).toBeTruthy()
  })

  test('lets a vertical wheel scroll the page as usual', () => {
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)
    const steps: WheelEvent[] = []
    act(() => {
      for (let step = 0; step < 6; step += 1) steps.push(wheelStep(3, 90))
    })

    expect(steps.at(-1)?.defaultPrevented).toBe(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('ignores a pinch zoom', () => {
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)
    act(() => {
      for (let step = 0; step < 4; step += 1) {
        window.dispatchEvent(
          new WheelEvent('wheel', {
            deltaX: 40,
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          }),
        )
      }
    })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  test('ignores a one-finger drag', () => {
    roll.mockReturnValue(1)
    render(<ReinforcementDie />)
    act(() => {
      vi.runAllTimers()
    })
    act(() => {
      dispatchTouches('touchstart', [{ clientX: 80, clientY: 240 }])
      dispatchTouches('touchmove', [{ clientX: 220, clientY: 240 }])
    })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
