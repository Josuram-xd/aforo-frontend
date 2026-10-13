import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { REALTIME_INVALIDATIONS, type RealtimeTable } from '../api/queryKeys'
import { isMockMode } from '../lib/env'
import { supabase } from '../lib/supabase'
import { RealtimeContext, type LiveStatus } from './realtimeContext'

const TABLES = Object.keys(REALTIME_INVALIDATIONS) as RealtimeTable[]
/** Groups bursts of changes (several events in a second) into one refetch. */
const INVALIDATE_DEBOUNCE_MS = 250

interface RealtimeProviderProps {
  /** Subscribe only with a signed-in session: Realtime applies RLS with the user's JWT. */
  enabled: boolean
  children: ReactNode
}

/**
 * One websocket channel for the tables aforo-db publishes. Messages never write to the cache;
 * they invalidate the affected queries, which refetch through RLS (ARCHITECTURE.md §8.2).
 */
export function RealtimeProvider({ enabled, children }: RealtimeProviderProps) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LiveStatus>(isMockMode ? 'connected' : 'connecting')

  useEffect(() => {
    if (!enabled || isMockMode) return

    const pending = new Set<RealtimeTable>()
    let timer: ReturnType<typeof setTimeout> | null = null

    const flush = () => {
      timer = null
      const tables = Array.from(pending)
      pending.clear()
      for (const table of tables) {
        for (const queryKey of REALTIME_INVALIDATIONS[table]) {
          void queryClient.invalidateQueries({ queryKey })
        }
      }
    }

    const schedule = (table: RealtimeTable) => {
      pending.add(table)
      timer ??= setTimeout(flush, INVALIDATE_DEBOUNCE_MS)
    }

    let wasConnected = false
    const channel = supabase.channel('aforo-live')
    for (const table of TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => schedule(table))
    }
    channel.subscribe((state) => {
      if (state === 'SUBSCRIBED') {
        // After a reconnect, refetch everything that may have changed while offline.
        if (wasConnected) TABLES.forEach(schedule)
        wasConnected = true
        setStatus('connected')
      } else {
        setStatus('reconnecting')
      }
    })

    return () => {
      if (timer) clearTimeout(timer)
      timer = null
      pending.clear()
      void supabase.removeChannel(channel)
      setStatus('connecting')
    }
  }, [enabled, queryClient])

  return <RealtimeContext.Provider value={status}>{children}</RealtimeContext.Provider>
}
