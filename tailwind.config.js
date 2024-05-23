module.exports = {
  purge: ['./**/*.html'],
  mode: "jit",
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
      },
      colors: {
        "green-fg": "#78e2a0",
        "green-bg": "#1f222a",
        "purple-fg": "#1f222a",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}