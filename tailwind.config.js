/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#757de8',
          DEFAULT: '#3F51B5', // Deep Indigo
          dark: '#002984',
        },
        secondary: {
          light: '#ff8a50',
          DEFAULT: '#FF5722', // Racing Orange
          dark: '#c41c00',
        },
        background: {
          DEFAULT: '#F5F5F7', // Apple-like minimalist light gray
          paper: '#FFFFFF',
          dark: '#121212', // Material Dark
          'dark-paper': '#1E1E1E',
        },
        surface: '#FFFFFF',
        'surface-dark': '#1E1E1E',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(0,0,0,0.05)',
        'elevation-2': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'elevation-3': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'glass': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'md3': '16px',
        'md3-lg': '24px',
        'pill': '50px',
      }
    },
  },
  plugins: [],
}
