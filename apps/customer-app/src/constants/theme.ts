export const colors = {
  primary: '#1A3C34',
  primaryDark: '#122D26',
  secondary: '#C4774B',
  background: '#F6F4EF',
  card: '#FFFFFF',
  text: '#1A2C2B',
  textMuted: '#6B7280',
  error: '#DC2626',
  warning: '#F59E0B',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
  statusPending: '#F59E0B',
  statusAssigned: '#3B82F6',
  statusInProgress: '#10B981',
  statusCompleted: '#6B7280',
  statusCancelled: '#EF4444',
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
  md: 16,
  lg: 24,
  xl: 32,
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
