import type { RegionOwnership } from '../game/types'

/**
 * Vision / photo occupancy detection is out of v1.
 * Later: fill PlayerTurn.mapSnapshot from a camera still of the board.
 */
export type VisionAdapter = {
  detectOccupancy(image: Blob): Promise<RegionOwnership[]>
}

export const VISION_ENABLED = false
