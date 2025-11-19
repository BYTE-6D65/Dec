/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic mappings
        background: 'var(--bg-0)',
        surface: 'var(--bg-1)',
        'surface-highlight': 'var(--bg-2)',

        'text-main': 'var(--text-hi)',
        'text-muted': 'var(--text-md)',
        'text-faint': 'var(--text-lo)',
        'text-invert': 'var(--text-invert)',

        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-accent': 'var(--border-accent)',

        accent: 'var(--accent)',
        'accent-muted': 'var(--accent-muted)',
        'accent-bg': 'var(--accent-bg)',

        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
      },
      boxShadow: {
        'glow': 'var(--accent-glow)',
        'sm': 'var(--shadow-0)',
        'md': 'var(--shadow-1)',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
