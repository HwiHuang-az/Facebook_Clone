/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Facebook Brand Colors
        facebook: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1877f2',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Gray colors giống Facebook
        gray: {
          50: '#f8f9fa',
          100: '#f5f6f7',
          200: '#e4e6ea',
          300: '#ccd0d5',
          400: '#aeadad',
          500: '#65676b',
          600: '#4e4f50',
          700: '#42434a',
          800: '#242526',
          900: '#18191a',
        },
        // Success, Warning, Danger
        success: '#42b883',
        warning: '#f39c12',
        danger: '#e74c3c',
        info: '#3498db',
      },
      fontFamily: {
        'facebook': ['Helvetica', 'Arial', 'sans-serif'],
        'segoe': ['Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      spacing: {
        '15': '3.75rem',
        '18': '4.5rem',
        '88': '22rem',
        '104': '26rem',
        '120': '30rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'facebook': '0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)',
        'facebook-hover': '0 4px 8px rgba(0, 0, 0, .12), 0 12px 24px rgba(0, 0, 0, .15)',
        'facebook-button': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'modal': '0 4px 30px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'facebook': '8px',
        'facebook-sm': '6px',
        'facebook-lg': '12px',
      },
      backdropBlur: {
        'facebook': '40px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/line-clamp'),
  ],
  darkMode: 'class', // Enable dark mode
} 