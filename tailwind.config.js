/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f0f13',
        card: '#1a1a24',
        primary: '#7c6af7',
        'primary-hover': '#6a57e8',
        success: '#4ade80',
        warning: '#facc15',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
}
