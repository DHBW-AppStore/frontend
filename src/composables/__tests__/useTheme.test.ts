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
