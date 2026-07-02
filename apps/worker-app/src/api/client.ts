import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getIdToken } from '../lib/firebase-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';
const CACHE_PREFIX = '@api_cache:';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  // First try to get the stored backend token
  let token = await SecureStore.getItemAsync('worker_token');
  
  if (!token) {
    // If no stored token, try to get Firebase ID token and exchange it
    const idToken = await getIdToken();
    if (idToken) {
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/firebase`, { idToken });
        if (res.data && res.data.token) {
          token = res.data.token;
          await SecureStore.setItemAsync('worker_token', token);
        }
      } catch {
        // Fall through
      }
    }
  }
  
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
  sendOtp: async (_phoneNumber: string) => {
    throw new Error('Use AuthContext.sendOtp instead');
  },
  verifyOtp: async (_phoneNumber: string, _otp: string) => {
    throw new Error('Use AuthContext.verifyOtp instead');
  },
  getWorkerProfile: () => request<any>('/api/workers/me'),
  getAvailableJobs: (mode?: string) =>
    request<any[]>('/api/bookings/available' + (mode ? `?mode=${mode}` : '')),
  acceptJob: (bookingId: string) =>
    request<any>(`/api/bookings/${bookingId}/assign`, { method: 'PATCH', data: {} }),
  startJob: (bookingId: string, otp: string) =>
    request<any>(`/api/bookings/${bookingId}/start`, { method: 'PATCH', data: { otp } }),
  completeJob: (bookingId: string, otp: string, rating?: number) =>
    request<any>(`/api/bookings/${bookingId}/complete`, { method: 'PATCH', data: { otp, rating } }),
  getJob: (id: string) => request<any>(`/api/bookings/${id}`),
  getMyJobs: () => request<any[]>('/api/bookings/worker'),
  toggleAvailability: (isAvailable: boolean) =>
    request<any>('/api/workers/me/availability', { method: 'PATCH', data: { isAvailable } }),
  getEarnings: () => request<any>('/api/payouts/me'),
};
