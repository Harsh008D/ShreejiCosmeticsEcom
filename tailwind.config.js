/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './views/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './controllers/**/*.{js,ts,jsx,tsx}',
    './models/**/*.{js,ts,jsx,tsx}',
    './App.tsx'
  ],
  theme: {
    extend: {},
    screens: {
      'sm': '640px',
      'md': '825px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
};
