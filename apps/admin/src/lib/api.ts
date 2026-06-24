const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
}

export const api = {
  getDashboard: () => fetchAPI('/api/stats/dashboard'),
  getBookings: () => fetchAPI('/api/bookings/admin/all'),
  getWorkers: () => fetchAPI('/api/workers'),
  sendOtp: (phoneNumber: string) => fetchAPI('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phoneNumber }) }),
  verifyOtp: (phoneNumber: string, otp: string) => fetchAPI('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phoneNumber, otp }) }),
  getUser: (token: string) => fetchAPI('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};
