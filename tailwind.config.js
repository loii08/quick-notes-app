/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Keep the HTML entry so Tailwind can purge classes used in the HTML
    "./index.html",
    // Only scan `src/` now that source files have been migrated
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        primaryDark: 'var(--color-primary-dark)',
        textOnPrimary: 'var(--color-text-on-primary)',
        bgPage: 'var(--color-bg-page)',
        surface: 'var(--color-surface)',
        borderLight: 'var(--color-border)',
        textMain: 'var(--color-text)',
        
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E5E5',
          700: '#3A3A3A',
          800: '#282828',
          900: '#111827',
        },
        indigo: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-dark)',
          700: '#4338ca',
          900: '#312e81',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'pulse-slow': 'pulse-slow 2.5s infinite',
        'desktop-view-demo': 'desktop-view-demo 8s infinite ease-in-out',
        'mobile-view-demo': 'mobile-view-demo 8s infinite ease-in-out',
        'typing-demo': 'typing-demo 8s infinite ease-in-out',
        'note-appear-demo': 'note-appear-demo 8s infinite ease-in-out',
        'toast-demo': 'toast-demo 8s infinite ease-in-out',
        'fab-press-demo': 'fab-press-demo 8s infinite ease-in-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-slow': {
          '50%': { transform: 'scale(1.05)' },
        },
        'desktop-view-demo': {
          '0%, 50%': { opacity: '1', transform: 'scale(1)' },
          '60%, 100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        'mobile-view-demo': {
          '0%, 50%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
          '60%, 90%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0' },
        },
        'typing-demo': {
          '0%, 100%': { width: '0%', opacity: '0' },
          '15%': { width: '75%', opacity: '1' },
          '35%': { width: '75%', opacity: '1' },
          '45%, 99%': { opacity: '0' },
        },
        'note-appear-demo': {
          '0%, 35%': { opacity: '0', transform: 'translateY(10px)' },
          '45%, 90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0' },
        },
        'toast-demo': {
          '0%, 45%': { opacity: '0', transform: 'translateY(20px)' },
          '55%, 90%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0' },
        },
        'fab-press-demo': {
          '0%, 65%, 75%, 100%': { transform: 'scale(1)' },
          '70%': { transform: 'scale(0.9)' },
        }
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
