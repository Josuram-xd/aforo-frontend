import { createContext, useContext } from 'react'

export type LiveStatus = 'connecting' | 'connected' | 'reconnecting'

export const RealtimeContext = createContext<LiveStatus>('connecting')

export function useLiveStatus(): LiveStatus {
  return useContext(RealtimeContext)
}

/** Slow polling fallback (ADR-006): only while the websocket is not connected. */
export const FALLBACK_POLL_MS = 30_000

export function useFallbackRefetchInterval(): number | false {
  return useLiveStatus() === 'connected' ? false : FALLBACK_POLL_MS
}
