/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can keep your Aurion colors here if you want to use them as shortcuts
        'aurion-green': '#00FF41',
        'aurion-dark': '#0D0208',
      }
    },
  },
  plugins: [],
}