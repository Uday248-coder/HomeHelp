import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';
const CACHE_PREFIX = '@api_cache:';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('worker_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

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
        await AsyncStorage.setItem(CACHE_PREFIX + endpoint, JSON.stringify(data));
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
          const result = (Array.isArray(parsed) ? Object.assign([], parsed) : { ...parsed }) as CachedResponse<T>;
          result.fromCache = true;
          return result;
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
  getWorkerProfile: async () => {
    const res = await request<any>('/api/workers/me');
    return res.worker;
  },
  registerWorkerProfile: (data: { name: string; workerType: string; phoneNumber?: string }) =>
    request<any>('/api/workers/register', { method: 'POST', data }),
  getAvailableJobs: async (mode?: string) => {
    const res = await request<any>('/api/bookings/available' + (mode ? `?mode=${mode}` : ''));
    return res.bookings;
  },
  acceptJob: (bookingId: string) =>
    request<any>(`/api/bookings/${bookingId}/assign`, { method: 'PATCH', data: {} }),
  startJob: (bookingId: string, otp: string) =>
    request<any>(`/api/bookings/${bookingId}/start`, { method: 'PATCH', data: { otp } }),
  completeJob: (bookingId: string, otp: string, rating?: number) =>
    request<any>(`/api/bookings/${bookingId}/complete`, { method: 'PATCH', data: { otp, rating } }),
  getJob: async (id: string) => {
    const res = await request<any>(`/api/bookings/${id}`);
    return res.booking;
  },
  getMyJobs: async () => {
    const res = await request<any>('/api/bookings/worker');
    return res.bookings;
  },
  toggleAvailability: (isAvailable: boolean) =>
    request<any>('/api/workers/me/availability', { method: 'PATCH', data: { isAvailable } }),
  getEarnings: async () => {
    const res = await request<any>('/api/payouts/me');
    return res.payouts;
  },
};
