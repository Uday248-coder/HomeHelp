const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAPI(endpoint: string, options: RequestInit = {}, retries = 2): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 401) {
        throw new Error('Unauthorized - please login again');
      }

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
        try { data = JSON.parse(data); } catch { /* keep as text */ }
      }

      if (!res.ok) {
        throw new Error(data?.error || `API request failed (${res.status})`);
      }

      return data;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.message === 'Unauthorized - please login again') {
        throw error;
      }

      if (attempt === retries) throw error;

      const isRetryable = error instanceof Error && (
        error.name === 'AbortError' ||
        error.name === 'TimeoutError' ||
        error.message.includes('fetch') ||
        error.message.includes('Failed to fetch')
      );

      if (isRetryable) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      await new Promise(r => setTimeout(r, 500));
      continue;
    }
  }
  throw new Error('Max retries exceeded');
}

export const api = {
  get: (endpoint: string) => fetchAPI(endpoint),

  post: (endpoint: string, data?: Record<string, unknown>) =>
    fetchAPI(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),

  patch: (endpoint: string, data?: Record<string, unknown>) =>
    fetchAPI(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),

  getDashboard: () => fetchAPI('/api/stats/dashboard'),

  getWeeklyRevenue: () => fetchAPI('/api/stats/revenue/weekly'),

  getPayouts: (params?: { page?: number; limit?: number }) =>
    fetchAPI('/api/payouts' + buildQuery(params as Record<string, string | number>)),

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
    fetchAPI(`/api/bookings/${bookingId}/complete`, { method: 'PATCH', body: JSON.stringify({ otp, rating }) }),

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

  firebaseAuth: (idToken: string) =>
    fetchAPI('/api/auth/firebase', { method: 'POST', body: JSON.stringify({ idToken }) }) as Promise<{ token: string }>,

  getUser: () => fetchAPI('/api/auth/me'),

  getPayment: (bookingId: string) => fetchAPI(`/api/payments/booking/${bookingId}`),
};
