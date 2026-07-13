export const colors = {
  primary: '#1A3C34',
  primaryDark: '#122D26',
  secondary: '#C4774B',
  background: '#F6F4EF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A2C2B',
  textMuted: '#6B7280',
  textSecondary: '#8A9493',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',
  border: '#E5E7EB',
  divider: '#EFEAE3',
  overlay: 'rgba(26, 44, 43, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
  statusPending: '#B45309',
  statusAssigned: '#1D4ED8',
  statusInProgress: '#0F766E',
  statusCompleted: '#16A34A',
  statusCancelled: '#B91C1C',
};

export const statusColors: Record<string, string> = {
  pending: colors.statusPending,
  assigned: colors.statusAssigned,
  in_progress: colors.statusInProgress,
  completed: colors.statusCompleted,
  cancelled: colors.statusCancelled,
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
  // Editorial serif for display headings — echoes the website's Newsreader feel.
  display: 'Georgia, "Times New Roman", serif',
  sizeXs: 12,
  sizeSm: 14,
  sizeMd: 16,
  sizeLg: 18,
  sizeXl: 22,
  sizeXxl: 28,
  sizeTitle: 32,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
};

export const borderRadius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: '#1A2C2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  button: {
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  soft: {
    shadowColor: '#1A2C2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const shadow = shadows;
