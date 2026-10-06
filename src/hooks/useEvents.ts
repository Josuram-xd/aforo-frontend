import { useQuery } from '@tanstack/react-query'
import { getEvents } from '../api/aforoClient'
import { POLL_INTERVAL_MS } from './polling'

/** `from` and `to` are optional ISO 8601 timestamps. */
export function useEvents(from?: string, to?: string) {
  return useQuery({
    queryKey: ['events', from, to],
    queryFn: () => getEvents(from, to),
    refetchInterval: POLL_INTERVAL_MS,
  })
}
