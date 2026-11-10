/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#15803D',
          dark: '#14532D',
          light: '#DCFCE7',
          hover: '#166534',
        },
        slate: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          main: '#0F172A',
          secondary: '#64748B',
          border: '#E2E8F0',
        },
        warning: '#D97706',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
