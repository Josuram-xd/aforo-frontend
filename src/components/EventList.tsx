import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EventItem } from '../api/types'
import { formatTimeWithSeconds } from '../lib/format'
import { DirectionBadge, MethodBadge } from './EventBadges'
import './EventList.css'

interface EventListProps {
  events: EventItem[]
}

/**
 * Reverse-chronological event feed; new rows slide in at the top (off with reduced motion).
 */
export function EventList({ events }: EventListProps) {
  const { t } = useTranslation()
  // Rows newer than the moment the list appeared are "live" arrivals and slide in once
  // (the animation runs when the keyed <li> mounts).
  const [mountedAt] = useState(() => Date.now())
  const rows = events.map((event) => ({
    event,
    isNew: Date.parse(event.occurredAt) > mountedAt,
  }))

  return (
    <ol className="event-list" aria-label={t('events.latestList')}>
      {rows.map(({ event, isNew }) => (
        <li key={event.id} className={`event-list__item${isNew ? ' is-new' : ''}`}>
          <time className="event-list__time tabular" dateTime={event.occurredAt}>
            {formatTimeWithSeconds(event.occurredAt)}
          </time>
          <span
            className={`event-list__marker event-list__marker--${event.direction === 'ENTRY' ? 'in' : 'out'}`}
            aria-hidden="true"
          />
          <span className="event-list__who">
            <span
              className={event.studentName ? 'event-list__name' : 'event-list__name is-unknown'}
            >
              {event.studentName ?? t('events.unidentified')}
            </span>
            <span className="event-list__meta tabular">
              {t('events.confidence', { value: Math.round(event.confidence * 100) })}
            </span>
          </span>
          <span className="event-list__badges">
            <DirectionBadge direction={event.direction} />
            <MethodBadge method={event.method} />
          </span>
        </li>
      ))}
    </ol>
  )
}
