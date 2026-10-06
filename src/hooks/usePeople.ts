import { useQuery } from '@tanstack/react-query'
import { getPeople } from '../api/aforoClient'
import { POLL_INTERVAL_MS } from './polling'

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: getPeople,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
