import typography from '@tailwindcss/typography'

// Colours resolve to the CSS variables in src/styles/tokens.css, so light and
// dark differ only there. Triplets keep Tailwind's opacity modifier working.
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx,js,jsx}"
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: token('accent'),
          strong: token('accent-strong'),
          fg: token('accent-fg'),
        },
        'on-accent': token('on-accent'),
        canvas: token('canvas'),
        surface: token('surface'),
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
        },
        icon: token('icon'),
        line: token('line'),
        tooltip: {
          DEFAULT: token('tooltip'),
          fg: token('on-tooltip'),
        },
        success: { DEFAULT: token('success'), dot: token('success-dot') },
        warning: { DEFAULT: token('warning'), dot: token('warning-dot') },
        danger: { DEFAULT: token('danger'), dot: token('danger-dot') },
        neutral: { DEFAULT: token('neutral'), dot: token('neutral-dot') },

        // Legacy palette — removed once no component references it.
        primary: "#317153",        // Hauptgrün
        primaryDark: "#336A4A",
        primaryLight: "#4e7d67",
        lightGreen: "#b9d4c0ff",
        ultraLightGreen: "#dbe5de" ,

        accentYellow: "#E48C2A",   // Gelb aus Logo
        lightYellow: "#fbe6cf",

        accentRed: "#e73501",      // Rot aus Logo
        lightRed: "#f8d6ccff",

        bgSoft: "#F4F7F5",
      },
      borderColor: {
        DEFAULT: 'var(--line-subtle)',
        subtle: 'var(--line-subtle)',
        strong: 'var(--line-strong)',
      },
      divideColor: {
        DEFAULT: 'var(--line-subtle)',
      },
      borderRadius: {
        tag: '4px',
        control: '6px',
        panel: '8px',
      },
      boxShadow: {
        panel: 'var(--surface-panel-shadow)',
        banner: 'var(--surface-banner-shadow)',
        overlay: 'var(--surface-overlay-shadow)',
        control: 'var(--control-shadow)',
      },
      // Point the typography plugin's colour variables at the tokens so
      // rendered Markdown follows the theme.
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--color-fg-muted))',
            '--tw-prose-headings': 'rgb(var(--color-fg))',
            '--tw-prose-lead': 'rgb(var(--color-fg-muted))',
            '--tw-prose-links': 'rgb(var(--color-accent-fg))',
            '--tw-prose-bold': 'rgb(var(--color-fg))',
            '--tw-prose-counters': 'rgb(var(--color-icon))',
            '--tw-prose-bullets': 'rgb(var(--color-icon))',
            '--tw-prose-hr': 'var(--line-subtle)',
            '--tw-prose-quotes': 'rgb(var(--color-fg))',
            '--tw-prose-quote-borders': 'var(--line-strong)',
            '--tw-prose-captions': 'rgb(var(--color-fg-muted))',
            '--tw-prose-kbd': 'rgb(var(--color-fg))',
            '--tw-prose-kbd-shadows': 'var(--color-line)',
            '--tw-prose-code': 'rgb(var(--color-fg))',
            '--tw-prose-pre-code': 'rgb(var(--color-on-tooltip))',
            '--tw-prose-pre-bg': 'rgb(var(--color-tooltip))',
            '--tw-prose-th-borders': 'var(--line-strong)',
            '--tw-prose-td-borders': 'var(--line-subtle)',
          },
        },
      },
      fontFamily: {
        sans: ["'Segoe UI'", 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Consolas', "'Cascadia Mono'", 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [typography],
}
