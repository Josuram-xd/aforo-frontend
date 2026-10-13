/** The hero occupancy number (96px, §8.2). */
export function OccupancyNumber({ value }: { value: number }) {
  return <span className="occupancy-number">{value}</span>
}
