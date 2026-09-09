/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        xbox: {
          green: '#107c10',
          neon: '#00ff66',
          dark: '#0e5a0e',
          light: '#22c55e'
        },
        vortex: {
          dark: '#080c15',
          darker: '#04060a',
          card: '#0f172a',
          cardHover: '#162238',
          border: '#1e293b',
          purple: '#8b5cf6',
          purpleGlow: '#a855f7',
          cyan: '#06b6d4',
          gold: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif']
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(0, 255, 102, 0.4)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.4)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)'
      }
    },
  },
  plugins: [],
}
