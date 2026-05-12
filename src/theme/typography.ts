/**
 * Typography scale tuned for outdoor readability.
 * Two weights only: 400 regular, 500 medium. Never 600+ which feels heavy on mobile.
 */

export const typography = {
  display: { fontSize: 28, fontWeight: '500' as const, lineHeight: 34 },
  h1: { fontSize: 22, fontWeight: '500' as const, lineHeight: 28 },
  h2: { fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
  h3: { fontSize: 16, fontWeight: '500' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: '500' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 19 },
  bodySmallMedium: { fontSize: 13, fontWeight: '500' as const, lineHeight: 19 },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
  helper: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  helperMedium: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: '400' as const, lineHeight: 14 },
  mono: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    fontFamily: 'monospace' as const,
  },
};

export type TypographyKey = keyof typeof typography;
