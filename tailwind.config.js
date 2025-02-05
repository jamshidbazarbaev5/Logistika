/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        checkmark: 'checkmark 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.15)', opacity: '0.2' },
          '100%': { transform: 'scale(1)', opacity: '0.5' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
    
  },
  plugins: [],
}
