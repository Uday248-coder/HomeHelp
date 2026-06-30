# HomeHelp — Project Brief & Status

## Project Overview
I'm building **HomeHelp** — an on-demand platform with two booking modes in one app: hourly home help (cleaners, domestic workers) and hourly driver booking (someone to drive my own car). Think Snabbit for the home-help side, with a Swiggy Food/Dine-out style mode switcher to add a Driver mode. We run a full-stack model — we hire, train, verify, and manage every worker ourselves, not an aggregator. Launching as a single-city MVP first to prove ops and unit economics.

## Current Status: Phase 1 Complete
The technical foundation is established and hardened.

### Completed Milestones:
- **Monorepo Foundation:** Established with npm workspaces (`apps/`, `services/`).
- **Backend Core:** Express/TypeScript API with Prisma ORM and Neon Postgres.
- **Authentication:** Secured using Firebase Auth (phone) and custom JWTs stored in `httpOnly` cookies to prevent XSS.
- **Payment Hardening:** Razorpay integration with database-backed signature verification to prevent tampering.
- **Marketing Website:** Next.js 14 landing page with waitlist.
- **Admin Dashboard:** Next.js 14 dashboard with secured routes and cookie-based auth.
- **Infrastructure:** Redis for OTP/rate-limiting, Sentry for error tracking, and GitHub Actions for CI/CD.

## Requirements & Credentials
(See AGENTS.md for the full list of credentials needed for subsequent phases)

## How I want you to work
- Make routine engineering calls yourself as long as they match the stack below — don't ask permission for things like "should this be a POST or PUT."
- Ask me only when you need a credential, a paid signup, or a decision that's genuinely irreversible or expensive.
- Commit with clear messages, deploy after every milestone, and always hand me the live URL — not just "it's done."
- End each working session with: what shipped, what's deployed, what's blocked, and what you need from me next.

## Full product context (reference this as we keep building)

### The dual-mode concept
- **Home Help mode** (primary): background-verified female domestic workers for cleaning, bathroom/kitchen cleaning, dishwashing, laundry, ironing, basic kitchen prep. Instant (~10 min arrival) or scheduled, 1–4 hour duration, billed hourly, no subscription required.
- **Driver mode**: book a verified driver to drive *my own car* — not a cab. Covers daily commute, airport drop/pick-up, outstation trips (8–12 hrs), late-night pickups, senior citizens' regular errands, corporate client-meeting drivers. Instant or scheduled, hourly billing (4-hour minimum outstation), Aadhaar + license verified.
- Both modes share one account, wallet, and payment method — separate booking flows, pricing, and worker pools, switched via a single home-screen toggle (Swiggy Food/Dine-out style).

### User types & apps
| User type | Platform | Purpose |
|---|---|---|
| Customer | iOS + Android (Expo) + website | Book, track in real time, pay, rate workers |
| Worker/Driver | Android app (primary) | Accept jobs, navigate, OTP start/end, earnings, availability toggle |
| Admin/Ops | Web dashboard | Workers, bookings, payouts, disputes, expansion, analytics |

### Core features
**Customer app:** mode switcher; instant vs. scheduled booking with smart re-assignment on cancellation; real-time worker tracking (live map, ETA countdown, in-app chat, arrival alert at 2 min); OTP-based job start/end (4-digit codes, auto-payment on close); Razorpay/UPI payments + in-app wallet + auto-invoice via email/WhatsApp + refund flow; post-job 1–5 star ratings (workers under 3.5 avg auto-paused), worker profile with photo/rating/jobs-done/verified badges.

**Worker/Driver app:** availability toggle; new job notification with 30-second accept/decline window; turn-by-turn nav via Google Maps; OTP start/end; live job timer + earnings; daily/weekly earnings dashboard with payout history; document vault (Aadhaar, license, certificates); in-app chat during active jobs.

**Admin panel:** live ops map dashboard; worker onboarding/verification workflow; booking management (view/reassign/cancel/refund); payout processing; customer management/complaints/credits; analytics (bookings, revenue, cancellations, top workers, demand heatmaps); pricing engine (hourly rates, surge by time/area); broadcast notifications.

### Tech stack
| Layer | Choice |
|---|---|
| Mobile (customer + worker) | React Native + Expo, TypeScript, Zustand, React Query, Google Maps SDK, Socket.io client, Expo Router, Expo Notifications + FCM, EAS Build |
| Website | Next.js 14 (App Router), Tailwind + shadcn/ui, Vercel |
| Admin panel | Next.js 14, shadcn/ui + Tailwind, Recharts, role-based auth (Admin/City Ops/Support) |
| Backend | Node.js + Express, TypeScript, PostgreSQL, Prisma ORM, Redis (sessions/OTP/location cache/rate limiting), Socket.io (real-time), BullMQ (background jobs), Cloudinary (uploads) |
| Third-party | Razorpay (payments+payouts), MSG91/Twilio (SMS/OTP), FCM (push), Google Maps Platform (Places/Directions/Geocoding), IDfy/Signzy (background checks), Twilio WhatsApp/Gupshup (alerts), Sentry (errors), Mixpanel/PostHog (analytics) |
| Infra | Railway/Render → AWS EC2 later (backend), Railway Postgres/Supabase (DB), Upstash Redis, Cloudflare (CDN/DDoS), GitHub Actions (CI/CD), Grafana+Prometheus / PagerDuty (monitoring) |

### Database schema (core tables — build via Prisma)
- **users**: id (UUID, PK), phone_number (unique, OTP login), name, email, profile_photo_url, wallet_balance (decimal), timestamps
- **workers**: id (UUID, PK), worker_type (enum: home_help/driver/both), name, phone_number, photo_url, aadhaar_verified (bool), license_verified (bool, drivers only), average_rating (decimal), total_jobs (int), is_available (bool), is_active (bool), current_lat/current_lng (refreshed every 5s when online), timestamps
- **bookings**: id (UUID, PK), user_id (FK), worker_id (FK, nullable until assigned), mode (enum: home_help/driver), service_type, status (enum: pending/assigned/in_progress/completed/cancelled), scheduled_at, started_at, completed_at, duration_hours, hourly_rate, total_amount, start_otp/end_otp (char 4), customer_address, customer_lat/lng, rating_by_user (1–5), review_text, timestamps
- **payments**: id (UUID, PK), booking_id (FK), amount, platform_fee, worker_payout, payment_method, razorpay_payment_id, status (enum: pending/captured/refunded), timestamps
- **worker_payouts**: id, worker_id, amount, week_start_date, week_end_date, status (enum: pending/processed), processed_at, razorpay_payout_id, timestamps

### Build roadmap
| Phase | Focus |
|---|---|
| **1 — Foundation (COMPLETE)** | OTP auth, Postgres schema, worker onboarding API, admin skeleton, Razorpay integration, core booking API |
| **2 — Home Help core** | Customer + worker apps (Home Help mode), real-time tracking, OTP job flow, push notifications, ratings, dispatch algorithm |
| **3 — Driver mode** | Mode switcher UI, driver booking flow, license verification, outstation bookings, mode-aware pricing, driver availability zones |
| **4 — Polish & launch** | Marketing site, App/Play Store submission, beta with 50 workers + 200 customers, load testing, ops SOPs, referral program |

### Worker operations & trust
Full-stack hiring, not aggregator: application → Aadhaar verification (IDfy/Signzy) → in-person training (2 days home-help / 1 day drivers) → background/police check → uniform + ID issued → 3 supervised jobs before going independent. Quality control: every job rated, sub-3.5-average workers auto-paused, retraining after 3 consecutive low ratings, in-app complaints reviewed within 2 hours, monthly mystery-shopper audits. Pay: weekly via Razorpay payout, platform takes 15–20% commission, bonuses for 20+ jobs/week, transparent per-job earnings breakdown.

### Revenue model
| Stream | Rate | Notes |
|---|---|---|
| Commission | 15–20% | Core revenue, auto-deducted before weekly payout, both modes |
| Subscription | ₹499–999/mo | Unlimited bookings at discounted rate + priority dispatch |
| Worker onboarding fee | ₹500–1,000 one-time | Covers background check, training, kit |
| Surge pricing | 1.2x–1.5x | Peak hours, weekends, bad weather |
| Corporate packages | Custom | Monthly contracts for office cleaning / employee drivers |
