export type CapacityLevel = 'normal' | 'high' | 'over'

/** accent < 80 %, warning 80–100 %, danger > 100 % (DESIGN_SYSTEM.md §8.4). */
export function capacityLevel(current: number, max: number): CapacityLevel {
  if (max <= 0) return 'normal'
  const ratio = current / max
  if (ratio > 1) return 'over'
  if (ratio >= 0.8) return 'high'
  return 'normal'
}
