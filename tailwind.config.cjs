/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pokemon: ["var(--font-pokemon)", "sans-serif"],
        sfpro: ["var(--font-sfpro)"],
      },
    },
  },
  plugins: [],
}
