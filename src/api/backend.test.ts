import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/env', () => ({ env: { backendUrl: 'https://api.test' }, isMockMode: false }))
vi.mock('../lib/supabase', () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } },
}))

import { backendJson, backendText } from './backend'
import { AppError } from './errors'

afterEach(() => vi.unstubAllGlobals())

describe('backend helper', () => {
  it('sends the bearer token and query params', async () => {
    const fetchMock = vi.fn(async () => new Response('a,b'))
    vi.stubGlobal('fetch', fetchMock)
    expect(await backendText('/export-events', { query: { from: 'x', skip: undefined } })).toBe(
      'a,b',
    )
    const [url, init] = fetchMock.mock.calls[0] as unknown as [URL, RequestInit]
    expect(url.toString()).toBe('https://api.test/export-events?from=x')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
  })

  it('posts JSON bodies', async () => {
    const fetchMock = vi.fn(async () => new Response('{"ok":true}'))
    vi.stubGlobal('fetch', fetchMock)
    await backendJson('/invite-user', { method: 'POST', body: { email: 'a@b.c' } })
    const init = (fetchMock.mock.calls[0] as unknown as [URL, RequestInit])[1]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"email":"a@b.c"}')
  })

  it('maps error statuses to AppError keys', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":"x"}', { status: 403 })),
    )
    await expect(backendJson('/x')).rejects.toMatchObject({ messageKey: 'errors.forbidden' })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 503 })),
    )
    await expect(backendJson('/x')).rejects.toBeInstanceOf(AppError)
  })

  it('maps network failures to functionUnavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('net'))),
    )
    await expect(backendJson('/x')).rejects.toMatchObject({
      messageKey: 'errors.functionUnavailable',
    })
  })
})
