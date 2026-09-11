import { useEffect } from 'react'
import {
  createWheelSwipeTracker,
  isHorizontalTwoFingerSwipe,
  isSidewaysWheel,
  pointsFromTouchList,
  twoFingerCentroid,
  type Point,
} from './twoFingerSwipe'

/**
 * Fires once per two-finger sideways swipe, from a touchscreen or a trackpad.
 * Trackpads report the gesture as a horizontal wheel, which the browser would
 * otherwise spend on scrolling or on its own back-navigation swipe.
 */
export function useTwoFingerHorizontalSwipe(
  onSwipe: () => void,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled) return

    /** Never steal a gesture aimed at an open dialog. */
    const inDialog = () =>
      document.querySelector('[data-dialog-backdrop]') !== null

    let origin: Point | null = null
    let fired = false
    const wheel = createWheelSwipeTracker()

    const read = (event: TouchEvent) =>
      twoFingerCentroid(pointsFromTouchList(event.touches))

    const onStart = (event: TouchEvent) => {
      origin = read(event)
      fired = false
    }

    const onMove = (event: TouchEvent) => {
      if (!origin || fired || inDialog()) return
      const now = read(event)
      if (!now) {
        origin = null
        return
      }
      if (!isHorizontalTwoFingerSwipe(origin, now)) return
      fired = true
      event.preventDefault()
      onSwipe()
    }

    const onEnd = () => {
      origin = null
      fired = false
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || inDialog()) return
      const step = { deltaX: event.deltaX, deltaY: event.deltaY }
      if (isSidewaysWheel(step) && event.cancelable) event.preventDefault()
      if (wheel.push(step, event.timeStamp)) onSwipe()
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
      window.removeEventListener('wheel', onWheel)
    }
  }, [enabled, onSwipe])
}
