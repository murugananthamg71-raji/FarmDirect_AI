/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          light: '#4CAF50',
        },
        fresh: '#4CAF50',
        lightbg: '#E8F5E9',
        background: '#F5F7F2',
        darktext: '#263238',
      },
    },
  },
  plugins: [],
}

