// Shared allowed-origin list for CORS + Socket.io. Centralized so the empty
// env-var footgun (R001/R016) can only be fixed once. Dev-only origins are
// appended only when not running in production.

const PROD_ORIGINS = [
  'https://homehelp-admin.vercel.app',
  'https://homehelp-website.vercel.app',
];

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:3001'];

export function getAllowedOrigins(): string[] {
  const envValue = process.env.ALLOWED_ORIGINS;
  let origins: string[];

  if (envValue && envValue.trim().length > 0) {
    origins = envValue.split(',').map((o) => o.trim()).filter(Boolean);
  } else {
    origins = [...PROD_ORIGINS];
  }

  if (process.env.NODE_ENV !== 'production') {
    for (const dev of DEV_ORIGINS) {
      if (!origins.includes(dev)) origins.push(dev);
    }
  }

  return origins;
}
