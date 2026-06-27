export const colors = {
  primary: '#059669',
  primaryDark: '#047857',
  secondary: '#0d9488',
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  error: '#dc2626',
  warning: '#f59e0b',
  border: '#e5e7eb',
  white: '#ffffff',
  black: '#000000',
  statusPending: '#f59e0b',
  statusAssigned: '#3b82f6',
  statusInProgress: '#10b981',
  statusCompleted: '#6b7280',
  statusCancelled: '#ef4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fonts = {
  sizeSm: 12,
  sizeMd: 14,
  sizeLg: 16,
  sizeXl: 20,
  sizeXxl: 24,
  sizeTitle: 28,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
};
