/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'martian': ['"Martian Mono"', 'monospace'],
      },
      backgroundImage: {
        'marker': 'linear-gradient(120deg, #ffd700 0%, #ffd700 100%)',
      },
    },
  },
  plugins: [],
}

