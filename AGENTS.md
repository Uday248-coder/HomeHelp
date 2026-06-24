# HomeHelp — AI/Developer Handoff Document

## Project Overview

HomeHelp is an on-demand platform with two booking modes: **home help** (cleaners, domestic workers) and **driver booking** (someone to drive your own car). Full-stack model — we hire, train, verify, and manage workers ourselves. Launching as a single-city MVP.

## Current State (Post-Session 3 — 95% MVP Complete)

### Live URLs
| App | URL | Status |
|-----|-----|--------|
| Marketing website | https://homehelp-website.vercel.app | Live — waitlist + worker registration |
| Admin dashboard | https://homehelp-admin.vercel.app | Live — OTP login + live data |
| Backend API | https://homehelp-clbc.onrender.com | Live — full CRUD + stats |
| GitHub repo | https://github.com/Uday248-coder/HomeHelp | Private |

### Vercel Project Config (already set, do not change)
- Admin: Root Directory = (empty), NEXT_PUBLIC_API_URL = https://homehelp-clbc.onrender.com ✅
- Website: Root Directory = (empty), NEXT_PUBLIC_API_URL = https://homehelp-clbc.onrender.com ✅

### What's Complete

#### Backend API (`services/api/`)
- OTP send/verify with rate limiting (max 5/15min, Redis-backed)
- JWT login with User auto-creation
- Admin role system (`isAdmin` field on User model)
- Booking CRUD + lifecycle (create, assign, start with OTP, complete with OTP+rating, cancel)
- Booking OTP generation endpoint (`PATCH /:id/generate-otp`)
- Worker CRUD with auth-gated POST/PATCH, open GET
- Payment create-order (15% platform fee, Razorpay with auto-mock fallback) + verify (fixed signature check) + get by booking
- Admin stats with auth + role guard (`/dashboard`, `/revenue/weekly`)
- Waitlist endpoint with DB persistence (Prisma `WaitlistEntry` model)
- Admin bookings pagination (page/limit/status/search filters) with admin guard
- Health check endpoint
- `.env.example` with all documented env vars

#### Admin Dashboard (`apps/admin/`) — Complete Redesign
- **Professional dark sidebar** with navigation (Dashboard, Bookings, Workers, Payouts, Settings)
- **Dark mode toggle** — persisted to localStorage, `.dark` class on `<html>`
- **Dashboard** — 6 stat cards with SVG icons, weekly revenue bar chart (pure SVG), booking status donut chart, recent bookings table, error boundary
- **Bookings page** — search bar, status filter dropdown, paginated table, action dropdown per row (Assign Worker with modal, Generate Start/End OTP, Cancel), proper loading/empty/error states
- **Workers page** — search, type filter, availability toggle (inline button), Aadhaar Verify / License Verify actions, rating stars
- **Login flow** — phone input, OTP display (no alert()), spinners, proper validation
- **Components** — Sidebar, StatCard, Charts (BarChart + StatsSummary), Modal (Escape key, backdrop blur, body scroll lock), ErrorBoundary, Skeleton (StatCard, Table, Chart, Dashboard)
- **CSS** — HSL variables for theming, dark mode via `.dark` class, smooth transitions
- **API helper** — centralized `api.ts` with auto auth token injection, buildQuery helper

#### Marketing Website (`apps/website/`) — Enhanced
- **Waitlist** — now proxied to backend API (persistent storage via Prisma)
- **Pricing section** — 3 cards (Home Help ₹199/hr, Driver ₹149/hr, Subscription ₹499/mo coming soon)
- **Testimonials section** — 3 user cards with star ratings
- **FAQ section** — 5-item accordion with smooth expand/collapse
- **Sticky header** with backdrop blur
- **Worker Registration** — 3-step progress indicator, email + experience fields, terms acceptance, phone format validation, in-page OTP display (no alert()), success animation, back button on step 2
- **Custom CSS animations** — fadeInUp, pulse-dot, smooth scroll

### Critical Fixes Applied
- Razorpay signature verification bug fixed (was passing paymentId twice instead of orderId+paymentId)
- OTP no longer returned in send-otp response body (only logged)
- Admin endpoints now require isAdmin role (403 if not)
- Worker POST/PATCH now require auth
- Stats endpoints now require auth + admin role
- Waitlist data persisted in database (not in-memory)
- Bookings admin/all has pagination, search, status filter
- Loading skeletons redesigned for every admin view

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | Neon Postgres (serverless) |
| ORM | Prisma |
| OTP/Cache | Upstash Redis |
| Auth | OTP + JWT (custom) |
| Error tracking | Sentry (wired, no DSN) |
| Deploy (API) | Render |
| Deploy (web) | Vercel |
| CI/CD | GitHub Actions |

## Monorepo Structure

```
HomeHelp/
├── apps/
│   ├── customer-app/     # NOT STARTED — React Native / Expo
│   ├── worker-app/       # NOT STARTED — React Native / Expo
│   ├── website/          # Next.js 14 marketing site ✅
│   └── admin/            # Next.js 14 admin dashboard ✅ (skeleton)
├── services/
│   └── api/              # Express + TypeScript backend ✅
├── .github/workflows/    # CI/CD ✅
├── package.json          # npm workspaces root
├── AGENTS.md             # This file
└── HomeHelp_Bud101_Prompt.md  # Full product brief
```

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
| `TWILIO_SID` / `MSG91_KEY` | Twilio/MSG91 dashboard | ❌ Not set |
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

See: `services/api/src/routes/`

| Route | Method | Status | Description |
|-------|--------|--------|-------------|
| `/health` | GET | ✅ Live | Health check |
| `/api/auth/send-otp` | POST | ✅ Live | Sends OTP via Redis (rate-limited) |
| `/api/auth/verify-otp` | POST | ✅ Live | Verifies OTP, returns JWT |
| `/api/auth/me` | GET | ✅ Live | Get current user |
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

## How Another AI Can Resume

1. **Clone the repo**: `git clone https://github.com/Uday248-coder/HomeHelp.git`
2. **Install deps**: `npm install` (from root or each workspace)
3. **Set env vars**: Copy `.env.example` to `.env`, fill in credentials
4. **Run migrations**: `npm run db:migrate` in `services/api`
5. **Start dev**: `npm run dev:api` for backend, `npm run dev:website` for frontend

No special setup needed. The workspace config, TypeScript, Prisma, and all dependencies are ready.

## What to Build Next (Priority Order)

### Phase 0 — Polish & Production (1-2 days)
1. Add SMS provider for real OTP delivery (currently logged to console)
2. Add Razorpay SDK integration (currently stubbed with mock order IDs)
3. Set Sentry DSN for error tracking
4. Add proper loading skeletons to admin dashboard
5. Set up `NEXT_PUBLIC_API_URL` env vars on Vercel for admin & website

### Phase 1 — Mobile apps (2+ weeks)
6. Customer Expo app (React Native) with mode switcher
7. Worker Expo app with availability toggle, job acceptance
8. Real-time location tracking via Socket.io
9. Push notifications via FCM

### Phase 2 — Platform features (1-2 weeks)
10. Aadhaar verification flow for workers
11. Admin panel for reviewing/approving workers
12. Weekly payout automation for workers
13. Surge pricing engine
14. Mode-aware pricing calculator

### Phase 3 — Driver mode (2+ weeks)
15. License verification
16. Outstation booking flow
17. Mode-aware pricing engine

## Deployment Notes

- **API auto-deploys** from `master` branch via Render (linked repo)
- **Website auto-deploys** from `master` branch via Vercel (linked repo)
- **Admin auto-deploys** from `master` branch via Vercel (linked repo)
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
