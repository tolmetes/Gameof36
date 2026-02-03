// src/themes/playful.js
export const playfulTheme = {
  name: 'playful',
  colors: {
    background: ['#667EEA', '#F093FB'], // gradient
    surface: '#FFFFFF',
    surfaceLight: '#F3F4F6',
    primary: '#FBBF24',
    secondary: '#7C3AED',
    success: '#34D399',
    error: '#EF4444',
    text: '#1F2937',
    textMuted: '#6B7280',
    textDark: '#1F2937',
    // World accent colors
    easy: '#34D399',
    medium: '#FBBF24',
    hard: '#EF4444',
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      display: 48,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};
