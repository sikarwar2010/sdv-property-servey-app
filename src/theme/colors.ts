/**
 * SDV EDUTECH brand palette + semantic colors.
 * Light and dark themes share brand identity; only surface/ink swap.
 */

export const brand = {
  primary: '#003B8E',
  primarySoft: '#E6EBF4',
  primaryStrong: '#002966',
  primaryMuted: '#C0CDE3',
  accent: '#D50000',
  accentSoft: '#FCE6E6',
  accentMuted: '#F09595',
} as const;

export const semantic = {
  success: '#16A34A',
  successSoft: '#DCFCE7',
  successInk: '#166534',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  warningInk: '#92400E',
  danger: '#DC2626',
  dangerSoft: '#FCE6E6',
  dangerInk: '#991B1B',
  info: '#0EA5E9',
  infoSoft: '#DBEAFE',
  infoInk: '#1E40AF',
} as const;

export const lightTheme = {
  mode: 'light' as const,
  brand,
  semantic,
  bg: {
    page: '#F5F7FA',
    surface: '#FFFFFF',
    elevated: '#FFFFFF',
    inverse: '#0F172A',
    muted: '#F5F7FA',
  },
  ink: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#64748B',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
    onBrand: '#FFFFFF',
  },
  border: {
    subtle: '#E5E9F0',
    default: '#CBD5E1',
    strong: '#94A3B8',
    brand: brand.primary,
    danger: semantic.danger,
  },
  overlay: 'rgba(15, 23, 42, 0.5)',
  shadow: 'rgba(15, 23, 42, 0.08)',
};

export const darkTheme: typeof lightTheme = {
  mode: 'light' as const,
  brand,
  semantic,
  bg: {
    page: '#0F172A',
    surface: '#1E293B',
    elevated: '#1E293B',
    inverse: '#F1F5F9',
    muted: '#1E293B',
  },
  ink: {
    primary: '#F1F5F9',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    disabled: '#64748B',
    inverse: '#0F172A',
    onBrand: '#FFFFFF',
  },
  border: {
    subtle: '#334155',
    default: '#475569',
    strong: '#64748B',
    brand: brand.primary,
    danger: semantic.danger,
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

export type Theme = typeof lightTheme;
