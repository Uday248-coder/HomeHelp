const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `API request failed (${res.status})`);
  }
  return data;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const api = {
  getDashboard: () => fetchAPI('/api/stats/dashboard'),

  getWeeklyRevenue: () => fetchAPI('/api/stats/revenue/weekly'),

  getBookings: (params?: { page?: number; status?: string; search?: string }) =>
    fetchAPI('/api/bookings/admin/all' + buildQuery(params as Record<string, string | number>)),

  getBooking: (id: string) => fetchAPI(`/api/bookings/${id}`),

  assignWorker: (bookingId: string, workerId: string) =>
    fetchAPI(`/api/bookings/${bookingId}/assign`, { method: 'PATCH', body: JSON.stringify({ workerId }) }),

  startBooking: (bookingId: string) =>
    fetchAPI(`/api/bookings/${bookingId}/start`, { method: 'PATCH', body: JSON.stringify({ otp: '0000' }) }),

  completeBooking: (bookingId: string, rating?: number) =>
    fetchAPI(`/api/bookings/${bookingId}/complete`, { method: 'PATCH', body: JSON.stringify({ otp: '0000', rating: rating || 5 }) }),

  cancelBooking: (bookingId: string) =>
    fetchAPI(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' }),

  getWorkers: (params?: { mode?: string }) =>
    fetchAPI('/api/workers' + buildQuery(params as Record<string, string | number>)),

  getWorker: (id: string) => fetchAPI(`/api/workers/${id}`),

  updateWorker: (id: string, data: Record<string, unknown>) =>
    fetchAPI(`/api/workers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getAvailableWorkers: (mode?: string) =>
    fetchAPI('/api/workers/available' + (mode ? `/${mode}` : '')),

  sendOtp: (phoneNumber: string) =>
    fetchAPI('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) }),

  verifyOtp: (phoneNumber: string, otp: string) =>
    fetchAPI('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phoneNumber, otp }) }),

  getUser: () => fetchAPI('/api/auth/me'),

  getPayment: (bookingId: string) => fetchAPI(`/api/payments/booking/${bookingId}`),
};
