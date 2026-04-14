/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        night: {
          950: '#080b12',
          900: '#0d1220',
          800: '#131b2e',
          700: '#1c2942',
          600: '#243356',
        },
        signal: {
          green:  '#22c55e',
          amber:  '#f59e0b',
          red:    '#ef4444',
          blue:   '#3b82f6',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
