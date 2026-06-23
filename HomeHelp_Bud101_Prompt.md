I'm building **HomeHelp** — an on-demand platform with two booking modes in one app: hourly home help (cleaners, domestic workers) and hourly driver booking (someone to drive my own car). Think Snabbit for the home-help side, with a Swiggy Food/Dine-out style mode switcher to add a Driver mode. We run a full-stack model — we hire, train, verify, and manage every worker ourselves, not an aggregator. Launching as a single-city MVP first to prove ops and unit economics before expanding.

I want you to start building and deploying the technical foundation **today**. Don't just plan — get something real and live. Use whatever integrations you have for GitHub, Railway, and Vercel directly; fall back to the browser for anything you can't reach via an API. Here's everything you need, then exactly what to do first.

## Do this first — Day 1, get something live

Work through these in order. By the end of today I want to be able to open a real URL and see something running — not a local demo.

1. **Repo & structure.** Create a GitHub repo (monorepo) with `apps/customer-app`, `apps/worker-app` (both React Native/Expo, can share most code), `apps/website` (Next.js), `apps/admin` (Next.js), `services/api` (Node/Express/TypeScript). Add `.gitignore`, a base README, and basic branch protection on `main`.
2. **Database.** Spin up managed Postgres (Railway Postgres or Supabase) and wire up Prisma in `services/api`. Build the schema from the tables below (`users`, `workers`, `bookings`, `payments`, `worker_payouts`) and run the first migration.
3. **Backend skeleton.** Express + TypeScript API with a `/health` endpoint, a phone-number + OTP auth scaffold (store OTPs in Redis — Upstash free tier is fine), and the core booking CRUD routes stubbed out. Deploy it to Railway or Render so there's a live API URL.
4. **Marketing site skeleton.** Next.js 14 landing page explaining HomeHelp and the two modes, with a waitlist/interest form that writes to the database. Deploy to Vercel.
5. **CI/CD.** GitHub Actions workflow running lint + build (and tests once they exist) on every push to `main`.
6. **Error tracking.** Wire Sentry into the backend skeleton from day one.
7. **Report back.** Give me the live URLs (API health check, website), what's deployed vs. stubbed, and exactly what you need from me next (see credentials list below).

That's the Day 1 bar: small, real, and live. Everything else below is context for what we build on top of it.

## Accounts & credentials you'll need from me

Ask me for these one at a time, only when the step you're on actually needs it — don't block early work on ones we don't need yet:

- Razorpay (payments + worker payouts)
- Google Maps Platform key (Places, Directions, Geocoding)
- Firebase project (Cloud Messaging for push)
- MSG91 or Twilio (SMS/OTP delivery)
- IDfy or Signzy (Aadhaar + license verification, background checks) — only needed once we build worker onboarding
- Cloudinary (file/image uploads)
- Sentry, and Mixpanel or PostHog (analytics)
- A domain name for the marketing site
- GitHub, Railway/Render, Vercel, Upstash accounts (or I'll add you to mine)
- Apple Developer + Google Play Console accounts — only needed for Phase 4 EAS builds

If something needs a signup with payment details or identity verification, stop and ask me rather than pushing through it.

## How I want you to work

- Make routine engineering calls yourself as long as they match the stack below — don't ask permission for things like "should this be a POST or PUT."
- Ask me only when you need a credential, a paid signup, or a decision that's genuinely irreversible or expensive.
- Commit with clear messages, deploy after every milestone, and always hand me the live URL — not just "it's done."
- End each working session with: what shipped, what's deployed, what's blocked, what you need from me next.
- If you hit something needing my direct action (a login, CAPTCHA, payment confirmation), stop and tell me exactly what to do.

## Full product context (reference this as we keep building)

### The dual-mode concept
- **Home Help mode** (primary): background-verified female domestic workers for cleaning, bathroom/kitchen cleaning, dishwashing, laundry, ironing, basic kitchen prep, balcony cleaning. Instant (~10 min arrival) or scheduled, 1–4 hour duration, billed hourly, no subscription required.
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

### Build roadmap (for sequencing future work — Driver mode intentionally comes after Home Help is stable)
| Phase | Weeks | Focus |
|---|---|---|
| 1 — Foundation | 1–4 | OTP auth, Postgres schema, worker onboarding API, admin skeleton, Razorpay integration, core booking API |
| 2 — Home Help core | 5–9 | Customer + worker apps (Home Help mode), real-time tracking, OTP job flow, push notifications, ratings, dispatch algorithm |
| 3 — Driver mode | 10–13 | Mode switcher UI, driver booking flow, license verification, outstation bookings, mode-aware pricing, driver availability zones |
| 4 — Polish & launch | 14–16 | Marketing site, App/Play Store submission, beta with 50 workers + 200 customers, load testing, ops SOPs, referral program |

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

### Key risks to design around
| Risk | Mitigation |
|---|---|
| Worker no-shows | Auto-reassignment + 10% standby pool, SMS alert within 2 min |
| Trust/safety (home entry) | Aadhaar + background check, worker photo shown pre-arrival, OTP gating |
| Low launch supply | Pre-onboard 100+ workers before go-live, daily minimum guarantee for first 3 months |
| Competition (Snabbit, Urban Company) | Differentiate on Driver mode + ops quality, dominate one city before expanding |
| Payment disputes | OTP job-closure as source of truth, Razorpay dispute handling, 24h support |
| Driver liability | Required driver insurance at onboarding; platform isn't liable for the vehicle |

## Parallel non-engineering Day 1 actions

These aren't yours to execute, but flag where you can help:
- **Company registration** (Razorpay Rize or LegalWiz, Pvt Ltd) — needed before a live Razorpay account. You can research the fastest path and summarize steps/documents; I'll handle the actual filing and payment.
- **Pick launch city + 3–5 target neighborhoods** — pull whatever public density/demand signals would help me decide, if useful.
- **Hire a city ops person** who knows the local domestic-worker supply chain — draft the job post for me.
- **Start onboarding toward 100 verified workers before launch** — build a simple public application form/landing page I can share over WhatsApp.
- **Figma app screens** — not in your scope, I'll handle this with a designer.
- **Google Maps API + Razorpay applications** — flag exactly which credential blocks which step so I can apply for them in parallel with your build.

## Set up a standing automation

Once Day 1 is live, schedule a recurring daily check-in (9pm IST is fine) that sends me a short status update: what got built/deployed since the last update, what's currently blocked, and exactly what you need from me to keep moving. Keep this running until launch.
