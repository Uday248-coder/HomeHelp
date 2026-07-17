import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';
const CACHE_PREFIX = '@api_cache:';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes — booking/payment details move quickly

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Surface expired sessions: log the user out so they re-authenticate instead
// of receiving silent 401 loops.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  },
);

function isGetMethod(options: any): boolean {
  return !options?.method || options.method.toUpperCase() === 'GET';
}

export type CachedResponse<T> = T & { fromCache?: boolean };

async function request<T>(endpoint: string, options: any = {}): Promise<CachedResponse<T>> {
  try {
    const response = await apiClient.request({
      url: endpoint,
      ...options,
    });
    const data = response.data as T;

    if (isGetMethod(options)) {
      try {
        const entry = JSON.stringify({ ts: Date.now(), data });
        await AsyncStorage.setItem(CACHE_PREFIX + endpoint, entry);
      } catch {
        // Cache write failures are non-critical
      }
    }

    return data as CachedResponse<T>;
  } catch (error) {
    if (isGetMethod(options) && axios.isAxiosError(error) && !error.response) {
      try {
        const cached = await AsyncStorage.getItem(CACHE_PREFIX + endpoint);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Only serve from cache if the entry is fresh. Older entries are
          // dropped (throw the original network error) so booking status and
          // payment state don't sit indefinitely on stale data.
          if (parsed && typeof parsed === 'object' && typeof parsed.ts === 'number') {
            if (Date.now() - parsed.ts > CACHE_TTL_MS) {
              await AsyncStorage.removeItem(CACHE_PREFIX + endpoint);
            } else {
              const fresh = Array.isArray(parsed.data)
                ? Object.assign([], parsed.data)
                : { ...parsed.data };
              const result = fresh as CachedResponse<T>;
              result.fromCache = true;
              return result;
            }
          }
        }
      } catch {
        // Fall through — throw original error
      }
    }
    throw error;
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<any>('/api/auth/login', { method: 'POST', data: { email, password } }),
  register: (data: { email: string; password: string; name?: string; phoneNumber?: string }) =>
    request<any>('/api/auth/register', { method: 'POST', data }),
  getMe: async () => {
    const res = await request<any>('/api/auth/me');
    return res.user;
  },
  createBooking: (data: any) =>
    request<any>('/api/bookings', { method: 'POST', data }),
  getBookings: async () => {
    const res = await request<any>('/api/bookings');
    return res.bookings;
  },
  getBooking: async (id: string) => {
    const res = await request<any>(`/api/bookings/${id}`);
    return res.booking;
  },
  cancelBooking: (id: string) =>
    request<any>(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
  createPaymentOrder: (bookingId: string) =>
    request<any>('/api/payments/create-order', { method: 'POST', data: { bookingId } }),
};
