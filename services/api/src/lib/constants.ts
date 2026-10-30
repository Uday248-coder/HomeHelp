if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}
export const JWT_SECRET = process.env.JWT_SECRET;

export const RATE_TABLE: Record<string, number> = {
  home_help: 199,
  driver: 149,
  driver_outstation: 129, // Per hour for outstation (minimum 4 hours)
};

export const OUTSTATION_MIN_HOURS = 4;
export const OUTSTATION_PER_KM_RATE = 12; // Flat distance fee per km for outstation
