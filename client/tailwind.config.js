/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "#0d33f2",
          "background-light": "#f5f6f8",
          "background-dark": "#101322",
        },
        fontFamily: {
          "display": ["Inter", "sans-serif"],
          "sans": ["Inter", "sans-serif"]
        },
      },
    },
    plugins: [],
  }