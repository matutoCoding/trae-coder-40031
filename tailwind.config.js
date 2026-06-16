/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        furnace: {
          900: '#0d0d1a',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#1f2b47',
          500: '#2a3a5c',
          400: '#3d5a80',
          300: '#5a7da8',
        },
        lava: {
          600: '#c2410c',
          500: '#ea580c',
          400: '#f97316',
          300: '#fb923c',
          200: '#fdba74',
          100: '#ffedd5',
        },
        ember: {
          600: '#dc2626',
          500: '#e94560',
          400: '#f87171',
          300: '#fca5a5',
        },
        steel: {
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
