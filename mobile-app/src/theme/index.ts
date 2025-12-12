// Цветова схема вдъхновена от Whering и Fits
// Чист, модерен и елегантен дизайн

export const colors = {
  // Primary colors
  primary: '#1A1A2E',      // Deep navy - основен цвят
  secondary: '#16213E',     // Dark blue
  accent: '#E94560',        // Coral pink - акцент за важни елементи
  accentLight: '#FF6B6B',   // Light coral

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F9FA',    // Light gray background
  surface: '#FFFFFF',       // Surface/card background
  card: '#FFFFFF',
  border: '#E5E5E5',
  
  // Text colors
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Category colors (за дрехи)
  categoryTops: '#FF6B6B',
  categoryBottoms: '#4ECDC4',
  categoryDresses: '#9B59B6',
  categoryOuterwear: '#3498DB',
  categoryShoes: '#F39C12',
  categoryAccessories: '#1ABC9C',
  
  // Gradient backgrounds
  gradientStart: '#667EEA',
  gradientEnd: '#764BA2',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  
  // Typography styles
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
