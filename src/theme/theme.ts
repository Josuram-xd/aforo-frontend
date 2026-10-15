import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'aforo.theme'
const listeners = new Set<() => void>()

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

let currentTheme: Theme = readStoredTheme()

/** Applies the remembered theme to <html>; call once before the first render. */
export function initTheme(): void {
  document.documentElement.dataset.theme = currentTheme
}

export function setTheme(theme: Theme): void {
  currentTheme = theme
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage may be unavailable (private mode); the choice then lasts for this tab only.
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, () => currentTheme)
  return {
    theme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }
}
