# HomeHelp — AI/Developer Handoff Document

## Project Overview

HomeHelp is an on-demand platform with two booking modes: **home help** (cleaners, domestic workers) and **driver booking** (someone to drive your own car). Full-stack model — we hire, train, verify, and manage workers ourselves. Launching as a single-city MVP.

## Current State (Day 1 Complete)

### Live URLs
| App | URL | Status |
|-----|-----|--------|
| Marketing website | https://homehelp-website.vercel.app | Live — landing page |
| Admin dashboard | https://homehelp-admin.vercel.app | Live — skeleton |
| Backend API | https://homehelp-clbc.onrender.com | Live — OTP auth + health |
| GitHub repo | https://github.com/Uday248-coder/HomeHelp | Private |

### What works
- OTP send/verify (Upstash Redis) + JWT login
- User auto-creation on first login
- `/health` endpoint
- Database schema migrated (all 6 tables)
- CI/CD GitHub Actions (lint + build on push)

### What's stubbed
- `/api/bookings` — returns placeholder data
- Admin dashboard — shows hardcoded zeros
- Website waitlist form — not connected to DB

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
| `/api/bookings` | GET/POST | ⚠️ Stubbed | List/create bookings |
| `/api/bookings/:id` | GET | ⚠️ Stubbed | Get booking detail |
| `/api/bookings/:id/cancel` | PATCH | ⚠️ Stubbed | Cancel booking |

## How Another AI Can Resume

1. **Clone the repo**: `git clone https://github.com/Uday248-coder/HomeHelp.git`
2. **Install deps**: `npm install` (from root or each workspace)
3. **Set env vars**: Copy `.env.example` to `.env`, fill in credentials
4. **Run migrations**: `npm run db:migrate` in `services/api`
5. **Start dev**: `npm run dev:api` for backend, `npm run dev:website` for frontend

No special setup needed. The workspace config, TypeScript, Prisma, and all dependencies are ready.

## What to Build Next (Priority Order)

### Phase 1a — Make backend real (2-3 days)
1. Wire up real booking CRUD in `services/api/src/routes/bookings.ts`
2. Build worker onboarding API (create/verify/list workers)
3. Connect admin dashboard to live API data
4. Integrate Razorpay payments (create order, capture, refund)
5. Add SMS provider for real OTP delivery (currently logged to console)

### Phase 1b — Worker application flow (1-2 days)
6. Build public worker registration page (`apps/website` or standalone)
7. Store applications, Aadhaar verification flow
8. Admin panel for reviewing/approving workers

### Phase 2 — Mobile apps (2+ weeks)
9. Customer Expo app (React Native) with mode switcher
10. Worker Expo app with availability toggle, job acceptance
11. Real-time location tracking via Socket.io
12. Push notifications via FCM

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

## Product Context (Key Points from Founder)

Full context in `HomeHelp_Bud101_Prompt.md`. TL;DR:
- Dual-mode: home help + driver (your own car)
- Full-stack ops: we hire/train/manage workers
- Launch city: TBD (need density analysis)
- Revenue: 15-20% commission, ₹499-999/mo subscription, surge pricing
- Risk: worker no-shows (10% standby pool), trust/safety (OTP gating), competition (differentiate on Driver mode)
