/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#f8fafc',
        steel: '#94a3b8',
        surface: '#0f172a',
        line: '#1e293b',
        accent: '#2dd4bf',
        danger: '#ef4444',
        warning: '#f59e0b',
        panel: '#020617',
        success: '#10b981',
        primary: '#6366f1',
        secondary: '#ec4899'
      },
      boxShadow: {
        soft: '0 18px 48px rgba(2, 6, 23, 0.4)',
        card: '0 10px 30px rgba(2, 6, 23, 0.3)',
        glow: '0 0 20px rgba(45, 212, 191, 0.3)'
      },
      backgroundImage: {
        'hero-grid': 'linear-gradient(135deg, rgba(45,212,191,0.15), rgba(99,102,241,0.1), rgba(236,72,153,0.08))',
        'gradient-primary': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-secondary': 'linear-gradient(135deg, #ec4899, #f43f5e)'
      }
    }
  },
  plugins: []
};
