/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Blue
        secondary: '#f3f4f6', // Light gray
        accent: '#10b981', // Green for status
        warning: '#f59e0b', // Yellow
        danger: '#ef4444', // Red
      }
    },
  },
  plugins: [],
}
