# HomeHelp — AI/Developer Handoff Document

## Project Overview

HomeHelp is an on-demand platform with two booking modes: **home help** (cleaners, domestic workers) and **driver booking** (someone to drive your own car). Full-stack model — we hire, train, verify, and manage workers ourselves. Launching as a single-city MVP (Kolkata).

## Current State (Post-Session 6 — Design System Overhaul + Premium UI)

### Live URLs
| App | URL | Status |
|-----|-----|--------|
| Marketing website | https://homehelp-website.vercel.app | Live — waitlist + worker registration (Firebase Auth) |
| Admin dashboard | https://homehelp-admin.vercel.app | Live — Firebase phone auth + live data |
| Backend API | https://homehelp-clbc.onrender.com | Live — full CRUD + stats |
| GitHub repo | https://github.com/Uday248-coder/HomeHelp | Private |

### Vercel Project Config (already set, do not change)
- Admin: Root Directory = (empty), NEXT_PUBLIC_API_URL = https://homehelp-clbc.onrender.com ✅
- Website: Root Directory = (empty), NEXT_PUBLIC_API_URL = https://homehelp-clbc.onrender.com ✅

### What's Complete

#### Backend API (`services/api/`)
- OTP send/verify with rate limiting (max 5/15min, Redis-backed)
- **Security Hardening** — JWT authentication using `httpOnly`, `secure`, `sameSite: 'lax'` cookies (prevents XSS theft)
- **Authentication** — Logout implementation and Firebase Auth integration (`POST /api/auth/firebase` verifies Firebase ID token, upserts user, returns JWT in cookie and response body)
- **Lazy Firebase Initialization** — Firebase admin initialized on first use to prevent API boot crashes if credentials are missing
- **Comprehensive Error Logging** — All route catch blocks now log errors with prefix for searchable logs
- **Real-time Communication** — Socket.io integration for worker location tracking
- Admin role system (`isAdmin` field on User model)
- Booking CRUD + lifecycle (create, assign, start with OTP, complete with OTP+rating, cancel)
- Booking OTP generation endpoint (`PATCH /:id/generate-otp`)
- Worker CRUD with auth-gated POST/PATCH, open GET (with field restrictions)
- **Hardened Payments** — Razorpay signature verification using database-stored `razorpayOrderId` to prevent tampering
- Payment create-order (15% platform fee, Razorpay with auto-mock fallback) + verify (fixed signature check) + get by booking
- **Server-side pricing** — `RATE_TABLE` in constants.ts is single source of truth; clients cannot supply `amount` or `hourlyRate`
- **Payment access guard** — GET `/payments/booking/:bookingId` validates caller owns booking or is admin
- Admin stats with auth + role guard (`/dashboard`, `/revenue/weekly`)
- Waitlist endpoint with DB persistence (Prisma `WaitlistEntry` model) + **email validation**
- Admin bookings pagination (page/limit/status/search filters) with admin guard
- Health check endpoint
- **Global rate limiting** (100 req/min per IP) + tighter auth routes (10 req/min)
- `.env.example` with all documented env vars
- **SECURITY_CHECKLIST.md** — 15 standing security requirements for all future changes

#### Admin Dashboard (`apps/admin/`) — Premium UI
- **Professional dark sidebar** with navigation (Dashboard, Bookings, Workers, Payouts, Settings)
- **Dark mode toggle** — persisted to localStorage, `.dark` class on `<html>`, flash-prevention inline script
- **Dashboard** — 6 stat cards with SVG icons, gradient-filled weekly revenue bar chart (pure SVG with hover tooltips), booking status donut chart, recent bookings table, error boundary
- **Bookings page** — search bar, status filter dropdown, paginated table, action dropdown per row (Assign Worker with modal, Generate Start/End OTP, Cancel), proper loading/empty/error states
- **Workers page** — search, type filter, availability toggle (inline button), Aadhaar Verify / License Verify actions, rating stars
- **Login flow** — **Firebase phone auth with invisible reCAPTCHA**, ambient gradient background, `card-dashboard` glass card, spinners, proper validation
- **Security** — Authentication handled via `httpOnly` cookies (managed automatically by API client)
- **Components** — Sidebar (gradient logo, hover-state refinements), StatCard (group-hover icon scale), BarChart (gradient bar fills, hover highlight), DonutChart (brightness hover), Modal (Escape key, backdrop blur, body scroll lock), ErrorBoundary, Skeleton (StatCard, Table, Chart, Dashboard)
- **Pages** — Dashboard, Customers (searchable table + booking history modal), Bookings, Analytics (date range picker, revenue chart, booking funnel, top workers), Workers, Payouts (status filter + process/mark-paid actions), Settings
- **Semantic CSS** — HSL design tokens with `--accent`, `--accent-hover`, `--border-hover`, `card-dashboard`, `fade-in`/`slide-in`/`scale-in` utilities
- **API helper** — centralized `api.ts` with `credentials: 'include'` for automatic cookie handling, buildQuery helper, retry logic

#### Marketing Website (`apps/website/`) — Redesigned for Kolkata
- **Waitlist** — proxied to backend API (persistent storage via Prisma)
- **Pricing section** — 3 cards (Home Help ₹199/hr, Driver ₹149/hr, Subscription ₹499/mo coming soon)
- **Testimonials section** — 3 user cards with star ratings
- **FAQ section** — 6-item accordion with smooth expand/collapse
- **Sticky header** with backdrop blur
- **Worker Registration** — 3-step progress indicator, email + experience fields, terms acceptance, phone format validation, **Firebase phone auth with invisible reCAPTCHA**, success animation, back button on step 2
- **Design system** — Newsreader (display serif) + Inter (body sans) via next/font/google; palette: neutral slate + emerald accent + warm clay accent
- **Hero** — dark pine split layout (headline + live-status card showing workers/drivers/rating)
- **Reduced-motion support**; dark mode added back (system preference + manual toggle)
- **Kolkata-specific** copy throughout

#### Mobile Apps (`apps/customer-app/`, `apps/worker-app/`) — Expo 56 (Fully Built)
- **6 screens each** — Customer: Auth, Home, Bookings, BookingDetail, Profile; Worker: Auth, Dashboard, Jobs, ActiveJob, Earnings, Profile
- **AuthContext** — token storage via `expo-secure-store` (not AsyncStorage)
- **API clients** — use secure store for token retrieval
- **Mobile apps have tsconfig.json with strict mode** — `tsc --noEmit` catches type errors
- **Customer App**: Razorpay integration for payment confirmation
- **Worker App**: Real-time location tracking via Socket.io and `expo-location`
- Ready for Firebase Auth migration (currently use legacy OTP flow)

## Design System (Session 6 — HSL Tokens + Premium UI)

### Token Architecture
Both website and admin use HSL CSS custom properties for theming. The shared pattern:

```css
/* Website: apps/website/src/app/globals.css */
:root {
  --accent: 160 84% 39%;        /* emerald green */
  --accent-hover: 160 72% 34%;
  --warm: 18 48% 54%;           /* clay accent */
  --surface: 0 0% 100%;         /* light mode surface */
  --surface-secondary: 210 20% 98%;
  --foreground: 210 16% 10%;
  --foreground-secondary: 210 10% 36%;
  --border: 210 14% 89%;
  --border-hover: 210 10% 62%;
  --shadow-md: 0 4px 16px -4px rgb(0 0 0 / 0.08);
}

.dark {
  --surface: 210 18% 8%;
  --foreground: 210 17% 93%;
  --border: 210 14% 18%;
}
```

```css
/* Admin: apps/admin/src/app/globals.css */
:root {
  --sidebar: 224 18% 10%;
  --sidebar-primary: 160 84% 45%;
  --accent: 160 84% 45%;
  --card: 0 0% 100%;
  --muted: 224 8% 94%;
}
```

### Motion System
All animations use `cubic-bezier(0.16, 1, 0.3, 1)` — a spring-like ease-out curve for premium feel without bounce:
- Micro feedback: 120–180ms (hover, active, focus)
- Standard transition: 180–260ms (card lift, nav scroll)
- Entry animation: 300–500ms (fade-in-up, scale-in)
- Only `transform` and `opacity` are animated — never layout properties

### Key Utility Classes (website globals.css)
| Class | Purpose |
|-------|---------|
| `card-base` | Surface + border + radius + hover border/shadow transition |
| `card-lift` | Hover: `translateY(-2px)` + `shadow-lg` |
| `btn-base` | Shared button sizing, font, focus ring, active scale(0.97), disabled |
| `btn-primary` | Accent bg + green shadow + hover depth |
| `btn-secondary` | Surface border + hover bg |
| `input-base` | Border + focus ring + error state via `aria-invalid` |
| `nav-blur` | backdrop-filter: blur(16px) saturate(1.4) |
| `text-gradient` | Accent-to-warm gradient text fill |

### Component Architecture
| Component | Location | Key Features |
|-----------|----------|--------------|
| Button | `website/src/components/ui/Button.tsx` | 5 variants (primary, secondary, ghost, outline, destructive), 3 sizes, loading spinner, active scale |
| Card | `website/src/components/ui/Card.tsx` | 3 variants (default, elevated, ghost), semantic CardHeader/CardTitle/CardDescription/CardContent/CardFooter sub-components |
| Badge | `website/src/components/ui/Badge.tsx` | 6 variants, optional dot indicator, 2 sizes |
| Input | `website/src/components/ui/Input.tsx` | label, error, helperText, aria-invalid, aria-describedby |
| Sidebar | `admin/src/components/Sidebar.tsx` | Gradient logo, collapsible mobile, dark/light toggle, logout |
| LoginScreen | `admin/src/components/LoginScreen.tsx` | Ambient glow bg, Firebase phone auth, reCAPTCHA, OTP flow |
| StatCard | `admin/src/components/dashboard/StatCard.tsx` | 5 color themes, group-hover icon scale, trend text |
| BarChart | `admin/src/components/dashboard/BarChart.tsx` | Gradient bars, hover highlight + tooltip, empty state |
| DonutChart | `admin/src/components/dashboard/DonutChart.tsx` | SVG arc segments, hover brightness, legend |

### Dark Mode Implementation
- **Website**: System preference detection via `prefers-color-scheme: dark` + manual toggle button. Flash prevention via inline `<script>` in `layout.tsx` before hydration. Persisted to `localStorage.homehelp_theme`.
- **Admin**: Same approach using `localStorage.admin_dark_mode`. Toggle in sidebar.
- Both use `.dark` class on `<html>` element.

### Performance Constraints
- No JS animation libraries (Framer Motion, GSAP) — CSS-native only
- Reduced motion respected (`prefers-reduced-motion: reduce` disables all animations)
- SVG icons inline (no icon library dependency)
- All interactive elements have `:focus-visible` outlines
- `scroll-behavior: smooth` with `prefers-reduced-motion: reduce` fallback

### Critical Fixes Applied
- **Authentication Hardening** — Transitioned to `httpOnly` cookies and implemented logout to prevent XSS-based token theft.
- **Payment Verification Hardening** — Switched to database-backed signature verification to prevent `razorpayOrderId` tampering.
- Razorpay signature verification bug fixed (was passing paymentId twice instead of orderId+paymentId)
- OTP no longer returned in send-otp response body (only logged)
- Admin endpoints now require isAdmin role (403 if not)
- Worker POST/PATCH now require auth
| Worker GET `/workers` excludes phone/coordinates; `/workers/available/:mode` is auth-gated with select |
- Worker GET `/workers/:id` returns full profile data only to owner or admin
- Stats endpoints now require auth + admin role
- Waitlist data persisted in database (not in-memory)
- Bookings admin/all has pagination, search, status filter
- Loading skeletons redesigned for every admin view
- **Payment access guard** on GET `/payments/booking/:bookingId`
- **Waitlist email validation** on POST `/api/waitlist`
- **Booking status guard** on PATCH `/bookings/:id/assign` (must be `pending`)
- **Worker identity verification** on PATCH `/bookings/:id/start` and `/complete`
- **Active worker check** on GET `/bookings/available`
- **JWT_SECRET startup throw** (no hardcoded fallback)
- **Server-side pricing via `RATE_TABLE`** in constants.ts
- **Booking response shaping** — all booking routes now use `select` to exclude OTPs and sensitive user data
- **Stats response shaping** — dashboard recent bookings exclude user phone/email
- **OTP verify auto-reset** — 5 failed attempts deletes the OTP, requiring fresh send
- **Payment ownership check** — `POST `/payments/create-order` validates caller owns the booking
- **`POST `/api/workers` admin-gated** — worker creation now requires admin role
- **`GET `/api/workers/available/:mode` auth-gated** with field select (phone/coordinates excluded)
- **Global + auth rate limiting** in `index.ts`
- **Lazy Firebase Initialization** — prevents API crashes when service account is missing
- **Token response in Auth** — /api/auth/firebase and /api/auth/verify-otp now return tokens for token-based clients
- **Comprehensive Error Logging** — all route catch blocks now log with searchable prefixes
- **Real-time location tracking** — Socket.io implementation for worker tracking

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | Neon Postgres (serverless) |
| ORM | Prisma |
| OTP/Cache | Upstash Redis |
| Auth | **Firebase Auth (phone) + JWT (custom/httpOnly cookies)** — Zero-cost via test numbers |
| Error tracking | Sentry (wired, no DSN) |
| Deploy (API) | Render |
| Deploy (web) | Vercel |
| CI/CD | GitHub Actions |

## Monorepo Structure

```
HomeHelp/
├── apps/
│   ├── customer-app/     # React Native / Expo ✅
│   ├── worker-app/       # React Native / Expo ✅
│   ├── website/          # Next.js 14 marketing site ✅
│   └── admin/            # Next.js 14 admin dashboard ✅
├── services/
│   └── api/              # Express + TypeScript backend ✅
├── .github/workflows/    # CI/CD ✅
├── package.json          # npm workspaces root
├── AGENTS.md             # This file
└── HomeHelp_Bud101_Prompt.md  # Full product brief
```

## Firebase Test Phone Auth (Zero-Cost Setup)

Auth uses Firebase Phone Authentication with test numbers — no real SMS, no paid gateway.

**Console setup:** Firebase Console → Authentication → Sign-in method → Phone → Enable
**Test numbers:** Add `+91 9999988888` with test OTP `123456` under Test phone numbers
**Authorized domains:** Add `homehelp-admin.vercel.app`, `homehelp-website.vercel.app`, `localhost`
**Service key:** Generate from Service accounts tab → set `FIREBASE_SERVICE_ACCOUNT_KEY` on Render

**UI hints:** LoginScreen and `/join` page show test number hints in development mode.

## Credentials Needed

These are stored as env vars on Render. For local dev, add to `services/api/.env`.

| Variable | Where to get it | Status |
|----------|----------------|--------|
| `DATABASE_URL` | Neon dashboard → connection string | ✅ Set on Render |
| `UPSTASH_REDIS_REST_URL` | Upstash dashboard → REST API tab | ✅ Set on Render |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash dashboard → REST API tab | ✅ Set on Render |
| `JWT_SECRET` | Generate any random string | ✅ Set on Render |
| `SENTRY_DSN` | Sentry → create project → client key | ❌ Not set |
| `RAZORPAY_KEY_ID` | Razorpay dashboard | ❌ Not set |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard | ❌ Not set |
| `GOOGLE_MAPS_API_KEY` | Google Cloud Console | ❌ Not set |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Console → Service Account → Generate Key | ❌ Not set on Render |
| `FCM_SERVER_KEY` | Firebase project settings | ❌ Not set |

## Database Schema (Prisma)

All tables in `services/api/prisma/schema.prisma`:
- **users** — phone login, wallet balance, isAdmin flag
- **workers** — type (home_help/driver/both), verification flags, location
- **bookings** — mode, status, OTPs, ratings
- **payments** — amounts, Razorpay IDs
- **worker_payouts** — weekly payouts
- **waitlist_entries** — email signups with unique constraint

## Key API Endpoints

See: `services/api/src/routes/` (new: `users.ts`, enhanced: `payouts.ts` + `stats.ts`)

| Route | Method | Status | Description |
|-------|--------|--------|-------------|
| `/health` | GET | ✅ Live | Health check |
| `/api/auth/send-otp` | POST | ✅ Live | Sends OTP via Redis (rate-limited) |
| `/api/auth/verify-otp` | POST | ✅ Live | Verifies OTP, returns JWT in cookie |
| `/api/auth/me` | GET | ✅ Live | Get current user |
| `/api/auth/firebase` | POST | ✅ Live | Verify Firebase ID token, return JWT in cookie |
| `/api/bookings` | GET/POST | ✅ Live | List/create bookings (auth) |
| `/api/bookings/:id` | GET | ✅ Live | Get booking detail |
| `/api/bookings/:id/cancel` | PATCH | ✅ Live | Cancel booking |
| `/api/bookings/:id/assign` | PATCH | ✅ Live | Assign worker to booking |
| `/api/bookings/:id/start` | PATCH | ✅ Live | Start booking (OTP-gated) |
| `/api/bookings/:id/complete` | PATCH | ✅ Live | Complete booking (OTP+rating) |
| `/api/bookings/:id/generate-otp` | PATCH | ✅ Live | Generate start/end OTP for booking |
| `/api/bookings/admin/all` | GET | ✅ Live | Admin list all bookings (paginated) |
| `/api/workers` | GET/POST | ✅ Live | List/create workers |
| `/api/workers/:id` | GET/PATCH | ✅ Live | Get/update worker (auth-gated) |
| `/api/workers/available/:mode` | GET | ✅ Live | Filter workers by mode |
| `/api/payments/create-order` | POST | ✅ Live | Create payment + Razorpay order |
| `/api/payments/verify` | POST | ✅ Live | Capture payment (fixed signature check) |
| `/api/payments/booking/:bookingId` | GET | ✅ Live | Get payment by booking |
| `/api/stats/dashboard` | GET | ✅ Live | Live admin dashboard stats (auth+admin) |
| `/api/stats/revenue/weekly` | GET | ✅ Live | Last 7 days revenue (auth+admin) |
| `/api/waitlist` | GET/POST | ✅ Live | Waitlist signup with DB persistence |
| `/api/payouts` | GET | ✅ Live | List payouts (admin, filterable by status) |
| `/api/payouts/process` | POST | ✅ Live | Create payout batches for a week range (admin) |
| `/api/payouts/:id/mark-paid` | POST | ✅ Live | Mark payout as processed (admin) |
| `/api/payouts/:id` | GET | ✅ Live | Get payout detail (admin) |
| `/api/users` | GET | ✅ Live | List all customers (admin, paginated, searchable) |
| `/api/users/:id` | GET | ✅ Live | Get customer detail (admin) |
| `/api/users/:id/bookings` | GET | ✅ Live | Get customer booking history (admin) |
| `/api/stats/analytics` | GET | ✅ Live | Deep analytics with date range, funnel, mode breakdown (admin) |

## How Another AI Can Resume

1. **Clone the repo**: `git clone https://github.com/Uday248-coder/HomeHelp.git`
2. **Install deps**: `npm install` (from root or each workspace)
3. **Set env vars**: Copy `.env.example` to `.env`, fill in credentials
4. **Run migrations**: `npm run db:migrate` in `services/api`
5. **Start dev**: `npm run dev:api` for backend, `npm run dev:website` for frontend

**Firebase setup:** Enable Phone sign-in in Firebase Console → add test number `+91 9999988888` with OTP `123456`. No real SMS, unlimited free OTP.

No special setup needed. The workspace config, TypeScript, Prisma, and all dependencies are ready.

## What to Build Next (Priority Order)

### Phase 0 — Polish & Production (In Progress)
1. Firebase Phone Auth via test numbers for unlimited free OTP — MSG91 removed, all SMS code deleted
2. Set Sentry DSN — ✅ Code wired, set `SENTRY_DSN` on Render
3. Loading skeleton polish for admin dashboard — ✅ Done in Session 6
4. **Set `NEXT_PUBLIC_API_URL` env vars on Vercel for admin & website** ✅
5. **Set `FIREBASE_SERVICE_ACCOUNT_KEY` env var on Render** — ✅ Code reads from env, just need to set it
6. **Add Vercel URLs to Firebase authorized domains** — Config only

### Phase 1 — Mobile apps (2+ weeks)
7. Customer Expo app (React Native) with mode switcher
8. Worker Expo app with availability toggle, job acceptance
9. Real-time location tracking via Socket.io
10. Push notifications via FCM

### Phase 2 — Platform features (1-2 weeks)
11. Aadhaar verification flow for workers
12. Admin panel for reviewing/approving workers
13. Weekly payout automation for workers
14. Surge pricing engine
15. Mode-aware pricing calculator

### Phase 3 — Driver mode (2+ weeks)
16. License verification
17. Outstation booking flow
18. Mode-aware pricing engine

## Deployment Notes

- **API auto-deploys** from `main` branch via Render (linked repo)
- **Website auto-deploys** from `main` branch via Vercel (linked repo)
- **Admin auto-deploys** from `main` branch via Vercel (linked repo)
- `.env` files are gitignored — secrets set via Render/Vercel dashboards
- Build command for API: `npm install && npm run build` (runs `prisma generate && tsc`)
- Start command: `npm start`
- Vercel admin project ID: `prj_XfvZvL1JVoQ9YwUuF5J2SmadJSLA`
- Vercel website project ID: `prj_fWcgKAorruCx8ufNpTbxqb1B6dme`
- Vercel team ID: `team_BEDXv1boZuZVP4OpExmoekPY`
- Both Vercel projects have Root Directory cleared (build from each app's own directory)
- Both have `NEXT_PUBLIC_API_URL` set to `https://homehelp-clbc.onrender.com`
- Use `npx vercel deploy --prod` from `apps/admin` or `apps/website` to manually deploy

## Product Context (Key Points from Founder)

Full context in `HomeHelp_Bud101_Prompt.md`. TL;DR:
- Dual-mode: home help + driver (your own car)
- Full-stack ops: we hire/train/manage workers
- Launch city: TBD (need density analysis)
- Revenue: 15-20% commission, ₹499-999/mo subscription, surge pricing
- Risk: worker no-shows (10% standby pool), trust/safety (OTP gating), competition (differentiate on Driver mode)

---

## Required Reading for Future Sessions

Before making any changes to `services/api/`, read **`services/api/SECURITY_CHECKLIST.md`** — it contains the standing security requirements every route change must satisfy. Failure to follow these rules will reintroduce the same vulnerabilities this session fixed.
