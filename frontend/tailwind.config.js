/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sus: {
          blue: '#005696',
          dark: '#003966',
          light: '#e6f0fa',
          green: '#00966b',
        },
      },
    },
  },
  plugins: [],
};
