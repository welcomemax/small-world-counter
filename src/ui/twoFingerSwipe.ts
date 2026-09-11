export const HORIZONTAL_SWIPE_MIN_PX = 72

/** Trackpads report a swipe as many small wheel steps, so travel is summed. */
export const HORIZONTAL_WHEEL_MIN_PX = 100
const WHEEL_IDLE_MS = 160

export type Point = { x: number; y: number }

export function twoFingerCentroid(points: readonly Point[]): Point | null {
  if (points.length !== 2) return null
  const a = points[0]!
  const b = points[1]!
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** True when the centroid moved far enough sideways, not as a vertical scroll. */
export function isHorizontalTwoFingerSwipe(
  from: Point,
  to: Point,
  minPx = HORIZONTAL_SWIPE_MIN_PX,
): boolean {
  const dx = to.x - from.x
  const dy = to.y - from.y
  return Math.abs(dx) >= minPx && Math.abs(dx) > Math.abs(dy) * 1.5
}

export function pointsFromTouchList(touches: ArrayLike<{ clientX: number; clientY: number }>): Point[] {
  return Array.from(touches, (touch) => ({ x: touch.clientX, y: touch.clientY }))
}

export type WheelStep = { deltaX: number; deltaY: number }

export function isSidewaysWheel({ deltaX, deltaY }: WheelStep): boolean {
  return Math.abs(deltaX) > Math.abs(deltaY) * 1.5
}

export type WheelSwipeTracker = {
  /** True exactly once per gesture, when the sideways travel is long enough. */
  push: (step: WheelStep, at: number) => boolean
}

export function createWheelSwipeTracker(
  minPx = HORIZONTAL_WHEEL_MIN_PX,
  idleMs = WHEEL_IDLE_MS,
): WheelSwipeTracker {
  let travel = 0
  let last = Number.NEGATIVE_INFINITY
  let spent = false

  return {
    push(step, at) {
      if (at - last > idleMs) {
        travel = 0
        spent = false
      }
      last = at

      if (!isSidewaysWheel(step)) {
        travel = 0
        return false
      }

      travel += step.deltaX
      if (spent || Math.abs(travel) < minPx) return false
      travel = 0
      spent = true
      return true
    },
  }
}
