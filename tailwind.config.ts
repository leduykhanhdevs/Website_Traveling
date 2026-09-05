import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#070A11',
        surface: {
          DEFAULT: '#0D1322',
          light: '#131B30',
          elevated: '#1A243D',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(56, 189, 248, 0.3)',
        },
        primary: {
          DEFAULT: '#38BDF8', // Celestial Azure
          hover: '#0EA5E9',
          muted: 'rgba(56, 189, 248, 0.15)',
        },
        secondary: {
          DEFAULT: '#818CF8', // Royal Indigo
          hover: '#6366F1',
        },
        accent: {
          emerald: '#2DD4BF',
          amber: '#FBBF24',
          rose: '#FB7185',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        pill: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
