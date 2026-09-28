import { computed, ref } from 'vue'

export type Theme = 'light' | 'dark'

// Same key as the pre-paint script in index.html.
export const THEME_STORAGE_KEY = 'theme'

// index.html has already applied the saved theme; reading the attribute back
// keeps the script and this module from ever disagreeing.
const theme = ref<Theme>(
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
)

function applyTheme(next: Theme) {
  theme.value = next
  if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    // Storage unavailable (private mode, blocked): the choice lasts for this page.
  }
}

// Crossfades the whole page, gradients included (CSS transitions cannot
// animate gradients). Without the API or with reduced motion: instant switch.
function switchTheme(next: Theme) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion) {
    applyTheme(next)
    return
  }
  document.startViewTransition(() => applyTheme(next))
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')
  const toggleTheme = () => switchTheme(isDark.value ? 'light' : 'dark')
  return { theme, isDark, toggleTheme }
}
