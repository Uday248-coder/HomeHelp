import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('worker_token');
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
