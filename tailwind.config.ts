import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        judge: {
          bg: '#070b12',
          panel: '#0b1220',
          panel2: '#0f172a',
          border: '#1e293b',
          accent: '#38bdf8',
          green: '#22c55e',
          red: '#ef4444',
          yellow: '#f59e0b',
          purple: '#a855f7',
        },
      },
      boxShadow: {
        glow: '0 0 60px rgba(56, 189, 248, 0.16)',
        panel: '0 18px 50px rgba(0, 0, 0, 0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
