import { describe, expect, test } from 'vitest'
import {
  HORIZONTAL_SWIPE_MIN_PX,
  HORIZONTAL_WHEEL_MIN_PX,
  createWheelSwipeTracker,
  isHorizontalTwoFingerSwipe,
  twoFingerCentroid,
} from './twoFingerSwipe'

describe('twoFingerCentroid', () => {
  test('averages exactly two fingers', () => {
    expect(
      twoFingerCentroid([
        { x: 0, y: 10 },
        { x: 40, y: 30 },
      ]),
    ).toEqual({ x: 20, y: 20 })
  })

  test('ignores one finger or a crowd', () => {
    expect(twoFingerCentroid([{ x: 0, y: 0 }])).toBeNull()
    expect(
      twoFingerCentroid([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]),
    ).toBeNull()
  })
})

describe('isHorizontalTwoFingerSwipe', () => {
  const start = { x: 100, y: 200 }

  test('accepts a wide sideways move', () => {
    expect(
      isHorizontalTwoFingerSwipe(start, {
        x: start.x + HORIZONTAL_SWIPE_MIN_PX + 8,
        y: start.y + 10,
      }),
    ).toBe(true)
  })

  test('rejects a mostly vertical move and a short flick', () => {
    expect(
      isHorizontalTwoFingerSwipe(start, { x: start.x + 20, y: start.y + 90 }),
    ).toBe(false)
    expect(
      isHorizontalTwoFingerSwipe(start, { x: start.x + 20, y: start.y }),
    ).toBe(false)
  })
})

describe('createWheelSwipeTracker', () => {
  const sideways = { deltaX: 30, deltaY: 1 }

  test('adds up the small steps a trackpad reports', () => {
    const tracker = createWheelSwipeTracker()
    const fired: boolean[] = []
    for (let step = 1; step <= 4; step += 1) {
      fired.push(tracker.push(sideways, step * 20))
    }
    expect(fired).toEqual([false, false, false, true])
  })

  test('leaves vertical scrolling alone and forgets the travel so far', () => {
    const tracker = createWheelSwipeTracker()
    tracker.push(sideways, 0)
    tracker.push(sideways, 20)
    expect(tracker.push({ deltaX: 4, deltaY: 60 }, 40)).toBe(false)
    expect(tracker.push(sideways, 60)).toBe(false)
  })

  test('rolls once per gesture, even while the swipe keeps coasting', () => {
    const tracker = createWheelSwipeTracker()
    const long = { deltaX: HORIZONTAL_WHEEL_MIN_PX, deltaY: 0 }
    expect(tracker.push(long, 0)).toBe(true)
    expect(tracker.push(long, 20)).toBe(false)
    expect(tracker.push(long, 40)).toBe(false)
  })

  test('starts over after the fingers rest', () => {
    const tracker = createWheelSwipeTracker()
    const long = { deltaX: HORIZONTAL_WHEEL_MIN_PX, deltaY: 0 }
    expect(tracker.push(long, 0)).toBe(true)
    expect(tracker.push(long, 1000)).toBe(true)
  })
})
