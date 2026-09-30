import typography from '@tailwindcss/typography'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx,js,jsx}"
  ],
  // 'class' strategy: adding class="dark" to <html> enables dark mode
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand colors ───────────────────────────────────────────
        primary: {
          DEFAULT: 'var(--color-primary)',
          light:   'var(--color-primary-light)',
          dark:    'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light:   'var(--color-secondary-light)',
          dark:    'var(--color-secondary-dark)',
        },
        highlight: {
          DEFAULT: 'var(--color-highlight)',
          light:   'var(--color-highlight-light)',
          dark:    'var(--color-highlight-dark)',
        },

        // ── Surfaces ───────────────────────────────────────────────
        surface: {
          page:    'var(--color-surface-page)',
          card:    'var(--color-surface-card)',
          sidebar: 'var(--color-surface-sidebar)',
          input:   'var(--color-surface-input)',
          overlay: 'var(--color-surface-overlay)',
          hover:   'var(--color-surface-hover)',
        },

        // ── Text ───────────────────────────────────────────────────
        content: {
          primary:   'var(--color-content-primary)',
          secondary: 'var(--color-content-secondary)',
          disabled:  'var(--color-content-disabled)',
          inverse:   'var(--color-content-inverse)',
          link:      'var(--color-content-link)',
        },

        // ── Buttons ────────────────────────────────────────────────
        btn: {
          primary:         'var(--color-btn-primary)',
          primaryHover:    'var(--color-btn-primary-hover)',
          primaryText:     'var(--color-btn-primary-text)',
          secondary:       'var(--color-btn-secondary)',
          secondaryHover:  'var(--color-btn-secondary-hover)',
          secondaryText:   'var(--color-btn-secondary-text)',
          ghost:           'var(--color-btn-ghost)',
          ghostHover:      'var(--color-btn-ghost-hover)',
          ghostText:       'var(--color-btn-ghost-text)',
        },

        // ── Cards / Tiles ──────────────────────────────────────────
        card: {
          bg:      'var(--color-card-bg)',
          tinted:  'var(--color-card-bg-tinted)',
          border:  'var(--color-card-border)',
        },

        // ── Status / Feedback ──────────────────────────────────────
        status: {
          success:      'var(--color-status-success)',
          successLight: 'var(--color-status-success-light)',
          error:        'var(--color-status-error)',
          errorLight:   'var(--color-status-error-light)',
          warning:      'var(--color-status-warning)',
          warningLight: 'var(--color-status-warning-light)',
          info:         'var(--color-status-info)',
          infoLight:    'var(--color-status-info-light)',
        },

        // ── Resource progress bars ─────────────────────────────────
        resource: {
          low:    'var(--color-resource-low)',
          medium: 'var(--color-resource-medium)',
          high:   'var(--color-resource-high)',
        },

        // ── Borders ────────────────────────────────────────────────
        border: {
          DEFAULT: 'var(--color-border)',
          strong:  'var(--color-border-strong)',
          focus:   'var(--color-border-focus)',
        },
      },
    },
  },
  plugins: [typography],
}
