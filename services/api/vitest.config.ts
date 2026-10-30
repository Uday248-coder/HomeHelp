import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test',
      YOUPI_API_URL: 'http://localhost:6100',
      YOUPI_MERCHANT_ID: 'test-merchant-id',
      YOUPI_WEBHOOK_SECRET: 'test-webhook-secret',
    },
  },
});
