const KEY = 'homehelp_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, token);
};

export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(KEY);
};

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setToken(data.token);
  return data.token;
}

export async function logout(): Promise<void> {
  const token = getToken();
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    // best-effort — server-side cookie clear is a hygiene nicety, not required for client auth
  } finally {
    clearToken();
  }
}

export async function authedFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  // If the server kicks us out, drop the stale token so the next render prompts
  // for login instead of looping on cryptic 401s.
  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      // Avoid redirect loops on the login page itself.
      if (!window.location.pathname.startsWith('/book')) {
        window.location.href = `/book?login=expired&next=${next}`;
      }
    }
  }
  return res;
}
