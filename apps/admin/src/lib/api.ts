const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAPI(endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `API request failed (${res.status})`);
      }
      return data;
    } catch (error: unknown) {
      if (attempt === retries) throw error;
      if (error instanceof Error && error.name === 'TimeoutError') {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
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

  generateBookingOtp: (bookingId: string, type: 'start' | 'end') =>
    fetchAPI(`/api/bookings/${bookingId}/generate-otp`, { method: 'PATCH', body: JSON.stringify({ type }) }) as Promise<{ otp: string }>,

  startBooking: (bookingId: string, otp: string) =>
    fetchAPI(`/api/bookings/${bookingId}/start`, { method: 'PATCH', body: JSON.stringify({ otp }) }),

  completeBooking: (bookingId: string, otp: string, rating?: number) =>
    fetchAPI(`/api/bookings/${bookingId}/complete`, { method: 'PATCH', body: JSON.stringify({ otp, rating: rating || 5 }) }),

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
    fetchAPI('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) }) as Promise<{ otp?: string }>,

  verifyOtp: (phoneNumber: string, otp: string) =>
    fetchAPI('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phoneNumber, otp }) }) as Promise<{ token: string }>,

  getUser: () => fetchAPI('/api/auth/me'),

  getPayment: (bookingId: string) => fetchAPI(`/api/payments/booking/${bookingId}`),
};
