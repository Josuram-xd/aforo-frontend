import { useTranslation } from 'react-i18next'
import { useEvents } from '../hooks/useEvents'
import type { AforoEvent } from '../types/event'
import './EventTimeline.css'

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function byNewestFirst(a: AforoEvent, b: AforoEvent): number {
  return Date.parse(b.timestamp) - Date.parse(a.timestamp)
}

export function EventTimeline() {
  const { t } = useTranslation()
  const { data } = useEvents()

  return (
    <div className="event-timeline">
      <h2 className="event-timeline__title">{t('events.title')}</h2>
      <ul className="event-timeline__items">
        {data?.toSorted(byNewestFirst).map((event) => {
          const isEntry = event.direction === 'ENTRY'
          const isFace = event.method === 'FACE'
          return (
            <li key={event.eventId} className="event-timeline__row">
              <time className="event-timeline__time" dateTime={event.timestamp}>
                {formatTime(event.timestamp)}
              </time>
              <span
                className={`event-timeline__badge event-timeline__badge--${isEntry ? 'entry' : 'exit'}`}
              >
                {t(isEntry ? 'events.direction.entry' : 'events.direction.exit')}
              </span>
              <span className="event-timeline__name">
                {event.personName ?? t('events.unidentified')}
              </span>
              <span
                className={`event-timeline__method event-timeline__method--${isFace ? 'face' : 'body'}`}
              >
                {t(isFace ? 'events.method.face' : 'events.method.body')}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
