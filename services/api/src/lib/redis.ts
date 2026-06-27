import { Redis } from '@upstash/redis';

const hasCredentials = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

function createMockRedis() {
  const store = new Map<string, { value: string; expiry: number | null }>();
  console.warn('[Redis] Missing credentials — using in-memory mock');

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiry && Date.now() > entry.expiry) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    async set(key: string, value: string, opts?: { ex?: number }): Promise<'OK'> {
      store.set(key, { value, expiry: opts?.ex ? Date.now() + opts.ex * 1000 : null });
      return 'OK';
    },
    async del(...keys: string[]): Promise<number> {
      let count = 0;
      for (const key of keys) {
        if (store.delete(key)) count++;
      }
      return count;
    },
    async expire(key: string, seconds: number): Promise<number> {
      const entry = store.get(key);
      if (!entry) return 0;
      entry.expiry = Date.now() + seconds * 1000;
      return 1;
    },
    async incr(key: string): Promise<number> {
      const entry = store.get(key);
      const current = entry ? Number(entry.value) || 0 : 0;
      const next = current + 1;
      store.set(key, { value: String(next), expiry: entry?.expiry ?? null });
      return next;
    },
  };
}

export const redis = hasCredentials
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : createMockRedis();
