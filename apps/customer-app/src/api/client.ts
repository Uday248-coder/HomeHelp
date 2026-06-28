import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('auth_token');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
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
  sendOtp: (phoneNumber: string) =>
    request('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) }),
  verifyOtp: (phoneNumber: string, otp: string) =>
    request('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phoneNumber, otp }) }),
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
