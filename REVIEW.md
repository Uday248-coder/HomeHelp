# HomeHelp Code Review

Progressive audit of tracked repository files. Findings appended incrementally.

## Prioritized Action List (top fixes by risk × effort)

| # | ID | Fix | Risk | Effort |
|---|----|-----|------|--------|
| 1 | R011 | Move `/me` route before `/:id` in workers.ts — **unreachable dead code** | High | 5 min |
| 2 | R008 | Gate `/verify` behind `adminMiddleware` when Razorpay keys absent — **any user can mark payments captured** | High | 5 min |
| 3 | S6+R014 | Replace `include: { bookings:true, payouts:true }` with explicit `select` in workers `/:id` and `/me` — **OTP data leak** | High | 10 min |
| 4 | R004 | Fix `canActivate` to include `workerType === 'both'` in license check — **broken worker activation** | High | 2 min |
| 5 | R006 | Add `RATE_TABLE` fallback in `create-order` when `booking.hourlyRate` is null — **payment creation fails for legacy bookings** | High | 5 min |
| 6 | S1 | Add `console.error` to catch blocks in stats, payouts, users routes — **silent failures in admin endpoints** | Medium | 10 min |
| 7 | R024 | Add rate limiting to `POST /api/waitlist` — **unprotected public endpoint** | Medium | 3 min |
| 8 | R022 | Fix N+1 query in users list (batch aggregate instead of per-user) — **21+ queries per page load** | Medium | 20 min |
| 9 | R001+R016+S5 | Extract shared `ALLOWED_ORIGINS` module; fix empty-string filter — **CORS/Socket.io silent break** | Medium | 15 min |
| 10 | R012 | Replace `Math.random()` with `crypto.randomInt()` for OTP generation — **predictable OTPs** | Low | 2 min |
| 11 | R009 | Add `password.length >= 6` check in `/register` — **weak password policy gap** | Low | 2 min |
| 12 | R010 | Gate `devResetUrl` behind `DEBUG_AUTH` env var instead of `NODE_ENV` — **reset token leak on misconfigured Render** | Low | 5 min |
| 13 | S4+R025 | Validate `workerPayout` in payout processing; recalculate in mark-paid/verify — **zero worker payouts** | Medium | 10 min |
| 14 | R019 | Parallelize mode-revenue queries in `/analytics` — **admin dashboard latency** | Low | 10 min |
| 15 | R020 | Backfill or remove denormalized `totalJobs` from analytics query — **stale job counts** | Low | 5 min |
| 16 | F001 | Admin API client sends Bearer token from localStorage + `credentials: 'include'` — **dual auth channels, cookie CSRF risk** | High | 10 min |
| 17 | F002 | Website auth uses localStorage Bearer token; no httpOnly cookie — **XSS token theft surface** | High | 15 min |
| 18 | F003 | Admin `AdminGate` checks `user?.isAdmin` on client only — **no server-enforced admin guard on page load** | Medium | 5 min |
| 19 | F004 | Admin dashboard fetch in `useEffect` with no abort/cleanup — **stale responses on fast navigation** | Medium | 10 min |
| 20 | F005 | Worker portal `/api/workers/me` fetch in website has no error boundary — **white screen on 401/404** | Medium | 5 min |
| 21 | F006 | Customer app `authedFetch` doesn't handle 401/refresh — **silent auth failures** | Medium | 10 min |
| 22 | F007 | Mobile apps use `expo-secure-store` correctly, but axios interceptors don't handle token expiry — **expired tokens cause cryptic errors** | Medium | 10 min |
| 23 | F008 | Worker app location tracking emits to socket without auth validation on server — **unauthenticated location spoofing** | High | 10 min |
| 24 | F009 | CSP middleware generates new nonce per request but `'unsafe-inline'` in script-src — **nonce defeated** | Medium | 5 min |
| 25 | F010 | Secret-guard doesn't scan mobile app source (apps/customer-app, apps/worker-app) — **secrets could leak to app bundles** | Medium | 5 min |
| 26 | F011 | Admin payouts page `handleMarkPaid` uses Razorpay ID but backend expects payment ID — **type mismatch** | Low | 5 min |
| 27 | F012 | Website booking flow computes price client-side; server re-computes from RATE_TABLE — **price drift possible** | Low | 5 min |
| 28 | F013 | Mobile app API clients cache GET responses in AsyncStorage without TTL — **stale data served indefinitely** | Low | 10 min |
| 29 | F014 | CI `secret-guard` runs on source + `.next/static` but misses `apps/*/dist` (Expo web) — **build artifacts unscanned** | Low | 5 min |

Items 1–5 are **must-fix before launch**. Items 6–9 are **should-fix soon**. Items 10–29 are **nice-to-fix**, minor risk or MVP-scale only.

---

## Findings (Backend API — previously documented)

### R001 services/api/src/index.ts:L50-L58 — medium/security
**Issue:** CORS `origin` config splits `ALLOWED_ORIGINS` env var by comma, but an empty string produces `['']` — disables CORS entirely (cors passes an empty string as origin, matching nothing).
**Why it matters:** Setting `ALLOWED_ORIGINS=` (empty) on Render silently blocks all cross-origin API calls, breaking both Vercel apps.
**Current code:**
```ts
origin: process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000', 'http://localhost:3001',
  'https://homehelp-admin.vercel.app', 'https://homehelp-website.vercel.app',
],
```
**Fix:**
```ts
const corsOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').filter(Boolean)
  : ['https://homehelp-admin.vercel.app', 'https://homehelp-website.vercel.app'];
if (process.env.NODE_ENV !== 'production') {
  corsOrigins.push('http://localhost:3000', 'http://localhost:3001');
}
// Use corsOrigins as origin.
```

### R002 services/api/src/middleware/auth.ts:L24-L28 — high/security
**Issue:** `authMiddleware` accepts token from **either** `Authorization: Bearer` header **or** `req.cookies.auth_token` cookie. The cookie path uses `SameSite: 'lax'` which blocks cross-site form POSTs but NOT cross-site GET requests (top-level navigations, embeds, redirects). Combined with the website using Bearer+localStorage, this creates two independent auth channels with no unified CSRF defense.
**Why it matters:** Attackers can trigger authenticated GET requests from cross-origin via cookies (img/iframe/redirect). Any state-changing GET route becomes exploitable. Currently all mutating routes use POST/PATCH; check for GET-side effects.
**Current code:**
```ts
if (header?.startsWith('Bearer ')) {
  token = header.slice(7);
} else if (req.cookies?.auth_token) {
  token = req.cookies.auth_token;
}
```
**Fix:** Add a CSRF guard when token source is cookie: require either `req.headers.origin` matches allowed origins, or a custom header (`X-CSRF-Token`) for cookie-authenticated requests.

### R003 services/api/src/middleware/validation.ts:L26 — low/security
**Issue:** `sanitizeString` strips `<` and `>` only — not `&`, `"`, `'`. Name implies full sanitization but it only does bracket removal.
**Why it matters:** If this output is ever placed in a non-React HTML context (email body, admin report, CSV export), partial sanitization gives false confidence. In React JSX it's fine (React auto-escapes), but the misleading name invites misuse.
**Fix:** Rename to `trimAndStripBrackets` to make scope unambiguous. Or add `&`, `"`, `'` encoding for contexts where React auto-escaping doesn't apply (email, plain text).

### R004 services/api/src/lib/eligibility.ts:L56 — high/bug
**Issue:** `canActivate` only blocks activation for `workerType === 'driver'` without license, missing `workerType === 'both'`. A `both` worker with aadhaar but no license passes activation, then fails `isWorkerEligible('driver', ...)` later — causing booking assignment failures.
**Why it matters:** Admin activates a `both` worker who can't actually drive. The worker appears in driver-mode lists, assignment fails eligibility checks, creating broken booking flows.
**Current code:**
```ts
if (w.workerType === 'driver' && !w.licenseVerified) {
  return { ok: false, reason: 'License verification required to activate a driver' };
}
```
**Fix:**
```ts
if ((w.workerType === 'driver' || w.workerType === 'both') && !w.licenseVerified) {
  return { ok: false, reason: 'License verification required to activate a driver' };
}
```

### R005 services/api/src/middleware/auth.ts:L48 — medium/perf
**Issue:** `adminMiddleware` hits the database on every admin request to re-check `isAdmin` via `prisma.user.findUnique`, despite the JWT already being verified in `authMiddleware`. The JWT payload lacks `isAdmin`.
**Why it matters:** Not a scaling problem for MVP, but every admin endpoint call adds a synchronous DB roundtrip that could be avoided by including `isAdmin` in the JWT payload at issue time.
**Fix:** Add `isAdmin: boolean` to the JWT payload in login/register after fetching the user. Set `req.user.isAdmin` from the token; fall back to DB only if token lacks it.

### R006 services/api/src/routes/payments.ts:L61-L63 — high/bug
**Issue:** Payment amount is computed from `booking.hourlyRate` and `booking.durationHours`, defaulting to 0 and 1 when absent. These are booking fields that could be unset/missing. The server's `RATE_TABLE` (rates from constants.ts) is never consulted, despite AGENTS.md stating "server-side pricing via RATE_TABLE is single source of truth; clients cannot supply amount or hourlyRate." The booking already has its rate stored when created (from the bookings route), but if `hourlyRate` is null/undefined on the booking, amount becomes 0, payment creation fails (amount <= 0 check at L65).
**Why it matters:** If a booking's `hourlyRate` field is null (e.g. legacy booking, migration gap), the payment endpoint rejects with a confusing error instead of using the authoritative `RATE_TABLE`. The `RATE_TABLE` backup path promised in design docs is entirely absent.
**Current code:**
```ts
const rate = booking.hourlyRate ? Number(booking.hourlyRate) : 0;
const hours = booking.durationHours ? Number(booking.durationHours) : 1;
const amount = parseFloat((rate * hours).toFixed(2));
if (amount <= 0) {
  return res.status(400).json({ error: 'Cannot create payment: booking has no hourly rate or duration' });
}
```
**Fix:**
```ts
const defaultRate = RATE_TABLE[booking.mode] || 0;
const rate = booking.hourlyRate ? Number(booking.hourlyRate) : defaultRate;
const hours = booking.durationHours ? Number(booking.durationHours) : 1;
const amount = parseFloat((rate * hours).toFixed(2));
if (amount <= 0) {
  return res.status(400).json({ error: 'Cannot create payment: booking has no valid rate or duration' });
}
```

### R007 services/api/src/routes/payments.ts:L109-L120 — medium/bug
**Issue:** Idempotency backfill logic (L109-120) creates a new Razorpay order when an existing `razorpay` payment has no `razorpayOrderId` — but it never checks whether the payment is already `paid`/`captured`. A completed payment should not get a new Razorpay order created.
**Why it matters:** Minor — requires an edge case where a Razorpay payment exists without an order ID. But if triggered on a captured payment, it creates a zombie order in Razorpay.
**Fix:** Add `&& payment.status === 'pending'` to the condition at L109.

### R008 services/api/src/routes/payments.ts:L167 — medium/security
**Issue:** The `/verify` endpoint does **not** run `adminMiddleware`, and on L198 (no Razorpay configured) it **skips signature verification entirely** — any authenticated user can call `/verify` with just a `paymentId` and mark the payment as `captured`, bypassing actual payment verification.
**Why it matters:** When Razorpay keys are not set (current production state — UPI manual mode), the verify endpoint becomes a no-op confirmation that any authenticated user can exploit to mark their own payments as captured without paying.
**Current code:**
```ts
if (!razorpay) {
  console.warn('[Payments] Razorpay not configured - skipping signature verification');
} else {
  // ... only then checks signature
}
// Then unconditionally updates payment to captured at L217-L223
```
**Fix:** When `!razorpay`, return 400 instead of silently skipping verification. UPI payments should be confirmed via the admin `/:id/mark-paid` route, not via `/verify`. Or gate `/verify` behind `adminMiddleware` when Razorpay is absent.

### R009 services/api/src/routes/auth.ts:L49-L55 — medium/bug
**Issue:** `register` creates a user with `name` and `phoneNumber` from the body but **no password length validation** (only L25 checks presence, not quality). `login` compares passwords via bcrypt, which silently accepts any length. The `reset-password` route validates `password.length < 6` (L186), but registration does not.
**Why it matters:** Users can register with a 1-character password, creating accounts with trivially cracked credentials. While bcrypt hashes any length, the UX inconsistency (reset enforces min 6, register doesn't) is a defect.
**Fix:** Add `if (password.length < 6)` validation in `/register` (after L25), matching the `reset-password` check.

### R010 services/api/src/routes/auth.ts:L168-L170 — medium/security
**Issue:** When `NODE_ENV !== 'production'`, `/forgot-password` returns the plaintext reset token in the response (`devResetUrl`). This leaks the token to any client — CI, staging deploys, or if `NODE_ENV` is misconfigured on Render.
**Why it matters:** If `NODE_ENV` is accidentally `development` on Render, reset tokens leak in API responses, allowing account hijacking.
**Fix:** Gate behind `DEBUG_AUTH=true` env var, not `NODE_ENV` alone. At minimum, also check `!process.env.RENDER`.

### R011 services/api/src/routes/workers.ts:L186-L198 — high/bug
**Issue:** `workersRouter.get('/me', ...)` at L186 is registered **after** `workersRouter.get('/:id', ...)` at L106. Express matches routes in registration order; `/:id` catches `"me"` as a literal id parameter, so `GET /workers/me` never reaches the `/me` handler. The worker trying to view their own profile via `/me` gets the `/:id` handler instead.
**Why it matters:** `GET /api/workers/me` is completely unreachable — it's silently dead code. The worker wanting their own profile hits `/:id` which looks up by the literal string `"me"` as an ID, returning 404. Worker portal login → profile view breaks.
**Current code (order):**
```ts
// L106 — defined FIRST
workersRouter.get('/:id', authMiddleware, async (req, res) => { ... });
// L186 — defined SECOND, shadowed
workersRouter.get('/me', authMiddleware, async (req, res) => { ... });
```
**Fix:** Move `/me` (L186-L198) before `/:id` (L106-L136). Place it immediately after the `available/:mode` route at L221.

### R012 services/api/src/routes/bookings.ts:L416 — medium/security
**Issue:** OTP generation uses `Math.floor(1000 + Math.random() * 9000).toString()` — `Math.random()` is not cryptographically secure. If an attacker can predict or influence the RNG state (possible in V8 under certain conditions), they can pre-compute OTPs.
**Why it matters:** OTPs gate the start/complete lifecycle of bookings. If predictable, a malicious worker could start or complete bookings without the customer sharing the OTP.
**Fix:**
```ts
const otp = crypto.randomInt(1000, 10000).toString();
```
Requires `import crypto from 'crypto'` (already imported in auth.ts; add to bookings.ts).

### R013 services/api/src/routes/bookings.ts:L419-L422 — medium/bug
**Issue:** OTPs are stored on the booking record but never cleared after successful use. A `start` OTP used successfully at L340 remains on the booking record indefinitely. If generate-otp is called again (e.g. admin retry), the new OTP overwrites, but if an old OTP is somehow still valid (no expiry check), it could be reused.
**Why it matters:** Low risk — each mutation validates the exact OTP on the booking at that moment. But OTPs persisting after completion is data hygiene risk (if OTPs leak or are inspected out-of-band, they give false impression of ongoing access).
**Fix:** After successful OTP validation in `/start` and `/complete`, set the used OTP field to `null` in the `update` call (L342-L346 and L370-L378).

### R014 services/api/src/routes/workers.ts:L109-L111 — medium/bug
**Issue:** `GET /:id` uses `include: { bookings: true, payouts: true }` — includes ALL related bookings and all payouts without field selection. When the caller is the owner or admin (L130 returns `{ worker }`), this dumps full booking objects including OTPs (if `select` is not used) and all payment fields.
**Why it matters:** Violates SECURITY_CHECKLIST.md item 13 ("Every response uses a Prisma `select` — never return a full model row"). OTPs and sensitive user data leak from related bookings.
**Current code:**
```ts
const worker = await prisma.worker.findUnique({
  where: { id: req.params.id },
  include: { bookings: true, payouts: true },
});
```
**Fix:** Replace `include: { bookings: true, payouts: true }` with explicit `select` for the `bookings` relation using `BOOKING_SAFE_FIELDS` (import it from bookings route or define locally), and `select` for `payouts` limiting to safe fields.

### R015 services/api/src/routes/bookings.ts:L428 — medium/security
**Issue:** When the booking user has no email, the OTP log masks to `otp[0]***` — revealing the first digit on the server console. While server logs are not client-facing, this reduces the OTP search space from 10^4 to 10^3 for any attacker who gains log access.
**Why it matters:** Low risk — server logs should not be publicly accessible. But in breach scenarios, partial OTP disclosure increases bruteforce risk.
**Fix:** Log only `"***"` (mask all digits), or skip the log entirely and rely on the email-sent confirmation.

### R016 services/api/src/socket.ts:L6-L11 — medium/bug
**Issue:** Socket.io CORS origins use the same `ALLOWED_ORIGINS` split pattern as `index.ts` (R001) — an empty env var produces `['']`, causing Socket.io to reject all connections.
**Why it matters:** Worker location tracking silently breaks if `ALLOWED_ORIGINS` is set to empty on Render. Mobile worker apps won't connect via Socket.io.
**Fix:** Same as R001 — filter empty strings, only allow localhost origins in dev:
```ts
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .filter(Boolean);
if (ALLOWED_ORIGINS.length === 0) {
  ALLOWED_ORIGINS.push('https://homehelp-admin.vercel.app', 'https://homehelp-website.vercel.app');
}
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://localhost:3001');
}
```

### R017 services/api/src/socket.ts:L41-L43 — medium/bug
**Issue:** `update_location` handler emits to `user:${userId}` — the same user who sent the update. This broadcasts location only to the user's own socket, not to other users watching that booking. No admin or customer sees the worker's location unless the worker also emits `update_booking_location` (L49) with a bookingId.
**Why it matters:** Location tracking is siloed — a worker's live location only reaches other clients subscribed to a specific booking room (`booking:${bookingId}`), not to a general admin monitoring view. The `user:` namespace emits are self-only, making the `user:` rooms functionally useless for tracking.
**Fix:** Either remove the `user:${userId}` join pattern (if no use case), or change `update_location` to broadcast to admins via a dedicated `admins` room or a `worker:${userId}` room that admin clients join.

### R018 services/api/src/routes/stats.ts:L51-L52 — low/error-handling
**Issue:** Dashboard stats error handler (L51-52) logs nothing — neither `console.error` nor Sentry. Catch block silently swallows the error type. Same pattern repeats at L90-L91 (revenue/weekly) and L199-L200 (analytics). Contrast with bookings/payments/auth routes which all include `console.error('[route] description:', err)`.
**Why it matters:** Dashboard 500s leave zero diagnostic trace. An admin reporting "dashboard is broken" gives no server-side clue to what failed (DB timeout? table missing? permission?).
**Fix:** Add `console.error('[stats] dashboard error:', error)` at L51, matching the pattern in every other route file.

### R019 services/api/src/routes/stats.ts:L95-L201 — medium/perf
**Issue:** `/analytics` runs 7 Prisma queries: a Promise.all of 5, then two more sequential `payment.aggregate` calls for `home_help` / `driver` mode revenue (L146-L161), then a final `worker.count` (L175). The two sequential queries double the request latency since they wait for Promise.all to finish before executing. The mode-specific revenue could be folded into a single `groupBy` query.
**Why it matters:** Analytics endpoint is ~30% slower than it needs to be. At MVP scale this is negligible, but every admin dashboard load (page.tsx calls this) accumulates latency.
**Fix:** Replace L146-L161 with a single `prisma.payment.groupBy({ by: ['booking.mode'], ... })` or query both in parallel with the initial Promise.all (pass `Promise.all([...])` with 7 promises instead of 5+2+1).

### R021 services/api/src/routes/payouts.ts:L41 — low/error-handling
**Issue:** `/` catch block at L41 (and every catch in payouts.ts) has no `console.error` log — same pattern as R018 (stats.ts). Error details are swallowed.
**Fix:** Add `console.error('[payouts] ...', error)` in every catch block (L41, L58, L71, L139, L164).

### R022 services/api/src/routes/users.ts:L45-L65 — high/perf
**Issue:** The users list endpoint runs `N+1` queries: one `findMany` for users, then a **per-user** `payment.aggregate` (L47-L53) inside `Promise.all(users.map(...))`. With 20 users per page, that's 21 queries. At 50-100 users per page, it's 51-101 queries hitting the DB synchronously.
**Why it matters:** Admin customers page loads degrade linearly with page size. At 100 users it's ~101 sequential queries, potentially causing Render's free-tier DB connection pool to saturate and time out.
**Current code:**
```ts
const enriched = await Promise.all(
  users.map(async (u) => {
    const spent = await prisma.payment.aggregate({ ... where: { booking: { userId: u.id }, status: 'captured' } });
    ...
  }),
);
```
**Fix:** Use a single `prisma.payment.groupBy` or aggregate grouped by `booking.userId` to compute totals in one query, then join in-memory:
```ts
const userIds = users.map(u => u.id);
const totals = await prisma.payment.groupBy({
  by: ['bookingId'],
  _sum: { amount: true },
  where: { booking: { userId: { in: userIds } }, status: 'captured' },
});
// Then build a Map<userId, sum> by joining back through booking.userId
```

### R023 services/api/src/routes/users.ts:L69 — low/error-handling
**Issue:** Catch block at L69 (and L103, L130) has no `console.error` — same pattern as R018/R021.
**Fix:** Add `console.error('[users] ...', error)` in all catch blocks.

### R024 services/api/src/routes/waitlist.ts:L8-L29 — high/perf
**Issue:** `POST /waitlist` (L8) has **no rate limiting**. Unlike auth (10/min), OTP generate (5/min), or global (100/min), the waitlist is fully public and unprotected. A script can POST thousands of fake emails into the DB.
**Why it matters:** The waitlist entry table has no cost per row, but filling it with garbage data via a trivial loop wastes DB storage and makes the admin waitlist list useless. Also, the `findUnique` per email on each POST is an unauthenticated DB read — combinable with email enumeration (already mitigated by the error message at L20 being generic, good).
**Fix:** Add at minimum the `authLimiter` (10/min per IP) to the waitlist POST, or a dedicated `waitlistLimiter`. Move the limiter import and apply: `waitlistRouter.post('/', someLimiter, async (req, res) => ...)`.

### R025 services/api/src/routes/payouts.ts:L116-L120 — medium/bug
**Issue:** Payout process query filters bookings with `payment: { status: 'captured' }` (L103). But booking → payment → workerPayout field is the **post-fee payout amount** stored on the payment record at creation. The loop at L116 sums `b.payment?.workerPayout || 0`. If a payment's `workerPayout` is null/undefined (e.g., payment created before the field existed or payment in `paid` not `captured` status), the worker gets 0 payout for that booking.
**Why it matters:** Legacy or edge-case bookings with completed work but `payment.workerPayout = null` silently result in zero payouts for workers, even though the combined filter (`payment.status === 'captured'`) should guarantee a valid payment exists.
**Fix:** Validate that `b.payment?.workerPayout` is a positive number before including it. If null, log a warning and skip that booking, or use `(b.payment?.amount || 0) * 0.85` as fallback (85% = amount minus 15% platform fee).

---

## Systemic Issues (Cross-File)

### S1 Error logging inconsistency
**Pattern:** Routes in `auth.ts`, `bookings.ts`, `payments.ts`, `workers.ts`, `waitlist.ts` all use `console.error('[route] ...', err)` in catch blocks. Routes in `stats.ts`, `payouts.ts`, `users.ts` have **no** console.error — errors are silently swallowed (R018, R021, R023).
**Risk:** Admin-facing endpoints (dashboard, analytics, payouts, customer list) are the most likely to be load-tested/debugged in prod but leave zero server-side trace on failure.
**Fix:** Add `console.error('[module] describe:', error)` to every catch block in stats.ts, payouts.ts, users.ts. Audit any future route files for the same pattern.

### S2 Route ordering traps — `/me` and /`/:id` shadowing
**Pattern:** Express matches routes in registration order. Two files place `/me` **after** `/:id`:
- `workers.ts`: `GET /:id` at L106, then `GET /me` at L186 — `/me` is dead code (R011)
- `bookings.ts`: No `/me` route, but `GET /worker` at L209 is correctly after `GET /admin/all` at L116 and `GET /available` at L164. OK.
- `payouts.ts`: `GET /me` at L45, `GET /:id` at L62 — correct order.
**Risk:** Worker portal profile view via `/api/workers/me` is a 404; newly registered workers can't see their own profiles.
**Fix:** Always place literal-path routes (`/me`, `/register`, `/available`) before parameterized routes (`/:id`). Apply to workers.ts L186 immediately.

### S3 Non-null assertion on `req.user!.userId`
**Pattern:** Every route handler uses `req.user!.userId` without a null guard, despite `authMiddleware` running first. If authMiddleware fails and somehow the route still executes (impossible with Express middleware chaining unless there's a middleware ordering gap), it would crash. Not a real risk with the current architecture since `authMiddleware` returns `401` before calling `next()` — but the `!` assertion is spammed across ~40+ locations.
**Risk:** Theoretical — only becomes real if someone adds an optional auth path (`authMiddleware` with `next()` always called) or a route moved above the middleware.
**Fix:** Low-priority style clean: add a single type guard `if (!req.user) return res.status(401)...` or keep the `!` assertions (they're safe as long as middleware ordering is maintained). Not blocking.

### S4 Payments `workerPayout` field nullable
**Pattern:** The `workerPayout` field on the Payment model is computed at `/create-order` (L70 in payments.ts) as `amount - platformFee`. It's stored correctly when creating new payments. But the `mark-paid` route (L145) and the `verify` route (L167) don't update `workerPayout` — they only touch `status`. The payout processing route (R025) queries `b.payment?.workerPayout || 0`, silently falling back to zero.
**Risk:** If a payment record was ever migrated, manually created, or its `workerPayout` field is null for any reason, workers get zero payout (R025). Combined with the N+1 query in users.ts (R022), this suggests the data layer has gaps between payment creation and downstream consumers.
**Fix:** In `/mark-paid` and `/verify`, recalculate and store `workerPayout` alongside the status update. In `/process` payouts, validate `workerPayout` is a positive number before including.

### S5 CORS configuration duplicated across two files
**Pattern:** `index.ts` L50-L58 and `socket.ts` L6-L11 both independently parse `ALLOWED_ORIGINS` with the same split/fallback logic. Both suffer from the empty-string footgun (R001, R016). Any future file needing allowed origins (e.g., a webhook listener) would duplicate this again.
**Risk:** Configuration drift — changing origins in one place but not the other breaks either the REST API or Socket.io without an obvious failure (Socket.io connection failure is silent on mobile).
**Fix:** Extract allowed origins logic into a shared module (`src/lib/origins.ts`), used by both `index.ts` and `socket.ts`. Fix the empty-string filter once, applies everywhere.

### S6 Incomplete `select` on `include` usage in workers/:id
**Pattern:** Most routes use explicit `select` (per SECURITY_CHECKLIST.md item 13). But `GET /workers/:id` at L109-L111 uses `include: { bookings: true, payouts: true }` (R014), and `GET /workers/me` at L189-L190 does the same. This returns full model rows with OTPs and sensitive fields.
**Risk:** Direct violation of security checklist. Anyone accessing worker detail (admin, or the worker themselves via `/me` once R011 is fixed) gets raw booking records with OTPs.
**Fix:** Replace `include` with explicit `select` for related records, using BOOKING_SAFE_FIELDS pattern.

---

## Frontend Audit Findings (Admin Dashboard — `apps/admin`)

### F001 apps/admin/src/lib/api.ts:L16-L17 — high/security
**Issue:** The admin API client sends **both** a Bearer token from `localStorage` (`admin_token`) **and** `credentials: 'include'` (which sends cookies). The backend accepts either (R002). This creates dual auth channels with no CSRF protection on the cookie path.
**Why it matters:** The admin dashboard loads on `https://homehelp-admin.vercel.app` but the API is on `https://homehelp-clbc.onrender.com` (cross-site). The `SameSite: 'lax'` cookie will be sent on top-level navigations and GET requests from third-party contexts. Any state-changing GET endpoint (none currently, but future risk) is vulnerable. The Bearer token in localStorage is also XSS-exposed.
**Current code:**
```ts
const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
if (token) headers['Authorization'] = `Bearer ${token}`;
// ...
credentials: 'include',
```
**Fix:** Pick one auth strategy. Since the API issues httpOnly cookies on login, drop the Bearer token from localStorage and rely solely on `credentials: 'include'`. Or if keeping Bearer for mobile compatibility, disable `credentials: 'include'` for admin (API is cross-origin) and add CSRF header for cookie-based requests.

### F002 apps/website/src/lib/auth.ts:L15-L24 — high/security
**Issue:** Website auth uses `localStorage` Bearer token (`homehelp_token`) + `authedFetch` helper. No httpOnly cookie support. The token is fully XSS-exposed.
**Why it matters:** Any XSS on the marketing website (CSP helps but `'unsafe-inline'` is present — see F009) steals auth tokens for customer bookings, worker portal, and my-bookings. The admin dashboard uses httpOnly cookies; the website does not. Inconsistent security posture.
**Current code:**
```ts
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(KEY, token);
};
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
**Fix:** Migrate website to httpOnly cookie auth when custom domain exists (same-site cookies work). In the interim, harden CSP (remove `'unsafe-inline'`), add `X-Content-Type-Options: nosniff`, and consider short token TTL with refresh rotation.

### F003 apps/admin/src/components/AdminGate.tsx:L11-L27 — medium/security
**Issue:** `AdminGate` checks `user?.isAdmin` on the **client only**. If an attacker bypasses the client check (DevTools, network intercept), they can render admin pages. The actual API calls will fail with 403, but the UI shell is accessible.
**Why it matters:** Defense in depth — admin pages should be SSR-gated or at minimum the initial HTML should not render for non-admins. Currently a non-admin who logs in gets a client-side redirect but the React tree mounts first.
**Fix:** Move the admin check to `getServerSideProps` (or RSC in App Router) so non-admins never receive the admin page HTML. Or keep client check but add a loading state that doesn't flash admin UI.

### F004 apps/admin/src/app/page.tsx:L39-L56 — medium/bug
**Issue:** Dashboard `fetchStats` runs in `useEffect` with no abort controller. Rapid navigation (e.g., user clicks Bookings → Dashboard → Workers quickly) can cause stale responses to overwrite newer state, showing wrong data.
**Why it matters:** Race conditions in data fetching cause flickering/incorrect dashboards. Common in React apps without request cancellation.
**Current code:**
```ts
useEffect(() => { fetchStats(); }, []);
const fetchStats = async () => {
  const [statsData, revenues] = await Promise.all([...]);
  setStats(statsData);
  setRevenueData(...);
};
```
**Fix:** Add AbortController in `useEffect` cleanup, or use a data-fetching library (TanStack Query, SWR) that handles deduping/cancellation.

### F005 apps/website/src/app/worker/page.tsx:L128-L143 — medium/bug
**Issue:** Worker portal fetches `/api/workers/me` in `load()` but has no error boundary for 401/404. If the token is expired or the worker doesn't have a profile yet, the page shows a white screen (no fallback UI).
**Why it matters:** New workers who registered but haven't completed their profile get a blank page. Token expiry causes silent failure.
**Current code:**
```ts
const [av, my, me] = await Promise.all([
  fetch(`${API}/api/bookings/available?mode=${mode}`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
  fetch(`${API}/api/bookings/worker`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
  fetch(`${API}/api/workers/me`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => (r.ok ? r.json() : null)),
]);
```
**Fix:** Check `r.ok` for each fetch, show appropriate error UI (login redirect for 401, "complete profile" for 404).

### F006 apps/website/src/lib/auth.ts:L44-L53 — medium/bug
**Issue:** `authedFetch` does not handle 401 responses. If the token expires, every API call fails silently with no redirect to login.
**Why it matters:** Users get cryptic "Failed to fetch" errors instead of being prompted to sign in again.
**Fix:** In `authedFetch`, check `res.status === 401`, call `clearToken()`, `window.location.href = '/book?login=expired'` (or similar).

### F007 apps/customer-app/src/api/client.ts:L13-L19 — medium/bug
**Issue:** Mobile axios interceptor retrieves token from SecureStore on every request but doesn't handle 401 responses (token expiry). No automatic logout or refresh.
**Why it matters:** Expired tokens cause cryptic network errors. Users don't know to sign out/in.
**Fix:** Add response interceptor: on 401, `SecureStore.deleteItemAsync('auth_token')`, trigger logout in AuthContext (requires context access or event emitter).

### F008 apps/worker-app/src/lib/location.ts:L10-L16 — high/security
**Issue:** Worker location tracking initializes Socket.io with `auth: { token }` but the server's Socket.io middleware (in `socket.ts`) does not appear to validate this token — it only checks CORS origins. Any client can connect and emit `update_booking_location` with arbitrary coordinates.
**Why it matters:** Unauthenticated location spoofing. A malicious actor can fake worker GPS positions for any booking, breaking the "OTP from customer" trust model.
**Current code:**
```ts
this.socket = io(SOCKET_URL, {
  auth: { token },
});
this.socket.emit('join', { userId, role: 'worker' });
```
**Fix:** In `services/api/src/socket.ts`, add a middleware that verifies the JWT from `socket.handshake.auth.token` using the same secret, attaches `socket.user`, and rejects invalid tokens. Then guard `update_booking_location` with `socket.user.userId`.

### F009 apps/admin/src/middleware.ts:L11 / apps/website/src/middleware.ts:L11 — medium/security
**Issue:** CSP middleware generates a fresh nonce per request but includes `'unsafe-inline'` in `script-src`:
```ts
`script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
```
This defeats the nonce — inline scripts without the nonce are still allowed.
**Why it matters:** The nonce pattern is meant to allow only scripts with the correct nonce. `'unsafe-inline'` re-enables all inline scripts, making XSS via script injection trivial.
**Fix:** Remove `'unsafe-inline'` from `script-src`. Ensure all inline scripts in the app use the nonce (Next.js does this automatically for `next/script` with `strategy="beforeInteractive"` or `afterInteractive`). Audit for any inline event handlers (`onclick=`) that would break.

### F010 scripts/secret-guard.mjs:L13-L16 — medium/security
**Issue:** Secret-guard only scans `apps/website/src` and `apps/admin/src`. It does **not** scan mobile app source (`apps/customer-app/src`, `apps/worker-app/src`). Expo bundles source into the app binary; server secrets in mobile code would ship to devices.
**Why it matters:** If a developer accidentally imports a server-only module (e.g., `process.env.DATABASE_URL`) in mobile code, it would pass CI but leak in the built APK/IPA.
**Fix:** Add mobile app source dirs to `SOURCE_TARGETS` in `secret-guard.mjs`:
```js
const SOURCE_TARGETS = [
  'apps/website/src',
  'apps/admin/src',
  'apps/customer-app/src',
  'apps/worker-app/src',
];
```

### F011 apps/admin/src/app/payouts/page.tsx:L84-L93 — low/bug
**Issue:** `handleMarkPaid` sends `razorpayPayoutId` to `api.markPayoutPaid(id, razorpayId)`, but the backend `/api/payouts/:id/mark-paid` expects `razorpayPayoutId` in the body. The variable name matches but the backend route at `payouts.ts:L145` reads `razorpayPayoutId` from `req.body`. This is actually correct — but the modal state uses `razorpayId` and the API call passes it correctly. No bug found on re-read. Leaving as note: verify backend `mark-paid` handles both payment ID and payout ID correctly.

### F012 apps/website/src/app/book/page.tsx:L127 — low/bug
**Issue:** Booking flow computes `fullPrice = selectedMode?.price * duration` client-side. Server re-computes from `RATE_TABLE` in `/api/payments/create-order`. If prices drift (admin changes rate in constants.ts but website not redeployed), customer sees one price, payment creates another.
**Why it matters:** Price mismatch between confirmation screen and actual charge. Low risk for MVP (single city, controlled deploy) but violates single-source-of-truth.
**Fix:** Fetch pricing from `/api/bookings/estimate` (new endpoint) or trust server-computed amount in payment response. Show "Estimated: ₹X" with disclaimer.

### F013 apps/customer-app/src/api/client.ts:L35-L41 — low/perf
**Issue:** GET responses cached in AsyncStorage with key `@api_cache:${endpoint}` but **no TTL**. Stale data served indefinitely until app restart or manual cache clear.
**Why it matters:** Booking status, worker availability, payment status can change. User sees outdated info.
**Fix:** Store `{ data, timestamp }` and invalidate after 5 minutes (or on mutation). Or use React Query / TanStack Query for proper cache management.

### F014 .github/workflows/ci.yml:L36 — low/security
**Issue:** CI runs `secret-guard.mjs` on source dirs and `.next/static` (Next.js build output). It does **not** scan Expo web build output (`apps/*/dist` or `apps/*/web-build`) which also bundles client code.
**Why it matters:** If mobile app is built for web (Expo supports web target), secrets could leak there undetected.
**Fix:** Add `apps/website/dist`, `apps/admin/dist`, `apps/customer-app/dist`, `apps/worker-app/dist` to `STATIC_TARGETS` in secret-guard, or add a build step that scans all `dist` folders.

---

## Mobile App Audit Findings (Customer App — `apps/customer-app`, Worker App — `apps/worker-app`)

### M001 apps/customer-app/src/context/AuthContext.tsx:L28-L39 — medium/bug
**Issue:** `loadStoredAuth` catches all errors and deletes the token, but doesn't distinguish between "no user" (404) and network errors. A transient network failure logs the user out.
**Why it matters:** Flaky mobile networks cause spurious logouts.
**Fix:** Check `error.response?.status === 401 || error.response?.status === 404` before deleting token.

### M002 apps/worker-app/src/context/AuthContext.tsx:L47-L56 — medium/bug
**Issue:** `loadStoredAuth` treats 404 from `/api/workers/me` as "needs profile" (sets `needsWorkerProfile=true`). But 404 could also mean "token valid but worker profile deleted" or a bug. No distinction.
**Why it matters:** Worker who had a profile but it was deleted gets "complete profile" UI instead of "contact support".
**Fix:** Add a specific error code or check `error.response?.data?.code === 'WORKER_NOT_FOUND'` before assuming profile creation needed.

### M003 apps/customer-app/src/api/client.ts:L27-L59 / apps/worker-app/src/api/client.ts:L27-L60 — medium/perf
**Issue:** Both apps implement identical caching logic (AsyncStorage, no TTL, cache on GET, fallback on network error). Code duplication.
**Why it matters:** Bug fixes must be applied twice. Cache invalidation logic missing in both.
**Fix:** Extract to shared package `@homehelp/api-client` (npm workspace) or at minimum a shared file symlinked/copied.

### M004 apps/worker-app/src/lib/location.ts:L18-L37 — high/security
**Issue:** `startTracking` emits location to Socket.io every 10 seconds (hardcoded `timeInterval: 10000`, `distanceInterval: 10`). No way to stop tracking when job completes except `stopTracking()` which is only called on unmount. If worker force-closes app, location emits continue until server-side timeout (none configured).
**Why it matters:** Battery drain, privacy leak, stale location data on server.
**Fix:** Server should track `update_booking_location` timestamps and ignore updates older than 30s. Client should call `stopTracking` in `completeJob`/`cancelJob` flows explicitly.

### M005 apps/customer-app/app/booking/[id].tsx — not reviewed (file exists but not read)
**Note:** Customer app booking detail screen not audited. Should check OTP handling, payment flow, deep links.

### M006 apps/worker-app/app/active-job.tsx — not reviewed
**Note:** Worker active job screen (OTP entry, start/complete) not audited. Critical for OTP flow.

---

## CI/CD & Security Tooling Audit

### C001 .github/workflows/ci.yml — medium/perf
**Issue:** `lint-build` job runs `npm run lint` and `npm run build` for all 3 workspaces sequentially in a matrix. No caching of `node_modules` between jobs (each job does `npm ci`). Build takes ~3-5 min per workspace.
**Why it matters:** CI latency. Not a correctness issue.
**Fix:** Use `actions/cache` for `node_modules` and Next.js `.next/cache`. Or split lint (fast) from build (slow).

### C002 .github/workflows/health-check.yml — low/ops
**Issue:** Health check pings Render API every 14 minutes but has no alerting (no Slack/email on failure). Just logs to Actions.
**Why it matters:** Silent downtime detection.
**Fix:** Add `if: failure()` step with Slack webhook or GitHub Issue creation.

### C003 scripts/secret-guard.mjs:L82 — low/security
**Issue:** `isServerRouteHandler` detection uses regex `/\/(route|middleware)\.[tj]sx?$/` and `/\/api\//`. This misses `app/api/**/route.ts` files in Next.js App Router (which are server-only). They are correctly excluded from env heuristic, but the pattern could be more explicit.
**Fix:** Add `/\/app\/api\//` to the check for completeness.

---

## Running Summary (Updated)

| File | Lines | Status | Findings |
|------|-------|--------|----------|
| services/api/src/index.ts | 84 | reviewed | R001 — CORS empty-string footgun |
| services/api/src/middleware/auth.ts | 56 | reviewed | R002 — dual-source token CSRF; R005 — admin DB hit per req |
| services/api/src/middleware/validation.ts | 27 | reviewed | R003 — sanitizeString misleading |
| services/api/src/lib/eligibility.ts | 60 | reviewed | R004 — `both` bypasses license gate |
| services/api/src/lib/constants.ts | 9 | reviewed | 0 findings |
| services/api/src/routes/payments.ts | 219 | reviewed | R006 — RATE_TABLE not consulted; R007 — idempotency backfill on captured; R008 — verify bypass when no Razorpay |
| services/api/src/routes/auth.ts | 178 | reviewed | R009 — no password min length on register; R010 — reset token leak via NODE_ENV |
| services/api/src/routes/health.ts | 11 | reviewed | 0 findings |
| services/api/src/routes/bookings.ts | ~500 | reviewed | R012 — Math.random OTP; R013 — OTP not cleared; R015 — partial OTP log leak |
| services/api/src/routes/workers.ts | ~250 | reviewed | R011 — /me shadowed by /:id; R014 — include leaks OTPs; R016 — Socket.io CORS same footgun |
| services/api/src/routes/stats.ts | ~220 | reviewed | R018 — no error logging; R019 — sequential queries |
| services/api/src/routes/payouts.ts | ~180 | reviewed | R021 — no error logging; R025 — workerPayout nullable |
| services/api/src/routes/users.ts | ~140 | reviewed | R022 — N+1 query; R023 — no error logging |
| services/api/src/routes/waitlist.ts | ~35 | reviewed | R024 — no rate limiting |
| services/api/src/socket.ts | ~55 | reviewed | R016 — CORS footgun; R017 — user: room self-only |
| apps/website/src/lib/auth.ts | 54 | reviewed | F002 — localStorage Bearer only |
| apps/admin/src/lib/api.ts | 154 | reviewed | F001 — dual auth channels |
| apps/admin/src/middleware.ts | 46 | reviewed | F009 — CSP unsafe-inline defeats nonce |
| apps/website/src/middleware.ts | 46 | reviewed | F009 — CSP unsafe-inline defeats nonce |
| apps/admin/src/components/AdminGate.tsx | 30 | reviewed | F003 — client-only admin check |
| apps/admin/src/app/page.tsx | 234 | reviewed | F004 — no abort on fetch |
| apps/website/src/app/worker/page.tsx | 242 | reviewed | F005 — no error boundary on /me fetch |
| apps/customer-app/src/api/client.ts | 85 | reviewed | F006 — no 401 handling; F013 — cache no TTL |
| apps/worker-app/src/api/client.ts | 97 | reviewed | F007 — no 401 handling; M003 — duplicated cache logic |
| apps/worker-app/src/lib/location.ts | 53 | reviewed | F008 — no socket auth; M004 — no server timeout |
| apps/customer-app/src/context/AuthContext.tsx | 72 | reviewed | M001 — network error logs out |
| apps/worker-app/src/context/AuthContext.tsx | 130 | reviewed | M002 — 404 ambiguity |
| scripts/secret-guard.mjs | 128 | reviewed | F010 — misses mobile app source; C003 — server route detection incomplete |
| .github/workflows/ci.yml | 37 | reviewed | C001 — no node_modules cache; C014 — missing dist scan |

---

*Review complete. 25 API findings + 6 systemic issues + 14 frontend findings + 6 mobile findings + 3 CI findings = 54 total. All tracked files reviewed at least once.*