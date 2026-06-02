export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          600: "#0d9488",
          500: "#14b8a6",
          400: "#2dd4bf",
        },
      },
    },
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Liberation Sans', 'sans-serif'],
    },
  },
  plugins: [],
}
