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
        // Semantic Token Palette System
        brand: {
          50: '#EEF0FD',    // Brand Light Tint (Light)
          100: '#E0E3FA',
          200: '#C7CCF7',
          300: '#A5ADF2',
          400: '#818AEB',
          500: '#6366F1',   // Brand Primary (Dark)
          600: '#3B3FD9',   // Brand Primary (Light)
          700: '#2E32B6',   // Brand Hover (Light)
          800: '#252994',
          900: '#1D2173',
          950: '#13154C',
          primary: 'var(--brand-primary)',
          hover: 'var(--brand-hover)',
          tint: 'var(--brand-light-tint)',
        },
        surface: {
          DEFAULT: '#FFFFFF',        // Surface (Card) Light
          subtle: '#F7F8FA',         // App Background Light
          muted: '#F2F4F7',          // Surface Muted Light
          border: '#E4E7EC',         // Border / Divider Light
          dark: '#111827',           // Surface (Card) Dark
          'dark-subtle': '#0B0F19',  // App Background Dark
          'dark-muted': '#1F2937',   // Surface Muted Dark
          'dark-border': '#374151',  // Border / Divider Dark
        },
        charcoal: {
          DEFAULT: '#1D2939',        // Text Primary Light
          muted: '#475467',          // Text Secondary Light
          subtle: '#667085',         // Text Muted Light
          light: '#98A2B3',
        },
        // Aligned Slate scale for full dark-mode harmony
        slate: {
          50: '#F9FAFB',
          100: '#F9FAFB',            // Text Primary (Dark)
          200: '#F3F4F6',
          300: '#D1D5DB',
          400: '#9CA3AF',            // Text Secondary (Dark)
          500: '#6B7280',            // Text Muted (Dark)
          600: '#4B5563',
          700: '#374151',            // Border / Divider (Dark)
          800: '#1F2937',            // Surface Muted (Dark)
          900: '#111827',            // Surface (Card) Dark
          950: '#0B0F19',            // App Background (Dark)
        },
        stitch: {
          blue: '#3B3FD9',
          hover: '#2E32B6',
          subtle: '#EEF0FD',
        },
        forest: {
          DEFAULT: '#1B5E20',
          subtle: '#E8F5E9',
          border: '#C8E6C9',
        },
        semantic: {
          'brand-primary': 'var(--brand-primary)',
          'brand-hover': 'var(--brand-hover)',
          'brand-tint': 'var(--brand-light-tint)',
          'app-bg': 'var(--app-bg)',
          'surface-card': 'var(--surface-card)',
          'surface-muted': 'var(--surface-muted)',
          'border-divider': 'var(--border-divider)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
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
          info: '#3B3FD9',
          'info-bg': '#EEF0FD',
          'info-border': '#C7CCF7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
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
