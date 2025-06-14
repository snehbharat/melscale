/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite alternate',
        'visualizer': 'visualizer 1s ease-in-out infinite alternate',
        'equalizer': 'equalizer 0.8s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg)' },
        },
        wave: {
          '0%': { height: '30px' },
          '100%': { height: '120px' },
        },
        visualizer: {
          '0%': { height: '20px' },
          '100%': { height: '100px' },
        },
        equalizer: {
          '0%': { height: '30%' },
          '100%': { height: '90%' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};