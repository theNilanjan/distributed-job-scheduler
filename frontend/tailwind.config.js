/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#e5eefb',
        steel: '#94a3b8',
        surface: '#0d1727',
        line: '#1e293b',
        accent: '#2dd4bf',
        danger: '#f87171',
        warning: '#fb923c',
        panel: '#111c2d'
      },
      boxShadow: {
        soft: '0 18px 48px rgba(2, 8, 23, 0.35)',
        card: '0 10px 30px rgba(2, 8, 23, 0.24)'
      },
      backgroundImage: {
        'hero-grid': 'linear-gradient(120deg, rgba(15,118,110,0.12), rgba(37,99,235,0.06))'
      }
    }
  },
  plugins: []
};
