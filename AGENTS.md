# HomeHelp — AI/Developer Handoff Document

## Project Overview

HomeHelp is an on-demand platform with two booking modes: **home help** (cleaners, domestic workers) and **driver booking** (someone to drive your own car). Full-stack model — we hire, train, verify, and manage workers ourselves. Launching as a single-city MVP.

## Current State (Post-Session 2 — 80% MVP Complete)

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

### What works
- OTP send/verify (Upstash Redis) + JWT login
- User auto-creation on first login
- `/health` endpoint
- Database schema migrated (all 6 tables)
- CI/CD GitHub Actions (lint + build on push)
- **Booking CRUD** — full Prisma-based: create, list, get, cancel, assign, start (OTP), complete (OTP+rating)
- **Worker routes** — create, list, get, update, filter by mode/availability
- **Payment routes** — create-order (with 15% platform fee calc, Razorpay SDK installed, auto mock mode when no keys), verify/capture, get by booking
- **Admin stats** — `/api/stats/dashboard` (active bookings, available workers, revenue, totals, recent bookings), `/api/stats/revenue/weekly`
- **Admin dashboard** — OTP login, live stats from API, bookings & workers pages, loading skeletons, TypeScript types
- **Website** — connected waitlist form (POST /api/waitlist), worker registration page (multi-step with OTP verification), Geist fonts via next/font/local
- **Admin Bookings page** — full table with status badges, amounts, user/worker info
- **Admin Workers page** — full table with type, availability, verification flags, ratings

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
- **users** — phone login, wallet balance
- **workers** — type (home_help/driver/both), verification flags, location
- **bookings** — mode, status, OTPs, ratings
- **payments** — amounts, Razorpay IDs
- **worker_payouts** — weekly payouts

## Key API Endpoints

See: `services/api/src/routes/`

| Route | Method | Status | Description |
|-------|--------|--------|-------------|
| `/health` | GET | ✅ Live | Health check |
| `/api/auth/send-otp` | POST | ✅ Live | Sends OTP via Redis |
| `/api/auth/verify-otp` | POST | ✅ Live | Verifies OTP, returns JWT |
| `/api/auth/me` | GET | ✅ Live | Get current user |
| `/api/bookings` | GET/POST | ✅ Live | List/create bookings (auth) |
| `/api/bookings/:id` | GET | ✅ Live | Get booking detail |
| `/api/bookings/:id/cancel` | PATCH | ✅ Live | Cancel booking |
| `/api/bookings/:id/assign` | PATCH | ✅ Live | Assign worker to booking |
| `/api/bookings/:id/start` | PATCH | ✅ Live | Start booking (OTP-gated) |
| `/api/bookings/:id/complete` | PATCH | ✅ Live | Complete booking (OTP+rating) |
| `/api/bookings/admin/all` | GET | ✅ Live | Admin list all bookings |
| `/api/workers` | GET/POST | ✅ Live | List/create workers |
| `/api/workers/:id` | GET/PATCH | ✅ Live | Get/update worker |
| `/api/workers/available/:mode` | GET | ✅ Live | Filter workers by mode |
| `/api/payments/create-order` | POST | ✅ Live | Create payment + Razorpay order |
| `/api/payments/verify` | POST | ✅ Live | Capture payment |
| `/api/payments/booking/:bookingId` | GET | ✅ Live | Get payment by booking |
| `/api/stats/dashboard` | GET | ✅ Live | Live admin dashboard stats |
| `/api/stats/revenue/weekly` | GET | ✅ Live | Last 7 days revenue |

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
13. License verification
14. Outstation booking flow
15. Mode-aware pricing engine

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
