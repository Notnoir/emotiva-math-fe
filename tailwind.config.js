/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary|secondary|background-light)/,
      variants: ['hover', 'focus', 'active'],
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        "primary-hover": "#5a4ad1",
        secondary: "#A29BFE",
        "background-light": "#F8F9FE",
        "success-bg": "#E6FFF2",
        "success-text": "#00B894",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0, 0, 0, 0.05)",
        card: "0 2px 10px rgba(108, 92, 231, 0.05)",
      },
    },
  },
  plugins: [],
}

