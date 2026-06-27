/** 
 * HomeHelp Design System - Modern, Trustworthy, Launch-Ready
 * Based on frontend-design principles: deliberate choices, not defaults
 */

// ============================================================================
// COLOR SYSTEM - Emerald/Teal trust palette with modern neutrals
// ============================================================================
export const colors = {
  // Brand - Emerald/Teal for trust, growth, home services
  brand: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // Primary brand
    600: '#059669',  // Primary hover
    700: '#047857',  // Primary active
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Teal accent for driver mode distinction
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',  // Driver mode accent
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },

  // Modern neutrals - not generic gray, slightly warm
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },

  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Surface tokens
  surface: {
    primary: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f4f4f5',
    elevated: '#ffffff',
    overlay: 'rgba(24, 24, 27, 0.5)',
  },

  // Text tokens
  text: {
    primary: '#18181b',
    secondary: '#52525b',
    tertiary: '#a1a1aa',
    inverse: '#ffffff',
    link: '#059669',
  },

  // Border tokens
  border: {
    light: '#e4e4e7',
    medium: '#d4d4d8',
    dark: '#a1a1aa',
    focus: '#10b981',
  },
};

// ============================================================================
// TYPOGRAPHY - Inter for UI, distinctive display face
// ============================================================================
export const typography = {
  fontFamilies: {
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: '1.1',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  },
};

// ============================================================================
// SPACING - 4px base unit
// ============================================================================
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

// ============================================================================
// BORDER RADIUS - Modern, not too rounded
// ============================================================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

// ============================================================================
// SHADOWS - Layered, meaningful elevation
// ============================================================================
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  focus: '0 0 0 3px rgba(16, 185, 129, 0.4)',
};

// ============================================================================
// TRANSITIONS - Purposeful motion
// ============================================================================
export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '400ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// ============================================================================
// BREAKPOINTS
// ============================================================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// Z-INDEX
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
  toast: 600,
};

// ============================================================================
// COMPONENT TOKENS - Reusable component styles
// ============================================================================
export const components = {
  button: {
    heights: {
      sm: '36px',
      md: '44px',
      lg: '52px',
    },
    padding: {
      sm: '0 16px',
      md: '0 24px',
      lg: '0 32px',
    },
  },
  input: {
    height: '44px',
    padding: '0 16px',
  },
  card: {
    padding: '24px',
    gap: '16px',
  },
  container: {
    maxWidth: '1280px',
    padding: '0 24px',
  },
};

export default { colors, typography, spacing, borderRadius, shadows, transitions, breakpoints, zIndex, components };