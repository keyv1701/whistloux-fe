/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'whist-primary': '#2C3E50',
        'whist-secondary': '#3498DB',
        'whist-accent': '#E74C3C',
        'whist-light': '#ECF0F1',
        'whist-dark': '#1A252F'
      }
    },
  },
  plugins: [],
}
