import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { getIdToken } from '../lib/firebase-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

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

async function request<T>(endpoint: string, options: any = {}): Promise<T> {
  const response = await apiClient.request({
    url: endpoint,
    ...options,
  });
  return response.data;
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
