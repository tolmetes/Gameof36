// src/themes/dark.js
export const darkTheme = {
  name: 'dark',
  colors: {
    background: ['#0D0D0F', '#1A1A2E'], // gradient
    surface: '#1F1F2E',
    surfaceLight: '#2A2A3E',
    primary: '#00F5FF',
    secondary: '#8B5CF6',
    success: '#00FF88',
    error: '#FF4444',
    text: '#FFFFFF',
    textMuted: '#6B7280',
    textDark: '#1F2937',
    // World accent colors
    easy: '#00F5FF',
    medium: '#8B5CF6',
    hard: '#FF006E',
  },
  typography: {
    fontFamily: 'System', // Will use SF Pro on iOS, Roboto on Android
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
    glow: {
      shadowColor: '#00F5FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
  },
};
