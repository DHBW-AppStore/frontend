import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The module holds the theme as a singleton read at import time, so every
// test imports a fresh copy after setting up the document.
async function loadUseTheme() {
  vi.resetModules()
  const mod = await import('@/composables/useTheme')
  return mod.useTheme()
}

describe('useTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to light when nothing is set', async () => {
    const { theme, isDark } = await loadUseTheme()
    expect(theme.value).toBe('light')
    expect(isDark.value).toBe(false)
  })

  it('picks up the theme the pre-paint script applied', async () => {
    document.documentElement.setAttribute('data-theme', 'dark')
    const { isDark } = await loadUseTheme()
    expect(isDark.value).toBe(true)
  })

  it('toggles the document attribute and persists the choice', async () => {
    const { isDark, toggleTheme } = await loadUseTheme()

    toggleTheme()
    expect(isDark.value).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    toggleTheme()
    expect(isDark.value).toBe(false)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('crossfades via a view transition when the browser supports it', async () => {
    const startViewTransition = vi.fn((update: () => void) => update())
    Object.defineProperty(document, 'startViewTransition', { value: startViewTransition, configurable: true })
    try {
      const { isDark, toggleTheme } = await loadUseTheme()
      toggleTheme()
      expect(startViewTransition).toHaveBeenCalledOnce()
      expect(isDark.value).toBe(true)
    } finally {
      delete (document as { startViewTransition?: unknown }).startViewTransition
    }
  })

  it('switches instantly when the user prefers reduced motion', async () => {
    const startViewTransition = vi.fn()
    Object.defineProperty(document, 'startViewTransition', { value: startViewTransition, configurable: true })
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList)
    try {
      const { isDark, toggleTheme } = await loadUseTheme()
      toggleTheme()
      expect(startViewTransition).not.toHaveBeenCalled()
      expect(isDark.value).toBe(true)
    } finally {
      delete (document as { startViewTransition?: unknown }).startViewTransition
    }
  })

  it('still switches when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { isDark, toggleTheme } = await loadUseTheme()

    expect(() => toggleTheme()).not.toThrow()
    expect(isDark.value).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
