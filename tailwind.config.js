/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 80px rgba(28, 35, 49, 0.14)',
        card: '0 18px 48px rgba(41, 47, 61, 0.12)',
      },
    },
  },
  plugins: [],
};
