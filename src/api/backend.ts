import { env } from '../lib/env'
import { supabase } from '../lib/supabase'
import { AppError, fromHttpStatus } from './errors'

// Client of the Python backend (aforo-backend). Every call carries the signed-in user's Supabase
// access token; the backend validates it and applies the role checks.

export interface BackendRequest {
  method?: 'GET' | 'POST'
  query?: Record<string, string | number | undefined>
  body?: unknown
}

async function backendFetch(path: string, request: BackendRequest): Promise<Response> {
  if (!env.backendUrl) throw new AppError('errors.functionUnavailable')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new AppError('errors.forbidden', 401)

  const url = new URL(`${env.backendUrl}${path}`)
  for (const [key, value] of Object.entries(request.query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (request.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(url, {
      method: request.method ?? 'GET',
      headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
    })
  } catch {
    throw new AppError('errors.functionUnavailable')
  }
  // The `{error}` text from the backend is not shown (see AppError): only the status is mapped.
  if (!response.ok) throw fromHttpStatus(response.status)
  return response
}

export async function backendJson<T>(path: string, request: BackendRequest = {}): Promise<T> {
  return (await backendFetch(path, request)).json() as Promise<T>
}

export async function backendText(path: string, request: BackendRequest = {}): Promise<string> {
  return (await backendFetch(path, request)).text()
}
