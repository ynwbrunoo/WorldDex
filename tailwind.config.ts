import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base surfaces
        surface: {
          950: '#060913',
          900: '#0b1120',
          800: '#111827',
          700: '#1a2436',
          600: '#243044',
        },
        // Primary accent — teal/cyan
        accent: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        // Gold — achievements / special moments
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Map colors
        map: {
          locked: '#2a3547',
          lockedBorder: '#3d4f66',
          unlocked: '#0e7490',
          unlockedHover: '#0891b2',
          unlockedSelected: '#06b6d4',
          rolled: '#f59e0b',
          border: '#475569',
          ocean: '#060d1a',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      animation: {
        'roll-pulse': 'rollPulse 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        rollPulse: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px 2px rgba(6, 182, 212, 0.3)' },
          '50%': { boxShadow: '0 0 20px 6px rgba(6, 182, 212, 0.5)' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
