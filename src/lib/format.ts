// Date/number formatting for the UI. The pilot runs in Colombia, so every time is shown in
// America/Bogota regardless of the viewer's computer settings.

export const TIME_ZONE = 'America/Bogota'
const LOCALE = 'es-CO'

const timeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const timeWithSecondsFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})
const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const hourFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  hour12: false,
})
const isoDayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })
const integerFormat = new Intl.NumberFormat(LOCALE)

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

export const formatTime = (value: string | Date) => timeFormat.format(toDate(value))
export const formatTimeWithSeconds = (value: string | Date) =>
  timeWithSecondsFormat.format(toDate(value))
export const formatDate = (value: string | Date) => dateFormat.format(toDate(value))
export const formatDateTime = (value: string | Date) => dateTimeFormat.format(toDate(value))
export const formatLongDate = (value: string | Date) => longDateFormat.format(toDate(value))
export const formatInteger = (value: number) => integerFormat.format(value)

/** Hour of the day (0-23) in Bogotá. */
export function bogotaHour(value: string | Date): number {
  return Number(hourFormat.format(toDate(value))) % 24
}

/** Calendar day in Bogotá as YYYY-MM-DD (matches the `day` column of daily_occupancy_summary). */
export function bogotaDay(value: string | Date = new Date()): string {
  return isoDayFormat.format(toDate(value))
}

/** Bogotá has no daylight saving time: UTC-5 all year. */
const BOGOTA_OFFSET = '-05:00'

/** ISO instant for 00:00 in Bogotá of the given YYYY-MM-DD day. */
export function startOfBogotaDay(day: string = bogotaDay()): string {
  return new Date(`${day}T00:00:00${BOGOTA_OFFSET}`).toISOString()
}

/** ISO instant for 00:00 of the following Bogotá day (exclusive end of `day`). */
export function endOfBogotaDay(day: string = bogotaDay()): string {
  const start = new Date(`${day}T00:00:00${BOGOTA_OFFSET}`)
  return new Date(start.getTime() + 24 * 3600 * 1000).toISOString()
}

/** Converts a Bogotá wall-clock "YYYY-MM-DDTHH:mm" (datetime-local input) to an ISO instant. */
export function bogotaLocalToIso(local: string): string {
  return new Date(`${local}:00${BOGOTA_OFFSET}`).toISOString()
}

/** Inverse of bogotaLocalToIso, for filling datetime-local inputs. */
export function isoToBogotaLocal(iso: string): string {
  const date = new Date(new Date(iso).getTime() - 5 * 3600 * 1000)
  return date.toISOString().slice(0, 16)
}

/** "hace 3 min", "hace 2 h", "ayer"… */
export function formatRelative(value: string | Date, now: number = Date.now()): string {
  const seconds = Math.round((toDate(value).getTime() - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 45) return relativeFormat.format(seconds, 'second')
  if (abs < 45 * 60) return relativeFormat.format(Math.round(seconds / 60), 'minute')
  if (abs < 22 * 3600) return relativeFormat.format(Math.round(seconds / 3600), 'hour')
  return relativeFormat.format(Math.round(seconds / 86400), 'day')
}
