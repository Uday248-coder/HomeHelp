# HomeHelp

On-demand platform with two booking modes: **home help** (cleaners, domestic workers) and **driver booking** (someone to drive your own car). Full-stack model — we hire, train, verify, and manage workers ourselves. Launching as a single-city MVP (Kolkata).

---

## Live URLs

| App | URL | Status |
|-----|-----|--------|
| Marketing Website | [homehelp-website.vercel.app](https://homehelp-website.vercel.app) | **Live** — booking flow, customer tracking, worker portal, waitlist + worker registration |
| Admin Dashboard | [homehelp-admin.vercel.app](https://homehelp-admin.vercel.app) | **Live** — email/password login, dashboard, bookings/workers/payouts management |
| Backend API | [homehelp-clbc.onrender.com](https://homehelp-clbc.onrender.com) | **Live** — full CRUD, auth, payments, stats |
| GitHub Repo | [github.com/Uday248-coder/HomeHelp](https://github.com/Uday248-coder/HomeHelp) | Private |

---

## Connected Services

| Service | Purpose | Status | Key Set On Render? |
|---------|---------|--------|-------------------|
| **Vercel** | Hosts website + admin dashboard | ✅ **Live & auto-deploying** from `main` branch | N/A |
| **Render** | Hosts backend API | ✅ **Live & auto-deploying** from `main` branch | N/A |
| **GitHub** | Source control + CI/CD via Actions | ✅ **Connected** — push to `main` triggers build + deploy | N/A |
| **Neon Postgres** | Database (serverless PostgreSQL) | ✅ **Connected** — Prisma ORM running migrations | ✅ `DATABASE_URL` |
| **Upstash Redis** | OTP storage + rate limiting cache | ✅ **Connected** — serverless Redis SDK | ✅ `UPSTASH_REDIS_REST_URL` + `TOKEN` |
| **Prisma** | ORM for database access | ✅ **Connected** — 6 models, full migrations | N/A |
| **UPI (fee-free)** | Payment collection via per-booking UPI QR, admin-confirmed | ✅ **Default** — needs your UPI ID (`UPI_VPA`); no gateway fees | ❌ `UPI_VPA` not set |
| **Razorpay** | Payment processing (future migration) | ⚠️ **Dormant** — only used when `RAZORPAY_*` keys are set, otherwise UPI QR is used | ❌ `RAZORPAY_KEY_ID` + `SECRET` not set |
| **Sentry** | Error tracking | 🔌 **Wired in code** — initialized but DSN is empty, no errors being captured | ❌ `SENTRY_DSN` not set |
| **Firebase Auth** | Phone OTP + Google Sign-In | ❌ **Removed** — migrated to email/password auth (see below) | ❌ N/A |
| **Resend** | Transactional email (password reset + booking OTP) | ⚠️ **Wired in code** — needs `RESEND_API_KEY` to actually send | ❌ `RESEND_API_KEY` not set |
| **Google Maps** | Address autocomplete, geocoding, ETA | ❌ **Not connected** — no API key set | ❌ No env vars set |
| **Firebase (FCM)** | Push notifications for mobile apps | ❌ **Not connected** — no server key set | ❌ No env vars set |
| **Socket.io** | Real-time location tracking | ✅ **Implemented** — basic worker location tracking via Socket.io | N/A |

---

## What's Done

### Backend API (`services/api/`)
- **Auth**: Email + password register/login with bcrypt hashing, JWT (Bearer or `httpOnly` cookie), `/logout`, `/forgot-password` + `/reset-password` (hashed token + 1h expiry), shared `JWT_SECRET`. Global + auth rate limiting.
- **Admin roles**: `adminMiddleware` reusable guard, `isAdmin` field on User model, admin-gated endpoints
- **Booking CRUD**: Create, list, detail, cancel, assign worker, start (OTP-gated), complete (OTP+rating), generate OTP — all working with proper null-safety checks
- **Workers**: CRUD with auth-gated POST/PATCH, availability filter by mode, worker self-service endpoints (`/me`, `/me/availability`)
- **Payments**: Fee-free UPI QR by default — `create-order` returns a per-booking `upi://pay` intent (amount from server `RATE_TABLE`, 15% platform fee tracked), admin confirms via `POST /api/payments/:id/mark-paid`; Razorpay path retained (signature verify) for a later migration when keys are set
- **Payouts**: Full payouts route (`GET /api/payouts` paginated admin, `GET /:id`, `GET /me` for workers)
- **Stats**: Dashboard stats + weekly revenue, admin-only
- **Waitlist**: DB-persisted signups via Prisma
- **Health check**: `GET /health` with status, timestamp, version
- **Security**: `helmet`, CORS whitelist, phone validation, JSON 404 handler, conditional Sentry init, mock Redis fallback when env vars missing

### Admin Dashboard (`apps/admin/`)
- **Dark sidebar** with navigation (Dashboard, Bookings, Workers, Payouts, Settings)
- **Dark mode toggle** — persisted to localStorage, `.dark` class on `<html>` with flash prevention
- **Dashboard** — 6 stat cards, weekly revenue bar chart, booking status donut chart, recent bookings table, error boundary, loading skeletons
- **Bookings** — search, status filter, paginated table, Assign Worker modal, Generate Start/End OTP, Cancel, loading/empty/error states
- **Workers** — search, type filter, availability toggle, Aadhaar/License Verify, rating stars
- **Payouts** — table with status badges, loading skeleton, proper API integration
- **Settings** — dark mode, sign out, API URL display
- **Login** — email + password with spinners, validation, and "Forgot your password?" link
- **Theme** — HSL CSS variables, light + dark mode, all components use `bg-card`/`text-foreground`/`text-muted-foreground` etc.
- **API client** — centralized `api.ts` with auto auth injection, 401 auto-logout, retry logic, AbortController, generic `get/post/patch` methods
- **Components** — Modal (Escape key, backdrop blur, scroll lock), ErrorBoundary, Skeleton variants, Badge, Button, Card, Input

### Marketing Website (`apps/website/`)
- **Booking flow** (`/book`) — 4-step wizard: mode selection (Home Help / Driver), service details with type/address/schedule/duration/price, email/password auth, confirmation with booking creation; links to `/my-bookings`
- **Customer tracking** (`/my-bookings`) — signed-in customer's bookings with a 4-step status timeline, worker card, cancel, and Start/End OTPs to share with the worker
- **Worker portal** (`/worker`) — browse available jobs by mode, accept (self-assign), start (Start OTP), complete (End OTP + rating)
- **Hero** — "Now Live in Kolkata", trust indicators, CTAs linked to `/book`
- **Services** — Feature cards for both modes
- **Pricing** — 3 cards (Home Help ₹199/hr, Driver ₹149/hr, Subscription ₹499/mo) with links to `/book`
- **Testimonials** — 3 user cards with star ratings
- **Worker registration** (`/join`) — 2-step email + password form with name/email/phone/type/experience; success links to `/worker`
- **Waitlist** — Email signup proxied to backend API
- **FAQ** — 6-item accordion with smooth animations
- **UI** — Sticky header, backdrop blur, custom animations (fadeInUp, slideUp, scaleIn), responsive design

### Mobile Apps (Premium Design)
- **Design System**: Implemented a unified brand identity using Deep Pine (#1A3C34) and Warm Clay (#C4774B) with a Warm Off-white background.
- **UI Polish**: High-end look with generous border-radius (up to 32px), soft shadows, and refined typography, removing all cartoonish elements for a professional feel.

#### Customer App (`apps/customer-app/`) — Expo/React Native
- **Auth** — Email + password login with `expo-secure-store` token persistence
- **Home** — Mode switcher toggle (Home Help / Driver), service type chips, duration picker, schedule (now/later), price estimate, instant booking
- **Bookings** — FlatList of past bookings with color-coded status badges, pull-to-refresh, empty state
- **Booking Detail** — Full info, cancel pending bookings, star rating for completed, **pay via UPI deeplink + QR** (`react-native-razorpay` removed — reuses the website's fee-free UPI flow)
- **Profile** — Account info, logout with confirmation
- **Navigation** — Conditional stack (Auth vs Main), bottom tabs (Home, Bookings, Profile)

#### Worker App (`apps/worker-app/`) — Expo/React Native
- **Auth** — Email + password login with `expo-secure-store` token persistence
- **Dashboard** — Large availability toggle, stats cards (Total Jobs, Rating, Earnings), "Find Jobs" button
- **Jobs** — FlatList of available bookings with Accept Job button, pull-to-refresh
- **Active Job** — Start/Complete with OTP modal + rating, status-dependent actions
- **Earnings** — Weekly/monthly summary, payout history list with status badges
- **Profile** — Avatar, verification status (Aadhaar/License), rating, total jobs, logout
- **Navigation** — 5-tab layout (Dashboard, Jobs, Active Job, Earnings, Profile)

### Infrastructure
- **CI/CD** — GitHub Actions matrix build (api, website, admin), Render auto-deploy (API), Vercel auto-deploy (website + admin)
- **Database** — Neon Postgres via Prisma ORM, 6 tables with proper indexes and relations
- **Cache** — Upstash Redis for rate limiting (booking OTPs are now emailed via Resend)
- **Error tracking** — Sentry wired (DSN not set yet)

### Bugs Fixed (Critical)
- `getId()` infinite recursion in bookings.ts (was crashing every booking route)
- OTP null bypass in start/complete (could start without OTP)
- No admin guards on assign/generate-otp/payment-capture
- Booking OTP returned in response body (now only logged)
- Race condition on user creation (findUnique+create → upsert)
- Rate-limit TTL extending indefinitely
- Admin dashboard: missing `clsx`/`tailwind-merge` deps, `api.get()` not existing, no auth guard on dashboard page, missing Skeleton import, wrong payouts endpoint
- Website: worker registration OTP flow broken, waitlist GET leaking all emails, success shown on network error, missing CSS animations
- Dark mode flash, hardcoded theme colors, `@homehelp/ui` non-existent package

---

## How It's Built

### Architecture
```
User → Website/Admin (Next.js) → API (Express) → Prisma → PostgreSQL
                                                    ↓
                                              Upstash Redis (OTP)
                                                    ↓
                                              Razorpay (payments)
```

### Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Backend runtime | Node.js + Express + TypeScript | ✅ Live |
| Database | Neon Postgres (serverless) | ✅ Live |
| ORM | Prisma 6 | ✅ Live |
| OTP/Cache | Upstash Redis | ✅ Live |
| Auth | Email + password (bcrypt) + JWT (Bearer or httpOnly cookie), 7-day expiry | ✅ Live |
| Payments | Razorpay with auto-mock fallback | ✅ Live (stubbed) |
| Web framework | Next.js 14 App Router (website + admin) | ✅ Live on Vercel |
| Styling | Tailwind CSS 3.4 with HSL variables | ✅ Live |
| Mobile (customer) | React Native + Expo | ✅ Coded in `apps/customer-app/`, needs `npx expo start` to run |
| Mobile (worker) | React Native + Expo | ✅ Coded in `apps/worker-app/`, needs `npx expo start` to run |
| Deploy (API) | Render (Node.js) | ✅ Auto-deploy from `main` branch |
| Deploy (website) | Vercel (project: `homehelp-website`) | ✅ Auto-deploy from `main` branch |
| Deploy (admin) | Vercel (project: `homehelp-admin`) | ✅ Auto-deploy from `main` branch |
| CI/CD | GitHub Actions | ✅ Matrix build across all 3 workspaces |
| Error tracking | Sentry (`@sentry/node`) | 🔌 Wired in Express middleware, DSN env var not set |

---

## What's Left

### Phase 0 — Production Readiness (1-2 days)
- [ ] **Set Sentry DSN** in Render/Vercel env vars for error monitoring
- [ ] **Razorpay live keys** — currently using mock order IDs, need real key_id + key_secret in env vars
- [ ] **Google Maps API key** — for address autocomplete + tracking in booking flow
- [ ] **Mobile app env vars** — set `EXPO_PUBLIC_API_URL` for both mobile apps

### Phase 1 — Mobile Launch (2+ weeks)
- [ ] **Customer App** — test on device/emulator, build with EAS, deploy to TestFlight/Play Store internal track
- [ ] **Worker App** — test on device/emulator, build with EAS, deploy to TestFlight/Play Store internal track
- [x] **Real-time location tracking** via Socket.io for worker arrival
- [ ] **Push notifications** via FCM (Expo Notifications) for booking updates

### Phase 2 — Platform Features (1-2 weeks)
- [ ] **Aadhaar verification flow** for workers (OCR + API verification)
- [ ] **Admin worker review/approval** panel with document upload
- [ ] **Weekly payout automation** — cron job to calculate and process worker payouts
- [ ] **Surge pricing engine** — demand-based pricing adjustments
- [ ] **Mode-aware pricing calculator** — dynamic rate based on distance, time, demand
- [ ] **Booking editing** — allow customers to modify address/schedule before assignment

### Phase 3 — Driver Mode (2+ weeks)
- [ ] **License verification** — OCR + database verification for driver licenses
- [ ] **Outstation booking flow** — 4hr minimum, distance-based pricing, driver accommodation
- [ ] **Car insurance verification** — upload + verify insurance documents

### Phase 4 — Scale (1 month+)
- [ ] **Multi-city launch** — city selection, density analysis, worker onboarding per city
- [ ] **Subscription plans** — monthly subscription with priority booking + discounted rates
- [ ] **Referral program** — customer + worker referral incentives
- [ ] **Customer support dashboard** — ticket system for dispute resolution

### Tech Integrations Needed

| Integration | What for | Status |
|-------------|----------|--------|
| **Firebase Auth** | Phone OTP + Google Sign-In | ❌ **Removed** — migrated to email/password |
| **Razorpay live** | Real payment processing (currently mock) | ❌ Not connected |
| **Google Maps API** | Address autocomplete, geocoding, ETA, tracking | ❌ Not connected |
| **Sentry DSN** | Error tracking and monitoring | 🔌 Wired, no key |
| **Firebase Cloud Messaging** | Push notifications to mobile apps | ❌ Not connected |
| **Socket.io** | Real-time location tracking + live booking updates | ✅ Implemented (basic location tracking) |
| **Digilocker / Aadhaar API** | Worker identity verification | ❌ Not connected |
| **SARATHI / Parivahan API** | Driver license verification | ❌ Not connected |

---

## Running Locally

```bash
git clone https://github.com/Uday248-coder/HomeHelp.git
cd HomeHelp
npm install

# Set up env vars
cp services/api/.env.example services/api/.env
# Fill in DATABASE_URL, UPSTASH_* , JWT_SECRET

# Sync database schema
cd services/api
npx prisma db push

# Start dev servers
npm run dev:api       # Backend on :3001
npm run dev:website   # Website on :3000
npm run dev:admin     # Admin on :3002

# Mobile apps (dev)
cd apps/customer-app && npx expo start
cd apps/worker-app   && npx expo start

# Mobile apps (local signed release APK — no Expo/EAS account needed)
# See AGENTS.md "Mobile App Local Build & Release" for the full NDK/CMake/gradle fixes.
cd apps/customer-app && npx expo prebuild --platform android --clean && cd android && ./gradlew.bat assembleRelease --no-daemon
cd apps/worker-app   && npx expo prebuild --platform android --clean && cd android && ./gradlew.bat assembleRelease --no-daemon
# APKs: android/app/build/outputs/apk/release/app-release.apk (both signed with C:\Users\User\homehelp-keys\homehelp.keystore)
```

---

## Authentication — Email/Password (current)

Auth migrated away from Firebase Phone OTP to **email + password** (Firebase was cost-prohibitive for the MVP). Flow:
- `POST /api/auth/register` (email, password → bcrypt) and `POST /api/auth/login` return a JWT. Web + admin store it in `localStorage` and send it as `Authorization: Bearer` (httpOnly-cookie migration is deferred until a custom domain exists — see `AGENTS.md` Security Posture). Mobile apps use the same Bearer token in `expo-secure-store`.
- `POST /api/auth/forgot-password` stores a SHA-256-hashed reset token + 1h expiry and emails a link from `FRONTEND_URL`; `POST /api/auth/reset-password` verifies it.
- Booking start/end OTPs are generated by an admin (`PATCH /api/bookings/:id/generate-otp`) and emailed to the customer via **Resend**; in dev (`NODE_ENV !== production`) the reset/OTP links are also returned in the API response for testing.

### Resend (transactional email) setup
1. Create a Resend account → generate an API key.
2. Set `RESEND_API_KEY` and `EMAIL_FROM` on Render (see `services/api/.env.example`).
3. Set `FRONTEND_URL` to the website origin used in reset links (defaults to `https://homehelp-website.vercel.app`).

Until `RESEND_API_KEY` is set, email sending is a safe no-op (logged to server console) and password-reset/dev links are returned inline in non-prod.

---

## Environment Variables

Set these on Render (API) and Vercel (website + admin):

| Variable | Required | For |
|----------|----------|-----|
| `DATABASE_URL` | ✅ | Neon Postgres connection |
| `UPSTASH_REDIS_REST_URL` | ✅ | Redis for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Redis auth |
| `JWT_SECRET` | ✅ | Token signing |
| `NEXT_PUBLIC_API_URL` | ✅ | Frontend → API URL |
| `UPI_VPA` | ❌ | Fee-free UPI payment collection (your UPI ID) |
| `UPI_NAME` | ✅ | UPI display name (defaults `HomeHelp`) |
| `RAZORPAY_KEY_ID` | ❌ | Live payments (future migration only) |
| `RAZORPAY_KEY_SECRET` | ❌ | Live payments (future migration only) |
| `SENTRY_DSN` | ❌ | Error tracking |
| `GOOGLE_MAPS_API_KEY` | ❌ | Maps + geocoding |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | ❌ | Removed — Firebase auth no longer used |
| `FCM_SERVER_KEY` | ❌ | Push notifications |

---

## Security (what's enforced)

- **CI secret-guard** — `.github/workflows/ci.yml` runs `scripts/secret-guard.mjs` before every build and again after each Next app build. It fails the pipeline if a server secret (private keys, `JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `DATABASE_URL` with credentials, etc.) appears in client source or bundled browser output, or if a non-`NEXT_PUBLIC_*` env var is referenced in client code. Run locally with `npm run secret-guard`.
- **Content-Security-Policy** — `apps/website/src/middleware.ts` and `apps/admin/src/middleware.ts` set a strict per-request CSP (nonce-based for scripts, no third-party frames/objects, `frame-ancestors 'none'`, API-only `connect-src`) plus `X-Content-Type-Options`, `X-Frame-Options`, and `Permissions-Policy`. This mitigates XSS token theft while sessions remain in `localStorage`.
- **httpOnly cookie migration is deferred** — until a custom domain puts the API on a same-site subdomain, web/admin sessions use a `localStorage` Bearer token (see `AGENTS.md` Security Posture). Mobile keeps Bearer + `expo-secure-store`.
- Passwords are bcrypt-hashed; reset tokens are SHA-256-hashed at rest; booking OTPs are owner-scoped (customer-only); API responses strip passwords/tokens.

## Admin tooling

- `npm run make-admin -- <email>` — promote an existing account to admin.
- `npm run create-admin -- <email> [password]` — create (or promote) an admin account with a bcrypt-hashed password (random 16-char password if omitted). Used to provision `shivamjainqwer@gmail.com`.
- `npm run seed-demo` — seed demo customer + verified/available worker + a pending booking.

---

## Deployment

All services auto-deploy from `main` branch:
- **API**: Render (build: `npm install && npm run build`, start: `npm start`)
- **Website**: Vercel (Root Directory: cleared, builds from `apps/website`)
- **Admin**: Vercel (Root Directory: cleared, builds from `apps/admin`)

Manual deploy:
```bash
cd apps/website && npx vercel deploy --prod
cd apps/admin   && npx vercel deploy --prod
```
