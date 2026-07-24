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
  getMe: () => apiRequest<{ user: { id: string; name?: string; phoneNumber?: string; worker?: any } }>('/api/auth/me'),
  getMyJobs: () => apiRequest<{ bookings: any[] }>('/api/bookings/worker'),
  getEarnings: () => apiRequest<{ payouts: any[] }>('/api/payouts/me'),
  toggleAvailability: (isAvailable: boolean) =>
    apiRequest<any>('/api/workers/me/availability', { method: 'PATCH', body: JSON.stringify({ isAvailable }) }),
  startJob: (id: string, otp: string) => apiRequest<any>(`/api/bookings/${id}/start`, { method: 'PATCH', body: JSON.stringify({ otp }) }),
  completeJob: (id: string, otp: string, rating: number) => apiRequest<any>(`/api/bookings/${id}/complete`, { method: 'PATCH', body: JSON.stringify({ otp, rating }) }),
};