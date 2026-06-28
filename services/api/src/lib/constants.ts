if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}
export const JWT_SECRET = process.env.JWT_SECRET;

export const RATE_TABLE: Record<string, number> = {
  home_help: 199,
  driver: 149,
};
