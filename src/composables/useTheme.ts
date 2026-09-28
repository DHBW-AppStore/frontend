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

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')
  const toggleTheme = () => applyTheme(isDark.value ? 'light' : 'dark')
  return { theme, isDark, toggleTheme }
}
