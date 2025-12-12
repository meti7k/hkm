/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        felt: {
          800: '#064e3b', // Classic green table dark
          900: '#022c22',
        }
      },
      animation: {
        'deal': 'deal 0.5s ease-out forwards',
      },
      keyframes: {
        deal: {
          '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: 0 },
          '100%': { transform: 'translate(var(--tx), var(--ty)) scale(1)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
