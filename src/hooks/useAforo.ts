import { useQuery } from '@tanstack/react-query'
import { getAforo } from '../api/aforoClient'
import { POLL_INTERVAL_MS } from './polling'

export function useAforo() {
  return useQuery({
    queryKey: ['aforo'],
    queryFn: getAforo,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
