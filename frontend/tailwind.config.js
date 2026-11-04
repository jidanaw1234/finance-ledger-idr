/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        fintech: {
          dark: '#090a0f',
          surface: '#12141c',
          border: '#1f2433',
          muted: '#8e96a8',
          accent: '#10b981',
          danger: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}

