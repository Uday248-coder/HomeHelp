import type { TextStyle } from 'react-native';

// HomeHelp — single source of truth for mobile design tokens.
// Mirrors the website's globals.css palette (pine + clay + warm-off-white)
// with a paired dark palette so both apps can render dark mode without
// re-implementing the token block in each workspace.

export const lightColors = {
  // Brand
  primary: '#1A3C34',
  primaryHover: '#245040',
  primaryActive: '#0F2A22',
  accent: '#0F766E',
  accentHover: '#0E6B62',
  accentSubtle: '#D4F0EC',
  warm: '#C4774B',
  warmHover: '#B6663B',
  warmSubtle: '#F8E9DC',

  // Surface
  background: '#F6F4EF',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAF8F4',
  surfaceTertiary: '#F0ECE4',
  surfaceInverse: '#1A2C2B',

  // Border
  border: '#E5E7EB',
  borderHover: '#9CA3AF',

  // Foreground
  text: '#1A2C2B',
  textMuted: '#6B7280',
  textSecondary: '#8A9493',
  textOnAccent: '#FFFFFF',
  textInverse: '#FFFFFF',

  // Status
  success: '#16A34A',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Booking status
  statusPending: '#B45309',
  statusAssigned: '#1D4ED8',
  statusInProgress: '#0F766E',
  statusCompleted: '#16A34A',
  statusCancelled: '#B91C1C',

  // Misc
  overlay: 'rgba(26, 44, 43, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
  shimmerBase: '#FAF8F4',
  shimmerHighlight: '#F0ECE4',
};

export const darkColors = {
  primary: '#E8F5F1',
  primaryHover: '#FFFFFF',
  primaryActive: '#C7E5DE',
  accent: '#34D3B6',
  accentHover: '#5FE0C7',
  accentSubtle: '#0F2A26',
  warm: '#E29870',
  warmHover: '#F0AD87',
  warmSubtle: '#3A2418',

  background: '#0C1413',
  surface: '#161F1D',
  surfaceSecondary: '#1E2A28',
  surfaceTertiary: '#27331F',
  surfaceInverse: '#F6F4EF',

  border: '#27331F',
  borderHover: '#4A5C57',

  text: '#EAEFE9',
  textMuted: '#9CA9A5',
  textSecondary: '#7A8884',
  textOnAccent: '#0C1413',
  textInverse: '#161F1D',

  success: '#4ADE80',
  error: '#F87171',
  warning: '#FBBF24',
  info: '#60A5FA',

  statusPending: '#FBBF24',
  statusAssigned: '#60A5FA',
  statusInProgress: '#34D3B6',
  statusCompleted: '#4ADE80',
  statusCancelled: '#F87171',

  overlay: 'rgba(0, 0, 0, 0.65)',
  white: '#FFFFFF',
  black: '#000000',
  shimmerBase: '#1E2A28',
  shimmerHighlight: '#27331F',
};

export type Colors = typeof lightColors;

export const colors = lightColors;

export const statusColorsLight: Record<string, string> = {
  pending: lightColors.statusPending,
  assigned: lightColors.statusAssigned,
  in_progress: lightColors.statusInProgress,
  completed: lightColors.statusCompleted,
  cancelled: lightColors.statusCancelled,
};

export const statusColorsDark: Record<string, string> = {
  pending: darkColors.statusPending,
  assigned: darkColors.statusAssigned,
  in_progress: darkColors.statusInProgress,
  completed: darkColors.statusCompleted,
  cancelled: darkColors.statusCancelled,
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  '2xl': 36,
  pill: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

// Inter Tight (sans) + Newsreader (serif) are loaded via expo-google-fonts
// at app startup. Both apps set these as the resolved family name once loaded;
// the safe fallback chain covers the brief pre-load window.
export const fonts = {
  display: 'Newsreader',
  displayFallback: 'Georgia',
  body: 'InterTight',
  bodyFallback: 'System',
  sizeXs: 11,
  sizeSm: 13,
  sizeMd: 15,
  sizeBase: 16,
  sizeLg: 18,
  sizeXl: 22,
  size2xl: 26,
  sizeXxl: 32,
  sizeTitle: 34,
  sizeHero: 44,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
};

export const shadows = {
  card: {
    shadowColor: '#1A2C2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  cardLifted: {
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
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
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

// Motion — three-step scale mirroring the website's --dur-* tokens.
// All on the spring-out curve for the premium, never-bouncy feel.
export const motion = {
  durMicro: 120,      // press feedback
  durFast: 200,       // chip/segment toggle
  durBase: 320,       // standard card lift / reveal
  durEntry: 480,      // screen entry
  durScene: 640,      // large layout transitions
  easeSpring: { damping: 18, stiffness: 220, mass: 0.9 },
  easeSpringSoft: { damping: 26, stiffness: 180, mass: 1.0 },
  easeSpringSnappy: { damping: 14, stiffness: 280, mass: 0.8 },
};

// Haptic patterns by interaction kind. expo-haptics ImpactFeedbackStyle
// values: Light=1, Medium=2, Heavy=3; NotificationFeedbackType:
// Success=1, Warning=2, Error=3.
export const haptics = {
  selection: { kind: 'impact', style: 1 as const },
  toggle: { kind: 'impact', style: 2 as const },
  confirm: { kind: 'notification', type: 1 as const },
  warning: { kind: 'notification', type: 2 as const },
  error: { kind: 'notification', type: 3 as const },
};

export type FontStyle = Pick<TextStyle, 'fontFamily' | 'fontWeight' | 'fontSize' | 'letterSpacing'>;

export const fontStack = (family: 'display' | 'body'): TextStyle['fontFamily'] => {
  const familyName = family === 'display' ? fonts.display : fonts.body;
  // RN ignores <family>,<fallback> strings — return single family; callers
  // should ensure expo-font has loaded before using display fonts.
  return familyName;
};
