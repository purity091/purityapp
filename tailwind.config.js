/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '12px',
        'md': '8px',
        'lg': '12px',
        'xl': '12px',
        '2xl': '12px',
        '3xl': '12px',
      },
      colors: {
        // Apple-Inspired System Palette
        gray: {
          50: '#F5F5F7',  // Apple Background Light
          100: '#F2F2F7', // System Gray 6
          200: '#E5E5EA', // System Gray 5
          300: '#D1D1D6', // System Gray 4
          400: '#C7C7CC', // System Gray 3
          500: '#AEAEB2', // System Gray 2
          600: '#8E8E93', // System Gray
          700: '#48484A',
          800: '#3A3A3C',
          900: '#1C1C1E', // Apple text black
          950: '#000000',
        },
        // Primary: "Purity Cyan" - Modern, Fresh, Professional (#00C4C9)
        primary: {
          DEFAULT: '#00C4C9',
          50: '#E0F9F9',
          100: '#B3F0F0',
          200: '#80E5E5',
          300: '#4DDADA',
          400: '#1ACFCF',
          500: '#00C4C9', // Base
          600: '#00AEB2',
          700: '#009396',
          800: '#00787B',
          900: '#005E60',
          950: '#003F41',
        },
        // Mapping 'teal' to our new Primary to unify the existing code
        teal: {
          50: '#E0F9F9',
          100: '#B3F0F0',
          200: '#80E5E5',
          300: '#4DDADA',
          400: '#1ACFCF',
          500: '#00C4C9',
          600: '#00AEB2',
          700: '#009396',
          800: '#00787B',
          900: '#005E60',
          950: '#003F41',
        },
        // Accents
        accent: {
          DEFAULT: '#FF9500', // Apple Orange
          500: '#FF9500',
          600: '#E08300',
        },
        orange: {
          50: '#fffbf2',
          100: '#fff5dd',
          500: '#FF9500',
          600: '#E08300',
        },
        rose: {
          500: '#FF2D55', // Apple Pink
          600: '#D7002C',
        }
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
