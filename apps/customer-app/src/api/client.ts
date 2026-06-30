import * as SecureStore from 'expo-secure-store';
import { getIdToken } from '../lib/firebase-auth';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

async function getBackendToken(): Promise<string | null> {
  // First try to get the stored backend token
  const stored = await SecureStore.getItemAsync('auth_token');
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
          await SecureStore.setItemAsync('auth_token', data.token);
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
  // These are now handled by Firebase Auth directly
  sendOtp: async (_phoneNumber: string) => {
    // This is now handled by the AuthContext using Firebase Auth directly
    throw new Error('Use AuthContext.sendOtp instead');
  },
  verifyOtp: async (_phoneNumber: string, _otp: string) => {
    // This is now handled by the AuthContext using Firebase Auth directly
    throw new Error('Use AuthContext.verifyOtp instead');
  },
  getMe: () => request('/api/auth/me'),
  createBooking: (data: any) =>
    request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBookings: () => request('/api/bookings'),
  getBooking: (id: string) => request(`/api/bookings/${id}`),
  cancelBooking: (id: string) =>
    request(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
  createPaymentOrder: (bookingId: string, amount: number) =>
    request('/api/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId, amount }) }),
};