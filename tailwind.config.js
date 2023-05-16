/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      'xsm': { 'min': '0px', 'max': '576px' },
      'sm': { 'min': '577px', 'max': '767px' },
      'md': { 'min': '768px', 'max': '1023px' },
      'lg': { 'min': '1024px', 'max': '1279px' },
      'xl': { 'min': '1279px', 'max': '1535px' },
      '2xl': { 'min': '1536px', 'max': '2560px' },
    },
    fontFamily: {
      sans: ['Montserrat', 'sans-serif'],
      logo: ['Paytone One', 'sans-serif'],
      dmsans: ['DM Sans', 'sans-serif'],
    },
    colors: {
      primary: '#81B29A',
      secondary: colors.white,
      contrast: '#FAFAFA',
      text: '#1E1E21',
      washout: 'rgba(30, 30, 33, 0.5)',
    },
  },
  plugins: [],
};
