/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'citadel-black': '#0a0a0a',
        'citadel-black-light': '#1a1a1a',
        'citadel-steel': '#2a2a2a',
        'citadel-steel-light': '#3a3a3a',
        'citadel-dark-gray': '#4a4a4a',
        'citadel-light-gray': '#9ca3af',
        'citadel-orange': '#ff8a4c',
        'citadel-orange-bright': '#ff9d5c',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
