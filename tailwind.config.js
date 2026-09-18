/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cor primária: verde acadêmico (institucional, transmite confiança e estudo)
        primaria: {
          50: '#f0f9f4',
          100: '#dcf2e6',
          200: '#bbe5cf',
          300: '#8ad3ab',
          400: '#54b97f',
          500: '#2f9d5e',
          600: '#1f7e48',
          700: '#1a643b',
          800: '#175031',
          900: '#134229',
          950: '#0a2615',
        },
        // Cor secundária: dourado/âmbar (valor, aconchego)
        secundaria: {
          50: '#fffaeb',
          100: '#fff0c6',
          200: '#ffdf88',
          300: '#ffc849',
          400: '#ffb320',
          500: '#f99008',
          600: '#dd6c02',
          700: '#b74a06',
          800: '#94370c',
          900: '#7a2d0e',
          950: '#461702',
        },
        // Cor de destaque: azul (links, ações secundárias)
        destaque: {
          50: '#eff6ff',
          100: '#dbe8fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#6094fa',
          500: '#3b72f6',
          600: '#2554eb',
          700: '#1d40d8',
          800: '#1e37af',
          900: '#1e338a',
          950: '#172153',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'progress': 'progress 5s linear forwards',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};
