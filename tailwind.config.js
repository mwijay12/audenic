/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Original brand DNA from the 2021 template — kept authentic to Mwijay's source
        cream: {
          50: '#fefdfb',
          100: '#faf7f0',
          200: '#f3ecdc',
          300: '#e8dcc0',
        },
        ink: {
          900: '#0e0d0c',
          800: '#1a1816',
          700: '#2a2723',
          600: '#3d3933',
          500: '#5a544a',
          400: '#807868',
          300: '#a89e8c',
          200: '#cfc6b6',
          100: '#ebe4d4',
        },
        // Accent — the orange-red from the original headphones hero CTA
        flame: {
          50: '#fff5f0',
          100: '#ffe2d3',
          200: '#ffc1a5',
          300: '#ff9a70',
          400: '#ff7240',
          500: '#ff4d1a',
          600: '#e63a08',
          700: '#bd2d04',
          800: '#92240a',
          900: '#771f0c',
        },
        // Premium gold used in the original product badges
        gold: {
          50: '#fdf8e7',
          100: '#f9eec3',
          200: '#f3dd8b',
          300: '#ecc754',
          400: '#e6b325',
          500: '#c89519',
          600: '#a57414',
          700: '#825513',
          800: '#5f3e14',
          900: '#3e2a10',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.06em',
        ultra: '-0.04em',
      },
      fontSize: {
        'mega': ['clamp(4rem, 14vw, 12rem)', { lineHeight: '0.9', letterSpacing: '-0.05em' }],
        'hero': ['clamp(3rem, 10vw, 8rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
        'display': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-rev': 'marquee-rev 30s linear infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'blink': 'blink 1.4s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-rev': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        'noise': "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")",
      },
    },
  },
  plugins: [],
}
