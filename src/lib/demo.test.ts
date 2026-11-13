import { beforeEach, describe, expect, it, vi } from 'vitest'

// demo.ts and env.ts read the flag when the module loads, so each test imports them afresh.
async function load() {
  vi.resetModules()
  const demo = await import('./demo')
  const env = await import('./env')
  return { demo, env }
}

beforeEach(() => {
  vi.stubEnv('VITE_USE_MOCK', 'false')
  window.history.replaceState(null, '', '/')
})

describe('demo flag', () => {
  it('is off without the flag: production behaviour, no mock, real client', async () => {
    const { demo, env } = await load()
    expect(demo.demoActive()).toBe(false)
    expect(demo.demoRole()).toBeNull()
    expect(env.isMockMode).toBe(false)
    const { supabase } = await import('./supabase')
    expect(typeof supabase.from).toBe('function')
  })

  it('turns mock mode on with the chosen role when the flag is stored', async () => {
    sessionStorage.setItem('aforo.demo', 'teacher')
    const { demo, env } = await load()
    expect(demo.demoActive()).toBe(true)
    expect(demo.demoRole()).toBe('teacher')
    expect(env.isMockMode).toBe(true)
    const { MOCK_ROLE } = await import('../api/mock/mockIdentity')
    expect(MOCK_ROLE).toBe('teacher')
  })

  it('ignores an invalid stored value', async () => {
    sessionStorage.setItem('aforo.demo', 'superadmin')
    const { demo, env } = await load()
    expect(demo.demoActive()).toBe(false)
    expect(env.isMockMode).toBe(false)
  })

  it('blocks every use of the supabase client while the demo is on', async () => {
    sessionStorage.setItem('aforo.demo', 'admin')
    await load()
    const { supabase } = await import('./supabase')
    expect(() => supabase.from('students')).toThrow(/disabled/)
    expect(() => supabase.auth).toThrow(/disabled/)
  })

  it('works without sessionStorage by reading the role from the URL', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    window.history.replaceState(null, '', '/?demo=viewer')
    const { demo } = await load()
    expect(demo.demoActive()).toBe(true)
    expect(demo.demoRole()).toBe('viewer')
  })

  it('does not honour ?demo= when storage works', async () => {
    window.history.replaceState(null, '', '/?demo=admin')
    const { demo } = await load()
    expect(demo.demoActive()).toBe(false)
  })
})

describe('parseDemoRole', () => {
  it('accepts the three roles and falls back to admin for anything else', async () => {
    const { demo } = await load()
    expect(demo.parseDemoRole('teacher')).toBe('teacher')
    expect(demo.parseDemoRole('viewer')).toBe('viewer')
    expect(demo.parseDemoRole('admin')).toBe('admin')
    expect(demo.parseDemoRole('root')).toBe('admin')
    expect(demo.parseDemoRole(null)).toBe('admin')
    expect(demo.parseDemoRole('<script>')).toBe('admin')
  })
})
