module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dd4545',
          600: '#9d3333',
          700: '#7f2929',
          800: '#661f1f',
          900: '#4a1515',
        },
        accent: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#444444',
          900: '#212121',
        },
      },
      fontFamily: {
        'heading': ['Cinzel', 'serif'],
        'body': ['Arimo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
