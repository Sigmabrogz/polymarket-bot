import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#0f1115',
        accent: '#00ffc2'
      }
    }
  },
  plugins: []
};

export default config;
