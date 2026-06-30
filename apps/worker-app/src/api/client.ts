import * as SecureStore from 'expo-secure-store';
import { getIdToken } from '../lib/firebase-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

async function getBackendToken(): Promise<string | null> {
  // First try to get the stored backend token
  const stored = await SecureStore.getItemAsync('worker_token');
  if (stored) return stored;

  // If no stored token, try to get Firebase ID token and exchange it
  const idToken = await getIdToken();
  if (idToken) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          await SecureStore.setItemAsync('worker_token', data.token);
          return data.token;
        }
      }
    } catch {
      // Fall through to return null
    }
  }
  return null;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getBackendToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  sendOtp: async (_phoneNumber: string) => {
    // This is now handled by the AuthContext using Firebase Auth directly
    throw new Error('Use AuthContext.sendOtp instead');
  },
  verifyOtp: async (_phoneNumber: string, _otp: string) => {
    throw new Error('Use AuthContext.verifyOtp instead');
  },
  getWorkerProfile: () => request('/api/workers/me'),
  getAvailableJobs: (mode?: string) =>
    request('/api/bookings/available' + (mode ? `?mode=${mode}` : '')),
  acceptJob: (bookingId: string) =>
    request(`/api/bookings/${bookingId}/assign`, { method: 'PATCH', body: JSON.stringify({}) }),
  startJob: (bookingId: string, otp: string) =>
    request(`/api/bookings/${bookingId}/start`, { method: 'PATCH', body: JSON.stringify({ otp }) }),
  completeJob: (bookingId: string, otp: string, rating?: number) =>
    request(`/api/bookings/${bookingId}/complete`, { method: 'PATCH', body: JSON.stringify({ otp, rating }) }),
  getMyJobs: () => request('/api/bookings/worker'),
  toggleAvailability: (isAvailable: boolean) =>
    request('/api/workers/me/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }),
  getEarnings: () => request('/api/payouts/me'),
};