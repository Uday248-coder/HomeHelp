export const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';
export const MAPTILER_STYLE_URL = MAPTILER_API_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`
  : '';

// Kolkata, India — MVP launch city
export const DEFAULT_CENTER: [number, number] = [88.3639, 22.5726];
export const DEFAULT_ZOOM = 13;

// OSRM public demo server (dev/testing only — self-host for production)
export const OSRM_URL = 'https://router.project-osrm.org';

// Marker colors (matching the design system)
export const MARKER_COLORS = {
  user: '#10b981',    // accent emerald
  worker: '#d97706',  // warm amber
  destination: '#ef4444', // error red for destination pin
} as const;
