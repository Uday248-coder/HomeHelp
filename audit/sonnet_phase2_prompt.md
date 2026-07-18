# PROMPT FOR claude.ai WEB CHAT (Sonnet) — Phase 2: Auth Logout Hardening

> Copy everything below the line into claude.ai. It has NO repo access, so the real
> current file contents are pasted inline. Do ONE focused task. Return full updated files.

---

You are a senior full-stack engineer. I need a small, SAFE authentication hardening change
across the website client and the backend. You have NO filesystem access — I paste the real
current source below. Implement exactly what is described and return the COMPLETE updated files.

## IMPORTANT ARCHITECTURE CONSTRAINT (do not violate)
- The web frontend is hosted on `*.vercel.app` and the API on `*.onrender.com` — DIFFERENT
  registrable domains. Therefore the `auth_token` httpOnly cookie the API sets on login is
  THIRD-PARTY and is NOT sent by the browser to the API from the website/admin origin.
- Because of this, all clients authenticate by taking the `token` returned in the login/
  register RESPONSE BODY and sending it as `Authorization: Bearer <token>` (website uses
  localStorage `homehelp_token`; admin uses localStorage `admin_token`; mobile uses
  expo-secure-store). This cross-domain design is INTENTIONAL and must NOT be changed.
- CONSEQUENTLY: do NOT remove the `token` from the response body in auth.ts. Do NOT attempt
  to make the clients read the cookie instead of the body. The cookie stays as a same-origin
  convenience only.

## The actual problem to fix
On the website, the `logout()` handlers in the UI only call `clearToken()` (localStorage) and
never call the API's `POST /api/auth/logout`, so the server-set `auth_token` cookie is never
cleared server-side. This is a minor session-hygiene gap. Fix it by:
1. Adding a `logout()` function to `apps/website/src/lib/auth.ts` that:
   - POSTs to `${API_URL}/api/auth/logout` (no auth header needed, but include the bearer
     if present — best-effort, ignore network errors with try/catch).
   - Always calls `clearToken()` afterward (so local state is cleared even if the API call fails).
   - Returns void / Promise<void>.
2. Updating `apps/website/src/app/worker/page.tsx` and
   `apps/website/src/app/my-bookings/page.tsx` so their local `logout` handlers call the new
   `logout()` from `@/lib/auth` instead of only `clearToken()`. Keep their existing local
   state cleanup (setTokenState(null), setBookings([]), etc.) — just replace the
   `clearToken()` call with the imported `logout()` and make the handler async.

## Rules
- Only modify the 3 files listed. Do NOT touch the API auth.ts route, middleware, admin, or
  mobile apps (they already clear correctly or use secure-store).
- Keep all existing exports in `auth.ts` (`getToken`, `setToken`, `clearToken`, `login`,
  `authedFetch`). ADD `logout` as a new export.
- Use the existing `API_URL` constant already defined in `auth.ts`.
- Preserve the `typeof window` guard pattern used by the other functions.
- TypeScript strict: type the function as `export async function logout(): Promise<void>`.
- Do NOT change any other behavior.

## Acceptance criteria
1. `apps/website/src/lib/auth.ts` exports `logout` that POSTs to `/api/auth/logout` then clears localStorage.
2. Both `worker/page.tsx` and `my-bookings/page.tsx` logout buttons call the imported `logout()`
   and still reset their local React state.
3. If the API call fails (offline), localStorage is STILL cleared (graceful degradation).
4. No other files changed; no removal of the body `token`.

---

## FILE 1 OF 3 — `apps/website/src/lib/auth.ts` (current full contents)

```ts
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
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
```

---

## FILE 2 OF 3 — `apps/website/src/app/worker/page.tsx` (relevant excerpt)

The file is large; here are the ONLY parts you must change. The import line and the logout
handler. Everything else stays identical.

CURRENT import (line 5):
```tsx
import { getToken, clearToken, login } from '@/lib/auth';
```
CHANGE TO:
```tsx
import { getToken, clearToken, login, logout as apiLogout } from '@/lib/auth';
```

CURRENT logout handler (around line 164):
```tsx
  const logout = () => { clearToken(); setTokenState(null); };
```
CHANGE TO (make it async and call the API-backed logout, keeping local state reset):
```tsx
  const logout = async () => { await apiLogout(); setTokenState(null); };
```

Return the FULL file after making these two edits. (If you need the full original to return it
verbatim, note: do not alter any other line. The rest of the file is unchanged.)

---

## FILE 3 OF 3 — `apps/website/src/app/my-bookings/page.tsx` (relevant excerpt)

CURRENT import (line 6):
```tsx
import { getToken, clearToken, login } from '@/lib/auth';
```
CHANGE TO:
```tsx
import { getToken, clearToken, login, logout as apiLogout } from '@/lib/auth';
```

CURRENT logout handler (around line 228):
```tsx
  const logout = () => { clearToken(); setTokenState(null); setBookings([]); };
```
CHANGE TO:
```tsx
  const logout = async () => { await apiLogout(); setTokenState(null); setBookings([]); };
```

Return the FULL file after making these two edits. Do not alter any other line.

---

Return the three complete/updated files (auth.ts full; worker/page.tsx full; my-bookings/page.tsx
full). Briefly note what you changed in each.

---

## READ-ONLY CONTEXT — DO NOT MODIFY THESE (pasted so you understand the auth topology)

These files explain WHY the cross-domain Bearer-token design is intentional. You may read them
for context only. Do NOT propose changes to them in your response.

### `services/api/src/routes/auth.ts` (excerpt — login/register set BOTH cookie and body token)
```ts
// register (lines 58-73)
const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
res.cookie('auth_token', token, { httpOnly: true, secure: isProduction, sameSite: 'lax' });
const { password: _, ...userWithoutPassword } = user;
return res.json({ message: 'User registered successfully', token, user: userWithoutPassword });

// login (lines 98-113) — same pattern: cookie + body token
const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
res.cookie('auth_token', token, { httpOnly: true, secure: isProduction, sameSite: 'lax' });
const { password: _, ...userWithoutPassword } = user;
return res.json({ message: 'Login successful', token, user: userWithoutPassword });

// logout (lines 140-143)
authRouter.post('/logout', async (_req, res) => {
  res.clearCookie('auth_token');
  return res.json({ message: 'Logged out successfully' });
});
```
NOTE: body `token` is REQUIRED by all clients. Keep it.

### `services/api/src/middleware/auth.ts` (accepts Bearer OR cookie)
```ts
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  let token: string | undefined;
  if (header?.startsWith('Bearer ')) token = header.slice(7);
  else if (req.cookies?.auth_token) token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Missing authorization token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
```
NOTE: Bearer is the primary path for web/admin/mobile. Cookie is secondary (same-origin only).

### `apps/customer-app/src/context/AuthContext.tsx` (mobile uses SecureStore + body token)
```ts
const login = useCallback(async (email, password) => {
  const res = await api.login(email, password);
  await SecureStore.setItemAsync('auth_token', res.token); // body token, NOT cookie
  setToken(res.token);
  setUser(res.user);
}, []);
const logout = useCallback(async () => {
  await SecureStore.deleteItemAsync('auth_token');
  setToken(null); setUser(null);
}, []);
```
NOTE: mobile never reads the cookie. Confirms body-token design is universal.

### `apps/worker-app/src/context/AuthContext.tsx` (same pattern, 'worker_token')
```ts
const login = useCallback(async (email, password) => {
  const res = await api.login(email, password);
  await SecureStore.setItemAsync('worker_token', res.token); // body token
  setToken(res.token);
  // ...
}, []);
```
NOTE: worker app also relies on body token. Do NOT change.

### `apps/admin/src/lib/auth-context.tsx` (admin already does server logout correctly)
```ts
const logout = useCallback(async () => {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
  });
  localStorage.removeItem('admin_token');
  setToken(null); setUser(null);
}, []);
```
NOTE: This is the pattern the WEBSITE is missing. Your task is to bring the website up to parity
with this admin logout behavior. That is the entire scope.
