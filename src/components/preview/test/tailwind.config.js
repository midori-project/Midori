/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6347',
        secondary: '#4CAF50',
        accent: '#FFC107',
        background: '#F9F9F9',
        text: {
          light: '#FFFFFF',
          dark: '#333333',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
