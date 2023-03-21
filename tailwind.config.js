/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.html'],
  theme: {
    container: {
      center: true,
      padding: '25px',
    },
    extend: {
      colors: {
        utama: '#14b8a6',
        dark: '#134e4a'
      },
      screens: {
        '2xl': '1280px',
      }
    },
  },
  plugins: [],
}
