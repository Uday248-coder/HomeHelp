export const lightColors = {
  brand: {
    primary: { base: '#0EAA6F', hover: '#0C9160', active: '#0A7A52', subtle: '#D1FAE8', glow: 'rgba(14,170,111,0.22)' },
    warm: { base: '#D4812D', hover: '#BB6E20', active: '#A05A18', subtle: '#FEF0E0', glow: 'rgba(212,129,45,0.20)' },
  },
  surface: {
    background: '#F6F4EF',
    primary: '#FFFFFF',
    secondary: '#FAF8F4',
    tertiary: '#F0ECE4',
    inverse: '#1A2C2B',
  },
  border: {
    base: '#CDD3CE',
    hover: '#9CA9A0',
    focus: '#0EAA6F',
  },
  text: {
    primary: '#1A2C2B',
    secondary: '#6B7280',
    tertiary: '#8A9493',
    onAccent: '#FFFFFF',
    onInverse: '#FFFFFF',
  },
  status: {
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  booking: {
    pending: '#B45309',
    assigned: '#1D4ED8',
    in_progress: '#0F766E',
    completed: '#16A34A',
    cancelled: '#B91C1C',
  },
  skeleton: {
    base: '#FAF8F4',
    highlight: '#F0ECE4',
  },
  overlay: 'rgba(26,44,43,0.45)',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(26,44,43,0.06)',
  shadowAccent: 'rgba(14,170,111,0.30)',
} as const;

export const darkColors = {
  brand: {
    primary: { base: '#34D39B', hover: '#5EEAB8', active: '#22C55E', subtle: '#0F2A1E', glow: 'rgba(52,211,155,0.25)' },
    warm: { base: '#E29870', hover: '#F0AD87', active: '#C7784A', subtle: '#3A2418', glow: 'rgba(226,152,112,0.22)' },
  },
  surface: {
    background: '#0C1413',
    primary: '#161F1D',
    secondary: '#1E2A28',
    tertiary: '#27331F',
    inverse: '#F6F4EF',
  },
  border: {
    base: '#27331F',
    hover: '#4A5C57',
    focus: '#34D39B',
  },
  text: {
    primary: '#EAEFE9',
    secondary: '#9CA9A5',
    tertiary: '#7A8884',
    onAccent: '#0C1413',
    onInverse: '#161F1D',
  },
  status: {
    success: '#4ADE80',
    error: '#F87171',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
  booking: {
    pending: '#FBBF24',
    assigned: '#60A5FA',
    in_progress: '#34D3B6',
    completed: '#4ADE80',
    cancelled: '#F87171',
  },
  skeleton: {
    base: '#1E2A28',
    highlight: '#27331F',
  },
  overlay: 'rgba(0,0,0,0.65)',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(0,0,0,0.35)',
  shadowAccent: 'rgba(52,211,155,0.22)',
} as const;

export type Colors = typeof lightColors;