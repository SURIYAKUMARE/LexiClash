/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FA',
          100: '#E1EFF4',
          200: '#C3DFE9',
          300: '#9AC8D8',
          400: '#5F9EB7',
          500: '#2B7C9B',
          600: '#0F5C7A', // Primary deep teal-blue
          700: '#0C4B63',
          800: '#0A3C4F',
          900: '#08303F',
          950: '#051F2A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8F9FA',
          muted: '#F1F3F5',
          border: '#E5E7EB',
          dark: '#111827',
          'dark-subtle': '#0B0F17',
          'dark-muted': '#1F2937',
          'dark-border': '#334155',
        },
        charcoal: {
          DEFAULT: '#111827',
          muted: '#4B5563',
          subtle: '#6B7280',
          light: '#9CA3AF',
        },
        status: {
          success: '#16A34A',
          'success-bg': '#F0FDF4',
          'success-border': '#BBF7D0',
          warning: '#D97706',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          danger: '#DC2626',
          'danger-bg': '#FEF2F2',
          'danger-border': '#FECACA',
          info: '#0F5C7A',
          'info-bg': '#F0F7FA',
          'info-border': '#C3DFE9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        md: '6px',
        sm: '4px',
        xl: '8px',
        '2xl': '8px',
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'float': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
