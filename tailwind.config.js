/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SDV brand
        brand: {
          DEFAULT: '#003B8E',
          soft: '#E6EBF4',
          muted: '#C0CDE3',
          strong: '#002966',
        },
        accent: {
          DEFAULT: '#D50000',
          soft: '#FCE6E6',
          muted: '#F09595',
        },
        // Semantic
        success: { DEFAULT: '#16A34A', soft: '#DCFCE7', ink: '#166534' },
        warning: { DEFAULT: '#F59E0B', soft: '#FEF3C7', ink: '#92400E' },
        danger: { DEFAULT: '#DC2626', soft: '#FCE6E6', ink: '#991B1B' },
        info: { DEFAULT: '#0EA5E9', soft: '#DBEAFE', ink: '#1E40AF' },
        // Surfaces
        page: { light: '#F5F7FA', dark: '#0F172A' },
        surface: { light: '#FFFFFF', dark: '#1E293B' },
        // Ink (text)
        ink: {
          primary: { light: '#0F172A', dark: '#F1F5F9' },
          secondary: { light: '#475569', dark: '#CBD5E1' },
          tertiary: { light: '#64748B', dark: '#94A3B8' },
          disabled: { light: '#94A3B8', dark: '#64748B' },
        },
        // Borders
        line: { subtle: '#E5E9F0', default: '#CBD5E1', strong: '#94A3B8' },
      },
      fontSize: {
        // Outdoor-readable scale
        display: ['28px', { lineHeight: '34px', fontWeight: '500' }],
        h1: ['22px', { lineHeight: '28px', fontWeight: '500' }],
        h2: ['18px', { lineHeight: '24px', fontWeight: '500' }],
        h3: ['16px', { lineHeight: '22px', fontWeight: '500' }],
        body: ['15px', { lineHeight: '22px' }],
        helper: ['12px', { lineHeight: '16px' }],
        caption: ['11px', { lineHeight: '14px' }],
        label: ['11px', { lineHeight: '14px', letterSpacing: '0.4px' }],
      },
      borderRadius: { 'xl-2': '20px' },
      spacing: {
        touch: '52px',
        'touch-md': '44px',
        'touch-sm': '36px',
      },
    },
  },
  plugins: [],
}

