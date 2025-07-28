import daisyui from "daisyui"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      "cupcake",
      "retro",
      "synthwave",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "pastel",
      "fantasy",
      "black",
      "luxury",
      "dracula",
      "lemonade",
      "night",
      "coffee",
      "nord",
      "sunset",
    ],
  }
}
