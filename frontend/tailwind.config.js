// tailwind.config.js
export default {
   darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-slab': ['"Roboto Slab"', 'serif'],
        'winky-rough': ['"Winky Rough"', 'cursive'],
      },
    },
  },
  plugins: [],
};
