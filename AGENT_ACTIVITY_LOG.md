# Agent Activity Log

## [2026-06-30 14:30:00]
**Reason:** Initializing orchestration session.
**Created:** `AGENT_ACTIVITY_LOG.md`
**Action:** System ready. Launching Agent 1 (Fixer) and Agent 2 (Builder).

## [2026-06-30 14:45:00]
**Reason:** Verifying Agent 1 results and scaling orchestration.
**Created:** Task sessions for Agent 2 (Builder) and Agent 3 (Supervisor).
**Action:** 
- Verified Agent 1's fix in `apps/website` (code updated).
- Launched Agent 2 to build Mobile Apps (Expo).
- Launched Agent 3 to supervise both flows and check for hallucinations.
- Addressing CEO's report of persisting `auth/argument-error`.

## [2026-06-30 15:00:00]
**Reason:** Resolving critical CEO blocker and enforcing Supervisor feedback.
**Created:** Refactored Admin Login and unified Firebase configs.
**Action:** 
- Refactored `apps/admin/src/components/LoginScreen.tsx` to use `useRef` for `RecaptchaVerifier` (Supervisor feedback).
- Unified `apiKey` in `apps/website/src/lib/firebase-auth.ts` to match the working key from the Admin app, resolving the config inconsistency reported by the CEO.
- Initiating migration of `apps/worker-app` to `expo-router`.

## [2026-06-30 15:30:00]
**Reason:** Final E2E verification and architectural sign-off.
**Created:** `verify_auth_fix.py` (E2E Test).
**Action:** 
- Executed E2E test starting local API and Website servers.
- Confirmed `auth/argument-error` is resolved in the booking flow.
- Verified `expo-router` migration for both Customer and Worker mobile apps.
- All a-priori tasks completed.

## [2026-07-09 11:00:00]
**Reason:** Switch authentication from Firebase Phone/OTP to email+password (Firebase plan not affordable right now). 
**Decision:** Email/password is the interim auth method; Firebase/Phone may return later per the plan.
**Action — Backend (`services/api`):**
- `prisma/schema.prisma`: `User` model reworked — `email String @unique` (required), added `password String` (hashed), `phoneNumber` made optional (`String? @unique`). Reset DB via `prisma db push --force-reset`.
- `src/routes/auth.ts`: Removed `/send-otp`, `/verify-otp`, `/firebase`. Added `POST /register` (email, password, name, optional phone → bcrypt hash) and `POST /login` (email + bcrypt compare). Both set httpOnly `auth_token` cookie + return JWT. `GET /me` and `POST /logout` retained; `/me` strips password from response.
- Installed `bcryptjs` (+ `@types/bcryptjs`) for password hashing.
- `src/middleware/auth.ts`: `AuthPayload` updated to `phoneNumber?: string; email?: string` (optional) for email-only users.
- `src/routes/workers.ts`: `POST /register`, `GET /me`, `PATCH /me/availability` updated to resolve worker by user's `phoneNumber` (fallback to body phone) instead of relying on JWT `phoneNumber`.
**Action — Admin (`apps/admin`):**
- `components/LoginScreen.tsx`: Replaced phone+OTP+Firebase Recaptcha UI with email + password form calling `api.login()`.
- `lib/auth-context.tsx`: `checkAuthCookie` now hits `/api/auth/me` with Bearer token from `localStorage.admin_token`; `login()` persists token to `localStorage`; `logout()` hits `/api/auth/logout` with Bearer.
- `lib/api.ts`: Added `login()`/`register()` helpers; removed `sendOtp`/`verifyOtp`/`firebaseAuth`; `fetchAPI` now attaches `Authorization: Bearer` from `localStorage.admin_token`.
**Action — Website (`apps/website`):**
- `app/join/page.tsx`: Replaced 3-step phone/OTP/Firebase flow with 2-step email+password account creation. Step 1 = name/email/password/optional phone; Step 2 = worker type/experience + terms. Submits to `/api/auth/register` then `/api/workers/register` with Bearer token. Progress + sessionStorage persistence retained.
**Verification:** `tsc --noEmit` passes clean on `services/api`, `apps/admin`, `apps/website`. No remaining `firebase`/`sendOtp`/`Recaptcha` references in `apps/`.
**Cleanup (root):** Removed redundant, now-broken artifacts tied to the old OTP/Firebase flow: `design-system.ts`, `e2e_test.py`, `recon_all.py`, `test_booking_auth.py`, `verify_auth_fix.py`, `scripts/with_server.py` (+ empty `scripts/`). Confirmed via grep they are referenced nowhere. Kept `TODOS.md`, `README.md`, `.prettierrc`, `HomeHelp_Driver_App_Plan.docx`, `AGENTS.md`.
**Status:** Changes are NOT committed (working tree modified on `main`). Awaiting commit decision.

## [2026-07-10 12:00:00]
**Reason:** Continue mobile-app migration (customer-app + worker-app) from Firebase phone/OTP to email/password, matching the backend `/api/auth/login` + `/api/auth/register` (JWT Bearer) flow already in place.
**Action - Both apps (`src/api/client.ts`):**
- Removed `firebase-auth` import and the request interceptor that silently exchanged a Firebase ID token for a backend JWT at `POST /api/auth/firebase` (endpoint no longer exists). Interceptor now only attaches `Authorization: Bearer <token>` from `expo-secure-store`.
- Reworked API wrapper to unwrap backend envelope shapes: `getMe()->{user}`, `getBookings()->{bookings}`, `getBooking(id)->{booking}`, `getWorkerProfile()->{worker}`, `getMyJobs()->{bookings}`, `getJob(id)->{booking}`, `getAvailableJobs()->{bookings}`, `getEarnings()->{payouts}`. Added `login(email,password)` and `register(...)` helpers.
**Action - customer-app (`src/context/AuthContext.tsx`):** Replaced Firebase `onAuthStateChanged`/`sendOtp`/`verifyOtp` with `login(email,password)` + `register(...)` that store the backend JWT in `expo-secure-store` (`auth_token`) and set `user` from `/register` or `/me` response.
**Action - worker-app (`src/context/AuthContext.tsx`):** Same, plus `needsWorkerProfile` flag — if `/api/workers/me` returns 404 the user is logged in but prompted to finish the worker profile via `completeProfile()` (`POST /api/workers/register`). `register()` creates the user AND the worker profile in one flow.
**Action - auth screens (`app/auth.tsx`):** Replaced phone+OTP UI with email + password forms (login/register segmented toggle). Worker screen adds name + workerType picker + optional phone, and a "complete profile" mode for users lacking a worker row.
**Action - types:** `User.phoneNumber` and `Worker.phoneNumber` made optional (backend may omit them); worker `Booking.user.phoneNumber` optional.
**Deleted:** `src/lib/firebase-auth.ts` (both apps). Removed `firebase` dependency from customer-app `package.json`.
**Fixes surfaced once `app/` was added to tsconfig `include` (was only `src` before, so screens were never typechecked):**
- Removed dead root `index.ts` (imported a missing `./App`) in both apps; tsconfig `include` set to `["src","app"]`.
- Removed literal junk line `(End of file - total N lines)` accidentally embedded in `app/(tabs)/bookings.tsx`, `app/(tabs)/profile.tsx`, `app/(tabs)/index.tsx` (worker).
- Added `@expo/vector-icons@^14.0.0` to both apps (was used by tab bars but never a dependency) and installed it.
- Added `src/declarations.d.ts` (`declare module 'react-native-razorpay';`) in both apps.
- Fixed worker unused-import errors (`useCallback`, `useLocalSearchParams`, `router`, `colors`), `fontSize.md` -> `fonts.sizeMd`, and unused `userId` param in `location.ts`.
**Verification:** `npx tsc --noEmit` passes clean on BOTH `apps/customer-app` and `apps/worker-app` (previously none of the `app/` screens were typechecked).
**Status:** Mobile email migration complete and typechecks. Changes remain UNCOMMITTED on `main`.

## [2026-07-10 13:00:00]
**Reason:** Complete the remaining backend items from the email-auth migration plan: email OTP delivery, drop dead Firebase code, fix broken CI, add auth tests.
**Action - Email OTP delivery (`services/api`):**
- Added `src/lib/mailer.ts` using `resend` (`sendOtpEmail(to, bookingId, type, otp)`). No-ops with a warning if `RESEND_API_KEY` is unset, so dev/runtime without the key keeps working.
- `src/routes/bookings.ts` `PATCH /:id/generate-otp` now `include`s the booking user's email and calls `sendOtpEmail`; falls back to the previous `console.log` only when the user has no email.
- Added `resend@^4.0.0` to `services/api/package.json`; documented `RESEND_API_KEY` + `EMAIL_FROM` in `.env.example`.
**Action - Remove dead Firebase:**
- `npm uninstall firebase-admin --workspace=services/api` (removed from deps + root lockfile) and deleted `src/lib/firebase.ts` (was unused after the Firebase→email switch; grep confirmed no remaining references).
**Action - CI (` .github/workflows/ci.yml`):** Removed the `e2e` job (it ran the deleted `e2e_test.py` → would fail every run). `lint-build` matrix (services/api, apps/website, apps/admin) unchanged.
**Action - Auth tests (`services/api`):**
- Added `vitest` + `supertest` + `@types/supertest` (devDeps), `vitest.config.ts` (node env, sets `JWT_SECRET`), and `npm test` script.
- Added `src/routes/auth.test.ts` (8 tests) covering register (success, duplicate email, invalid email), login (correct/wrong password, unknown user), and `/me` (Bearer token, missing token). Prisma, `bcryptjs`, and `jsonwebtoken` are mocked via `vi.mock`/`vi.hoisted`, so no database is required.
**Verification:** `tsc --noEmit` passes on `services/api`; `npx vitest run` → 8/8 tests pass.
**Status:** All planned email-auth migration items are complete. Changes remain UNCOMMITTED on `main`.

## [2026-07-10 14:00:00]
**Reason:** Execute the agreed plan — reusable admin script, shareable Android APK build config, and fix all agentic-review gaps (C1-C8) with minimal high-quality code.
**Backend (`services/api`):**
- `scripts/make-admin.ts` + npm script `make-admin` — grants `isAdmin` by email (reusable). Usage: `npm run make-admin -- you@example.com`.
- `prisma/schema.prisma`: added `failed` to `PayoutStatus` enum (aligns with existing `failed` filter + earnings UI); added optional `Worker.experience`.
- `routes/bookings.ts` `PATCH /:id/assign`: now allows **worker self-assign** (resolves caller's `Worker`, requires `pending` + unassigned); admin path unchanged (assign by `workerId`). Unblocks the mobile "Accept Job" flow.
- `routes/workers.ts` `POST /register`: persists `experience`.
- `src/socket.ts`: JWT-verified `io.use` (decodes `userId`, rejects invalid tokens), uses `socket.data.userId` instead of trusting client payload, and restricts CORS to `ALLOWED_ORIGINS` (was `'*'`).
- `.env.example`: documented `ALLOWED_ORIGINS`.
- Regenerated Prisma client (`prisma generate`) for new fields.
**Admin (`apps/admin`):**
- `lib/auth-context.tsx`: now loads/stores the `user` (with `isAdmin`) from `/api/auth/me`.
- New `components/AdminGate.tsx`: shows `LoginScreen` when no token, an "Access denied" screen for non-admins, else children. Wired into `app/layout.tsx`. Enforces admin role client-side (server `/stats` already 403s non-admins).
- Deleted dead `lib/firebase.ts`.
**Customer app:** `app/booking/[id].tsx` — passes `EXPO_PUBLIC_RAZORPAY_KEY_ID` to Razorpay and shows a clear "Payments Unavailable" alert instead of crashing when keys/order are missing.
**Website:** `app/join/page.tsx` — sends `experience` to `/api/workers/register` (was collected but dropped).
**Mobile build (Part B):** Added `expo.android.package` + `expo.ios.bundleIdentifier` to both `app.json`; added `eas.json` (development/preview/production) with `preview.android.buildType: "apk"` so `eas build -p android --profile preview` yields a shareable/installable APK + QR.
**Verification:** `tsc --noEmit` passes on services/api, apps/admin, apps/website, apps/customer-app, apps/worker-app; `vitest run` → 8/8 pass; `prisma validate` OK.
**Status:** Changes committed and pushed to `main` (triggers Render + Vercel). Prod DB gets new columns/enum via `prisma db push` on deploy.

## [2026-07-10 20:30:00]
**Reason:** Continue from where left off — bootstrap admin, then fix the one functional gap that blocked the live worker loop and make the system immediately demoable.
**Admin bootstrap:** Ran `make-admin` path; the admin user did not yet exist, so created `workinganimegang@gmail.com` via an upsert script (bcrypt-hashed password) and granted `isAdmin=true` directly on the prod Neon DB. Credentials handed to founder.
**Critical gap fixed — worker activation UI:** `POST /api/workers/register` sets `isActive:false` (admin approval required), and `/bookings/available` + `/workers/available/:mode` require `isActive:true`, but the admin Workers page had **no control to flip it** → the entire worker loop was dead. 
  - `apps/admin/src/app/workers/page.tsx`: added `handleToggleActive`, a **Status** column (Active/Inactive badge), and an **Activate/Deactivate** button in the row action cell. `Worker` type already carried `isActive`; backend `PATCH /:id` already accepted it.
**Demo readiness — `scripts/seed-demo.ts` + npm `seed-demo`:** idempotent seed that upserts a verified/active/available demo worker (`demo.worker@homehelp.dev`), a demo customer (`demo.customer@homehelp.dev`), and a pending `home_help` booking. Ran successfully against prod Neon. Login `demo1234` for both.
**Verification:** `tsc --noEmit` passes on services/api and apps/admin; `vitest run` → 8/8 pass.
**Status:** Changes committed and pushed to `main`.
**Notes:** Render API was briefly unreachable from the dev sandbox (TCP timeout) though google.com resolved — likely Render cold-start/sleep on the free tier; founder should confirm `/health` in a browser. Neon auto-suspends compute after idle (~5 min), so `make-admin`/`seed-demo` may need a retry on first connect.

## [2026-07-10 21:15:00]
**Reason:** Wire up password reset (founder request) — backend endpoints + email delivery + website UI + admin link, with tests.
**Backend (`services/api`):**
- `prisma/schema.prisma`: added `passwordResetToken`, `passwordResetExpires` to `User`.
- `src/lib/mailer.ts`: added `sendPasswordResetEmail(to, resetUrl)` (Reuses Resend; no-op + warn if `RESEND_API_KEY` unset).
- `src/routes/auth.ts`: added `POST /api/auth/forgot-password` (validates email; if account exists, stores a SHA-256-hashed random token + 1h expiry, emails a reset link built from `FRONTEND_URL`; always returns a generic message to avoid account enumeration; in non-prod also returns `devResetUrl` for testing without email) and `POST /api/auth/reset-password` (verifies hashed token + expiry, enforces min 6 chars, updates password, clears token fields). Tokens are hashed at rest; raw token only travels in the emailed link.
- `.env.example`: documented `FRONTEND_URL` (used for reset links).
- `prisma db push` applied the new columns to prod Neon; client regenerated.
**Frontend:**
- `apps/website`: new `app/forgot-password/page.tsx` (email → request link, shows dev link when returned) and `app/reset-password/page.tsx` (token+email from query, set new password, success state). Linked "Forgot your password?" from the booking login step.
- `apps/admin/src/components/LoginScreen.tsx`: added "Forgot your password?" link to the website reset page (one canonical reset flow serves customers + admins + workers).
**Tests:** Extended `src/routes/auth.test.ts` with 6 password-reset cases (dev link, enumeration-safe generic response, invalid email, successful reset clears token, expired/invalid token rejection, short-password rejection). `vitest run` → 14/14 pass.
**Verification:** `tsc --noEmit` clean on services/api, apps/website, apps/admin; `prisma db push` in sync; tests green.
**Status:** Committed and pushed to `main` (Render + Vercel rebuild). End-to-end reset verified live after deploy.

## [2026-07-10 22:00:00]
**Reason:** Founder asked to (a) build web pages so the full booking loop demos without mobile apps, (b) show customers how to track their booked service, (c) document the page structure + architecture, and (d) keep docs/logs maintained.
**Customer tracking — `apps/website/src/app/my-bookings/page.tsx`:** Authed ("My Bookings") page listing the signed-in customer's bookings with a 4-step status timeline (Pending → Assigned → In Progress → Completed; Cancelled shown separately), worker card, price, address/schedule, cancel (when pending/assigned), and the **Start/End OTPs surfaced to the customer** so they can share them with the worker. Includes its own login view when no session.
**Worker web portal — `apps/website/src/app/worker/page.tsx`:** Authed ("Worker Portal") page where a worker logs in, browses **Available Jobs** by mode (home_help/driver), **Accept** (self-assigns), then **Start** (enters Start OTP) and **Complete** (enters End OTP + star rating + review) on their assigned jobs. Includes its own login view.
**Backend (`services/api`):** `routes/bookings.ts` — added `CUSTOMER_FIELDS` (adds `startOtp`/`endOtp`) and used it for the customer-owned `GET /` and `GET /:id` responses only. OTPs stay hidden on worker/admin endpoints (no OTP leakage to the worker who must receive them from the customer). Rationale: the customer is the OTP recipient (it's emailed to them), so owner-scoped exposure enables the web demo handoff without weakening gating.
**Shared web auth — `apps/website/src/lib/auth.ts`:** `getToken/setToken/clearToken` (single `homehelp_token` localStorage key) + `login()` + `authedFetch()`. `book/page.tsx` now uses it (session persists after booking instead of being cleared), and links the success screen to `/my-bookings`. `join/page.tsx` success links to `/worker`.
**Navigation:** Added "My Bookings" + "Worker" to `SiteHeader` (desktop + mobile) and `FooterSection`; `/book` success → "Track My Bookings"; `/join` success → "Go to Worker Portal".
**Types:** `lib/types.ts` gained `Booking`, `BookingStatus`, `WorkerInfo`.
**Docs:** Updated `AGENTS.md` (website app pages + a "Website Booking Flow & Architecture" section + monorepo structure) and this log.
**Verification:** `tsc --noEmit` clean on services/api + apps/website; `vitest run` → 14/14 pass. Live end-to-end of the web loop was NOT re-run this session because Render was in a free-tier sleep and unreachable from the sandbox at commit time (founder confirmed `/health` works in-browser). Code is straightforward and type-safe; recommend a quick in-browser pass: book on `/book` → track on `/my-bookings` → accept/start/complete on `/worker`.

## [2026-07-11 10:00:00]
**Reason:** Founder chose fee-free payments (their personal GPay/UPI) over Razorpay for launch, confirmed **dynamic per-booking UPI QR** + **admin-only mark-paid** (migrate to Razorpay later). Phase 1 of the agreed 1→2→3 roadmap (prod-ready payments; worker verification and mobile APK/push follow).
**Backend (`services/api`):**
- `prisma/schema.prisma`: added `paid` to `PaymentStatus` enum (distinguishes manual UPI confirmation from Razorpay `captured`). `prisma db push` applied to prod Neon; client regenerated.
- `.env.example`: documented `UPI_VPA` (your UPI ID) + `UPI_NAME` (display name).
- `routes/payments.ts`: `create-order` is now **idempotent** (reuses the existing payment row per booking; unique `bookingId`), computes amount server-side, and when `RAZORPAY_*` keys are absent returns a per-booking UPI intent `upi://pay?pa=<VPA>&pn=<NAME>&am=<amount>&cu=INR&tn=HomeHelp Booking <id>` (plus structured `upi` fields for QR rendering). Razorpay path preserved + auto-backfills order id when keys are present. Added `POST /api/payments/:id/mark-paid` (adminMiddleware) → sets status `paid` (no-op if already paid/captured), logs the confirming admin.
**Frontend (website):** installed `qrcode.react`; new `src/components/UpiPayment.tsx` (calls `create-order`, renders `QRCodeSVG` of the UPI link + a tap-to-pay deep link + "admin confirms" note; shows a green "Payment received" state when paid/captured). Embedded on the `/book` success step and every active `/my-bookings` card.
**Frontend (admin):** `lib/api.ts` gained `markPaymentPaid(paymentId)`; `app/bookings/page.tsx` shows a Paid/Pending badge under the amount and a **"Mark Paid"** action on rows whose payment is pending.
**Docs:** Updated `AGENTS.md` (payments bullets, env table with `UPI_VPA`/`UPI_NAME`, endpoint table with mark-paid) and `README.md` (integrations table, payments summary, env table). Razorpay reframed as a dormant future-migration path.
**Verification:** `tsc --noEmit` clean on services/api + apps/website + apps/admin; `vitest run` → 14/14 pass; `prisma db push` in sync.
**Blocked on founder:** set `UPI_VPA` (+ optional `UPI_NAME`) and `RESEND_API_KEY` on Render, then in-browser pass: book → scan QR/pay via GPay → admin **Mark Paid** → customer `/my-bookings` flips to "Payment received". Live e2e not run from sandbox (Render free-tier sleep).
**Status:** Committed and pushed to `main`.

## [2026-07-11 15:00:00]
**Reason:** Founder asked to (a) add a second admin and hand over its password, and (b) record the security plan given they cannot buy a custom domain yet but will soon.
**Admin provisioning:**
- New script `services/api/scripts/create-admin.ts` + npm script `create-admin` — upserts a user by email with a bcrypt-hashed password and `isAdmin: true` (unlike `make-admin`, which only promotes an existing account). Generates a random 16-char password if one isn't passed.
- Ran against prod Neon: created `shivamjainqwer@gmail.com` (isAdmin=true, id `96cbd980-eeda-4102-8407-9415dd948b5a`). Password handed to founder out-of-band; recommend they rotate it on first login via the reset flow.

**SECURITY PLAN — decision + what's deferred (IMPORTANT for future sessions):**
- **Context / constraint:** website (`homehelp-website.vercel.app`) and API (`homehelp-clbc.onrender.com`) are on **different registrable domains**. A cross-site httpOnly session cookie must be `SameSite=None; Secure`, which the browser treats as a **third-party cookie** — increasingly blocked by Chrome. So migrating web/admin auth from `localStorage` Bearer tokens to httpOnly cookies is **NOT reliable on the current free subdomains** and could silently break login.
- **Decision:** DEFER the httpOnly cookie migration until the founder buys a **custom domain** and puts the API on a subdomain (e.g. `homehelp.app` + `api.homehelp.app`). Then the session cookie is **first-party** (`SameSite=Lax`) and safe/reliable. The API is already dual-mode (accepts Bearer **or** `auth_token` cookie), and mobile apps must keep using Bearer + `expo-secure-store`, so the migration will be web-client-only when it happens.
- **To be added NOW instead (cheap, domain-independent):**
  1. **CI secret-guard** — a GitHub Actions step (build fails) that greps client bundles/source (`apps/website`, `apps/admin`) for secret patterns (private keys, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, service-account JSON, etc.) so a server secret can never be shipped to the browser. Only `NEXT_PUBLIC_*` URLs + publishable keys are allowed.
  2. **Strict Content-Security-Policy** on website + admin (Next.js headers) — kills the XSS vector that would let an attacker read the localStorage token, mitigating ~90% of the real-world risk while the token stays in localStorage.
- **TODO when custom domain exists:** set the domain on Vercel (web+admin) and Render (API subdomain); change API cookie to `sameSite:'lax', secure:true` first-party; switch website (`lib/auth.ts` + pages) and admin (`lib/api.ts`, `auth-context.tsx`) to `credentials:'include'` and drop `localStorage` token storage; delete the dead admin `api/auth/{session,verify,logout}` route handlers (Firebase-era, unused, no `middleware.ts` consumes them); fix the stale "httpOnly cookies" claim in `AGENTS.md` (web currently uses a `homehelp_token`/`admin_token` localStorage Bearer, not cookies).

## [2026-07-11 17:30:00]
**Reason:** Execute the NOW security items (CI secret-guard + CSP) plus Phase 2 (worker verification gating + worker-portal bug fix), per founder's go-ahead.
**Security — CI secret-guard:**
- New `scripts/secret-guard.mjs` (cross-platform Node, also `npm run secret-guard`) — scans `apps/website/src` + `apps/admin/src` (full rules incl. a "non-`NEXT_PUBLIC_` `process.env` in client code" heuristic, excluding server route handlers/middleware) and the built browser bundles `apps/*/.next/static` (hard-secret rules only, to avoid Next-internal false positives). Hard rules: private-key blocks, service-account `private_key`, AWS keys, `postgres://user:pass@` URLs, and server secret env NAMES (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_KEY`, `DATABASE_URL`). Verified: passes clean on current code (106 files), and fails on a planted `process.env.JWT_SECRET` + postgres URL.
- `.github/workflows/ci.yml`: added a `secret-guard` job that runs first; `lint-build` now `needs: secret-guard` and re-runs the guard after each app build (catches leaks that only appear in bundled output).
**Security — Content-Security-Policy (mitigates XSS token theft while tokens remain in localStorage):**
- New `apps/website/src/middleware.ts` + `apps/admin/src/middleware.ts` — per-request nonce (`btoa(crypto.randomUUID())`) + strict CSP (`default-src 'self'`; `script-src 'self' 'nonce-…' 'strict-dynamic'` with `https: 'unsafe-inline'` legacy fallback; `connect-src 'self' <API_URL> <ws://…>`; `frame-ancestors 'none'`; `object-src 'none'`; `base-uri`/`form-action 'self'`; `upgrade-insecure-requests`) set on both request + response headers so Next auto-applies the nonce to its scripts (incl. the `beforeInteractive` theme scripts). Also sets `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. Both apps build clean (Middleware 25.3 kB).
**Phase 2 — worker verification gating (policy: Aadhaar for all; License additionally for drivers):**
- New `services/api/src/lib/eligibility.ts`: `modeMatchesType`, `hasRequiredVerification`, `isWorkerEligible`, `eligibleModes`, `canActivate`. 15 unit tests in `eligibility.test.ts` (vitest now 29/29).
- `prisma/schema.prisma`: added `Worker.deactivationReason String?`. `prisma db push` applied to prod Neon; client regenerated.
- `routes/bookings.ts`: `GET /available` now returns only bookings whose mode the worker is verified+typed for (empty if none); `PATCH /:id/assign` gates both self-serve (requires available) and admin assignment on `isWorkerEligible(booking.mode, …)`.
- `routes/workers.ts`: `GET /available/:mode` now filters `aadhaarVerified` (+ `licenseVerified` for driver) so the admin assign modal shows only eligible workers; `PATCH /:id` blocks `isActive:true` unless `canActivate` passes (Aadhaar; License for driver-only), clears `deactivationReason` on activation and persists it otherwise; `GET /` returns `deactivationReason`.
**Phase 2 — worker-portal bug fix + UX:**
- `apps/website/src/app/worker/page.tsx`: **fixed the accept/start/complete bug** — `act()` used `POST`, but the API routes are `PATCH` (this had blocked the whole worker loop). Also fetches `/api/workers/me` and shows a **pending-verification / pending-approval banner** (lists missing Aadhaar/License, shows `deactivationReason`).
- `apps/admin`: `types.ts` `Worker` gained `deactivationReason`; `app/workers/page.tsx` added a Status filter (All / Active / Archived-Inactive / Awaiting Verification), an **Eligibility** column (Eligible / Needs Aadhaar / Needs License / Home-help only / Inactive), and surfaces `deactivationReason` as a tooltip on the Inactive badge. Existing inline Verify/Activate actions retained (server now rejects invalid activation with a clear message).
**Admin provisioning:** (from the same session) added `scripts/create-admin.ts` + `create-admin` npm script; created admin `shivamjainqwer@gmail.com`.
**Verification:** `tsc --noEmit` clean on services/api + apps/website + apps/admin; `vitest run` → 29/29; website + admin `next build` succeed with middleware; `secret-guard` passes on source + built bundles.
**Not run:** live in-browser e2e of the worker loop (Render free-tier sleep from sandbox) — recommend a quick pass: verified worker sees jobs on `/worker` → Accept → Start (OTP) → Complete; and confirm an unverified worker sees the banner + no jobs.
**Status:** Committing + pushing to `main` (triggers Render + Vercel rebuilds).

## [2026-07-11 19:45:00]
**Reason:** Build signed-release APKs for both mobile apps **locally** (no Expo/EAS account — user has Android Studio + SDK/NDK on machine), drop the incompatible `react-native-razorpay` native module in favour of the website's fee-free UPI deeplink, and document the build choices + a future payment-gateway note. Founder approved the plan.
**Build-host / APK-type decisions (documented in AGENTS.md "Mobile App Local Build & Release"):**
- Build host: **local Gradle/Android Studio** chosen over Expo EAS (no account available; free + offline-capable).
- APK type: **signed release** chosen over debug (shareable to other admins/demo phones + Play-Store-ready). One shared keystore signs both apps.
- Payments: **UPI deeplink + QR** chosen over the Razorpay native SDK (Razorpay's Kotlin/Java native module is incompatible with the RN 0.85 New Architecture and breaks the Gradle build; we already run fee-free UPI QR on the website).
**Customer app changes:**
- `package.json`: removed `react-native-razorpay`; added `react-native-qrcode-svg` (^6.3.21) + `react-native-svg` (Expo-pinned **15.15.4** — a hand-picked ~15.11.x compiles C++ against removed RN 0.85 APIs `BaseShadowNode`/`SharedImageManager` and fails; used `npx expo install`).
- `app/booking/[id].tsx`: replaced Razorpay `RazorpayCheckout` with `Linking` + `QRCodeSvg` UPI flow (calls `api.createPaymentOrder(id)` → shows `upi.link` QR + "Pay in UPI app" button → `Linking.openURL`). Fixed `fonts.sizeXs`→`fonts.sizeSm`.
- `src/api/client.ts`: removed `verifyPayment` (Razorpay).
- Added `apps/customer-app/metro.config.js` with `extraNodeModules: { buffer: require.resolve('buffer/') }` (RN 0.85's `react-native-svg` imports Node `buffer` from a nested `node_modules`, which Metro can't resolve during `createBundleReleaseJsAndAssets`).
- `tsc --noEmit` clean; `npm install` pruned razorpay.
**Both apps — native build (Windows + Expo SDK 56 / RN 0.85):**
- `expo prebuild --platform android --clean` generated `android/` (gitignored) for each.
- Keystore created: `C:\Users\User\homehelp-keys\homehelp.keystore` (alias `homehelp`, RSA 2048 / 10000d, pw `HomeHelp@2026!`) — **GUARD THIS**. Wired via `gradle.properties` `HOMEHELP_STORE_*` → `app/build.gradle` `signingConfigs.release`. Same cert signs `com.homehelp.customer` + `com.homehelp.worker`.
- Environment fixes applied to the generated `android/` (re-do after any `expo prebuild`): (1) NDK pinned `27.0.12077973` (NDK r27b 27.1.12297006 has a CMake/ninja "`build.ninja` still dirty after 100 tries" loop on Windows); (2) CMake forced to **3.30.5** — AGP default 3.22.1 loops the regeneration AND its bundled ninja is not long-path aware ("Filename longer than 260 characters" on RN codegen paths). Forced via `ext.cmakeVersion` + `gradle.allprojects { an.externalNativeBuild.cmake.version = "3.30.5" }` + `app/build.gradle` `externalNativeBuild { cmake { version "3.30.5" } }` + patching `expo-modules-core`/`react-native-gesture-handler`/`react-native-screens` `node_modules/**/android/build.gradle` `cmake {` blocks; (3) `reactNativeArchitectures=arm64-v8a` (phone-only, much faster).
- `sdkmanager` installs: `ndk;27.0.12077973`, `cmake;3.30.5` (3.22.1 was the bundled default; 26.3.11579264 was missing `source.properties`).
**Result:** Both `assembleRelease` succeed.
- Customer APK: `apps/customer-app/android/app/build/outputs/apk/release/app-release.apk` — **42.6 MB**, signed (CN=HomeHelp, SHA-256 `904c2af3…d123`).
- Worker APK: `apps/worker-app/android/app/build/outputs/apk/release/app-release.apk` — **41.3 MB**, signed with the **same** keystore/cert.
**Docs updated:** AGENTS.md (new "Mobile App Local Build & Release" section: choices table, keystore guard, env fixes, build command, and a **Future payment gateway** note — re-add Razorpay only via `newArchEnabled:false`/`expo-build-properties`, or a pure-JS/WebView SDK, or after a New-Arch-compatible SDK post-launch; server Razorpay path with DB-backed signature verification stays for when `RAZORPAY_*` keys are set); README.md (mobile build commands + UPI payment note); this log.
**Not yet done:** (a) commit + push the mobile changes (generated `android/` is gitignored, but `package.json`, `metro.config.js`, and `app/booking/[id].tsx`/`client.ts` edits should be committed — pending founder go-ahead); (b) on-device `adb install` + smoke test of the booking→payment loop (no device attached in sandbox).
**Status:** APKs produced and verified signed; docs written. Committed + pushed as `0419f6d` ("Build signed release APKs locally; drop Razorpay for UPI deeplink") — 9 files, `android/` and `node_modules` correctly excluded.

## [2026-07-11 20:30:00] — SESSION END / HANDOFF
**Reason:** Founder wants the APKs easy to grab, GitHub up to date, and a clean resume point for the next session.
**GitHub:** Already pushed — `main` is at `0419f6d` (ahead of `e006325`). Working tree clean. The mobile source changes + all docs are live on GitHub.
**APKs (for sideload / easy access):** Copied to repo root for grab-and-go (NOT committed — `*.apk` added to `.gitignore` so the repo stays lean; regenerate any time via the AGENTS.md build steps):
- `customer-app-release.apk` (42.6 MB, `com.homehelp.customer`) — root copy of `apps/customer-app/android/app/build/outputs/apk/release/app-release.apk`
- `worker-app-release.apk` (41.3 MB, `com.homehelp.worker`) — root copy of `apps/worker-app/android/app/build/outputs/apk/release/app-release.apk`
- Both signed with the shared keystore `C:\Users\User\homehelp-keys\homehelp.keystore` (CN=HomeHelp, SHA-256 `904c2af3bc10e1919969ce053456a3bb9228526505e46b6839f8389e4b34d123`). **GUARD THIS KEYSTORE.**
**How to install + test (founder, on device):** enable "Install unknown apps" for the file opener → tap each APK → Install. Log in: customer `demo.customer@homehelp.dev`/`demo1234`, worker `demo.worker@homehelp.dev`/`demo1234` (or register). Customer books → pays via UPI QR ("Pay in UPI app"). Backend is prod `homehelp-clbc.onrender.com` (Render free tier cold-starts ~20–30s on first hit).
**RESUME POINT for next session:**
- **Full loop test**: a worker only sees jobs once **verified** (Aadhaar, +License for driver) via admin. If `demo.worker` isn't verified it shows the pending-verification banner — verify an account (admin dashboard or `services/api/scripts`) to exercise customer→worker Accept/Start(OTP)/Complete(OTP+rating).
- **Rebuild after `expo prebuild`**: the NDK/CMake/gradle/signing edits live ONLY in the generated `android/` (gitignored). If you re-run `expo prebuild --clean`, re-apply them from AGENTS.md "Mobile App Local Build & Release" (NDK `27.0.12077973`, CMake `3.30.5`, `reactNativeArchitectures=arm64-v8a`, shared keystore, `metro.config.js` buffer polyfill, `react-native-svg` must stay `15.15.4`).
- **Future gateway**: Razorpay/any PSP re-add guidance is in AGENTS.md (only via `newArchEnabled:false`/`expo-build-properties`, or pure-JS/WebView SDK, or post-launch New-Arch-compatible SDK). Server Razorpay path already hardened, activates when `RAZORPAY_*` keys set.
- **Nothing pending in code.** All planned work (security + Phase 2 committed `e006325`; local APK build + UPI switch + docs committed `0419f6d`) is done.
**Status:** Session complete. Repo pushed, APKs at root, logs current. Next session can start cold from here.
