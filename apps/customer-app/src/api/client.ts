import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

let tokenCache: string | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache) return tokenCache;
  tokenCache = await SecureStore.getItemAsync('auth_token');
  return tokenCache;
}

export async function clearToken() {
  tokenCache = null;
  await SecureStore.deleteItemAsync('auth_token');
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const t = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers ? (init.headers as Record<string, string>) : {}),
  };
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (res.status === 401) {
    await clearToken();
  }
  return res;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authedFetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: { id: string; name?: string; phoneNumber?: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { email: string; password: string; name?: string; phoneNumber?: string }) =>
    apiRequest<{ token: string; user: { id: string; name?: string; phoneNumber?: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest<{ user: { id: string; name?: string; phoneNumber?: string } }>('/api/auth/me'),
  createBooking: (data: Record<string, unknown>) =>
    apiRequest<{ booking: any }>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  getBookings: () =>
    apiRequest<{ bookings: any[] }>('/api/bookings'),
  getBooking: (id: string) =>
    apiRequest<{ booking: any }>(`/api/bookings/${id}`),
  cancelBooking: (id: string) =>
    apiRequest<any>(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
  createPaymentOrder: (bookingId: string) =>
    apiRequest<any>('/api/payments/create-order', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  markPaymentPaid: (paymentId: string) =>
    apiRequest<any>(`/api/payments/${paymentId}/mark-paid`, { method: 'POST' }),
  subscribePush: (subscription: object) =>
    apiRequest<any>('/api/push/subscribe', { method: 'POST', body: subscription }),
  unsubscribePush: () =>
    apiRequest<any>('/api/push/unsubscribe', { method: 'POST' }),
};