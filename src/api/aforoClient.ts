import type { AforoEvent, AforoStatus, PersonStatus } from '../types/event'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, path: string) {
    super(`Request to ${path} failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
  }
}

function baseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL
  if (!url) {
    throw new Error('VITE_API_BASE_URL is not set')
  }
  return url.replace(/\/+$/, '')
}

async function get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) query.set(key, value)
  }
  const qs = query.size > 0 ? `?${query.toString()}` : ''

  const response = await fetch(`${baseUrl()}${path}${qs}`)
  if (!response.ok) {
    throw new ApiError(response.status, path)
  }
  return (await response.json()) as T
}

export function getAforo(): Promise<AforoStatus> {
  return get<AforoStatus>('/aforo')
}

/** `from` and `to` are optional ISO 8601 timestamps. */
export function getEvents(from?: string, to?: string): Promise<AforoEvent[]> {
  return get<AforoEvent[]>('/events', { from, to })
}

export function getPeople(): Promise<PersonStatus[]> {
  return get<PersonStatus[]>('/people')
}
