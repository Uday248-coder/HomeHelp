# Phase 1 Discovery Report — HomeHelp

**Project Root**: `C:\Users\User\Downloads\homehelp`  
**Report Generated**: 2026-07-16  
**Auditor**: Senior Software Architect (local audit, zero-budget constraint)

---

## 1. Repository Structure Summary

```
homehelp/
├── apps/
│   ├── admin/              # Next.js 14 Admin Dashboard (Premium UI)
│   ├── customer-app/       # Expo 56 / React Native 0.85 (Customer mobile)
│   ├── website/            # Next.js 14 Marketing + Booking Web App
│   └── worker-app/         # Expo 56 / React Native 0.85 (Worker mobile)
├── services/
│   └── api/                # Express + TypeScript Backend API
│       ├── prisma/         # Prisma schema + migrations
│       ├── src/
│       │   ├── index.ts    # Express entry + Socket.io
│       │   ├── routes/     # 9 route modules (auth, bookings, workers, payments, stats, waitlist, payouts, users, health)
│       │   ├── lib/        # constants, prisma, redis, mailer, eligibility
│       │   ├── middleware/ # auth, validation
│       │   └── socket.ts   # Real-time worker location tracking
│       └── scripts/        # make-admin, create-admin, seed-demo
├── .github/workflows/      # CI: secret-guard + lint + build
├── scripts/secret-guard.mjs # Prevents server secrets in client bundles
├── package.json            # npm workspaces root
└── AGENTS.md               # Project handoff document (this session's source of truth)
```

**Total Source Files (excl. node_modules, .next, dist, build)**: **765 files**  
**Total Lines of Source Code**: **~52,930 lines**

---

## 2. Tech Stack (Verified from Config Files)

| Layer | Technology | Evidence |
|-------|------------|----------|
| **Runtime** | Node.js 20.x | `package.json:engines.node: "20.x"` (root, api, website, admin) |
| **Package Manager** | npm workspaces | `package.json:workspaces: ["apps/*", "services/*"]` |
| **Backend** | Express 4.21 + TypeScript 5.6 | `services/api/package.json` |
| **Database** | PostgreSQL (Neon serverless) | `prisma/schema.prisma:datasource db.provider = "postgresql"` |
| **ORM** | Prisma Client 6.x | `services/api/package.json:@prisma/client` |
| **Cache/OTP** | Upstash Redis (REST) | `services/api/package.json:@upstash/redis`, `src/lib/redis.ts` |
| **Auth** | Email/password (bcrypt) + JWT (7d expiry) | `services/api/src/routes/auth.ts` — **No Firebase** |
| **Session** | httpOnly cookies (web) / Bearer + expo-secure-store (mobile) | `auth.ts` sets `auth_token` cookie; mobile uses `SecureStore` |
| **Real-time** | Socket.io 4.8 | `services/api/src/socket.ts`, `src/index.ts:setupSocket()` |
| **Payments** | Fee-free UPI QR (default) + Razorpay (fallback, keys optional) | `services/api/src/routes/payments.ts`, `constants.ts:RATE_TABLE` |
| **Email** | Resend | `services/api/package.json:resend`, `src/lib/mailer.ts` |
| **Frontend (Web)** | Next.js 14.2 (App Router) + React 18 | `apps/website/package.json`, `apps/admin/package.json` |
| **Styling** | Tailwind CSS 3.4 + Custom HSL Design Tokens | `apps/website/src/app/globals.css`, `apps/admin/src/app/globals.css` |
| **UI Kit** | Custom components (Button, Card, Badge, Input) — shadcn-inspired | `apps/website/src/components/ui/*.tsx` |
| **Fonts** | Newsreader (display) + Inter (body) via next/font | `apps/website/src/app/layout.tsx`, `globals.css:--font-*` |
| **Mobile** | Expo 56 (SDK 56) / React Native 0.85 / Expo Router | `apps/customer-app/package.json`, `apps/worker-app/package.json` |
| **Mobile Auth** | expo-secure-store (token) + axios interceptors | `apps/customer-app/src/context/AuthContext.tsx`, `src/api/client.ts` |
| **CI/CD** | GitHub Actions (secret-guard → lint → build) | `.github/workflows/ci.yml` |
| **Deploy (API)** | Render (auto-deploy from main) | `AGENTS.md` |
| **Deploy (Web)** | Vercel (auto-deploy from main) | `AGENTS.md`, Vercel project IDs in AGENTS.md |

---

## 3. Key Configuration Files (Verified)

| File | Purpose | Critical Details |
|------|---------|------------------|
| `services/api/prisma/schema.prisma` | **Database Schema** | 6 models: User, Worker, Booking, Payment, WorkerPayout, WaitlistEntry. Enums: WorkerType, BookingMode, BookingStatus, PaymentStatus, PayoutStatus. JWT_SECRET required at startup (throws if missing). |
| `services/api/src/lib/constants.ts` | **Pricing Source of Truth** | `RATE_TABLE: { home_help: 199, driver: 149 }` — server-side only |
| `services/api/src/index.ts` | **API Entry + Routing** | Express + Socket.io server, global rate limit (100/min), auth limit (10/min), CORS allowlist, Sentry init |
| `services/api/src/middleware/auth.ts` | **Auth Guards** | `authMiddleware` (JWT from cookie or Bearer), `adminMiddleware` (checks `isAdmin`) |
| `services/api/src/routes/auth.ts` | **Email/Password Auth** | Register, login, me, logout, forgot/reset password (hashed token, 1h TTL). **bcrypt cost 10**. httpOnly cookie + token in body. |
| `services/api/src/routes/bookings.ts` | **Booking Lifecycle** | Create, list (owner), admin list (paginated), available (worker), worker list, detail (OTPs for owner), cancel, assign, start (OTP), complete (OTP+rating), generate-otp (admin) |
| `services/api/src/routes/payments.ts` | **Payment Flow** | create-order (server-computed amount, 15% platform fee, UPI QR default), verify (DB-backed signature check), mark-paid (admin), get-by-booking (owner/admin guard) |
| `services/api/src/routes/workers.ts` | **Worker CRUD + Eligibility** | GET list (public, restricted fields), GET available/:mode (auth, verified only), POST/PATCH (auth), GET :id (owner/admin) |
| `services/api/src/lib/eligibility.ts` | **Verification Gates** | `isWorkerEligible(mode, worker, {requireAvailable})` — Aadhaar for all, License + Aadhaar for driver |
| `apps/website/src/app/globals.css` | **Design System (HSL Tokens)** | `--accent: 160 84% 39%` (emerald), `--warm: 18 48% 54%` (clay), dark mode via `.dark` class, reduced-motion support |
| `apps/website/src/app/book/page.tsx` | **Customer Booking Flow** | 4-step wizard: Choose Mode → Details → Auth (email/password) → Confirm → creates booking via API |
| `apps/website/src/app/my-bookings/page.tsx` | **Customer Tracking** | Auth page, status timeline, worker card, **OTPs surfaced to customer** for worker handoff |
| `apps/website/src/app/worker/page.tsx` | **Worker Portal** | Auth page: Available Jobs (by mode), Accept (self-assign), Start (OTP), Complete (OTP+rating) |
| `apps/admin/src/components/Sidebar.tsx` | **Admin Nav** | Dark sidebar, gradient logo, dark/light toggle, logout |
| `apps/admin/src/app/dashboard/page.tsx` | **Admin Dashboard** | 6 stat cards, SVG bar chart (weekly revenue), donut chart (booking status), recent bookings table, skeletons |
| `apps/customer-app/src/context/AuthContext.tsx` | **Mobile Auth** | SecureStore token, login/register, auto-load on mount |
| `apps/customer-app/src/api/client.ts` | **Mobile API Client** | Axios + SecureStore interceptor, GET caching via AsyncStorage |
| `apps/worker-app/src/api/client.ts` | **Worker Mobile API** | Same pattern + expo-location + socket.io-client for real-time tracking |

---

## 4. Codebase Size Estimate

| Category | Files | Lines |
|----------|-------|-------|
| **Backend API** (src/, prisma/, scripts/) | ~75 | ~10,500 |
| **Website** (app/, components/, lib/) | ~120 | ~12,000 |
| **Admin Dashboard** (app/, components/, lib/) | ~95 | ~11,000 |
| **Customer App** (src/, app/) | ~80 | ~9,500 |
| **Worker App** (src/, app/) | ~75 | ~8,500 |
| **Config / CI / Root** | ~20 | ~1,400 |
| **Total (Source Only)** | **~465** | **~52,900** |

*Note: Excludes `node_modules`, `.next`, `dist`, `build`, generated Prisma client.*

---

## 5. Core Files for Phase 2 & 3 Deep Reading

### Must-Read (Architecture-Critical)

| Priority | File | Why |
|----------|------|-----|
| **P0** | `services/api/src/index.ts` | API composition, middleware stack, Socket.io bootstrap, rate limiting |
| **P0** | `services/api/prisma/schema.prisma` | Single source of truth for data model, relations, enums |
| **P0** | `services/api/src/lib/constants.ts` | Server-side pricing (immutable from client) |
| **P0** | `services/api/src/routes/auth.ts` | Auth flow, cookie security, password reset token design |
| **P0** | `services/api/src/middleware/auth.ts` | JWT verification, cookie/Bearer dual support, admin guard |
| **P0** | `services/api/src/routes/bookings.ts` | Full booking lifecycle, OTP gating, eligibility checks, field selection |
| **P0** | `services/api/src/routes/payments.ts` | UPI-first payment, Razorpay fallback, DB-backed signature verification, admin mark-paid |
| **P0** | `services/api/src/lib/eligibility.ts` | Worker verification gates (Aadhaar/License) — business logic core |
| **P0** | `apps/website/src/app/book/page.tsx` | End-to-end customer booking UX, inline auth, API integration |
| **P0** | `apps/website/src/app/my-bookings/page.tsx` | Customer tracking, OTP surfacing for worker handoff |
| **P0** | `apps/website/src/app/worker/page.tsx` | Worker self-service: browse → accept → start → complete |
| **P0** | `apps/admin/src/app/dashboard/page.tsx` | Admin analytics UI, charts, skeletons, real data integration |
| **P0** | `apps/customer-app/src/context/AuthContext.tsx` | Mobile auth state, SecureStore persistence |
| **P0** | `apps/customer-app/src/api/client.ts` | Mobile API client, token interceptor, offline GET caching |

### Important (Feature-Specific)

| Priority | File | Why |
|----------|------|-----|
| **P1** | `services/api/src/routes/workers.ts` | Worker CRUD, availability toggle, verification actions |
| **P1** | `services/api/src/routes/stats.ts` | Admin stats + weekly revenue (auth + admin guard) |
| **P1** | `services/api/src/routes/payouts.ts` | Weekly payout batches, mark-paid, filters |
| **P1** | `services/api/src/routes/users.ts` | Admin customer list + booking history modal |
| **P1** | `services/api/src/routes/waitlist.ts` | Email-validated waitlist persistence |
| **P1** | `apps/website/src/app/globals.css` | HSL design tokens, motion system, component utilities |
| **P1** | `apps/admin/src/components/Sidebar.tsx` | Admin shell, dark mode toggle, navigation |
| **P1** | `apps/admin/src/app/bookings/page.tsx` | Admin bookings: search, filter, paginate, assign modal |
| **P1** | `apps/admin/src/app/workers/page.tsx` | Admin workers: search, type filter, verify actions |
| **P1** | `apps/customer-app/src/app/(tabs)/bookings.tsx` | Customer mobile bookings list |
| **P1** | `apps/worker-app/src/app/(tabs)/jobs.tsx` | Worker mobile available jobs |
| **P1** | `apps/worker-app/src/app/(tabs)/active-job.tsx` | Worker mobile active job (OTP start/complete) |

### Peripheral (Skip Unless Debugging)

- `services/api/src/routes/health.ts` — trivial health check
- `services/api/src/lib/mailer.ts` — Resend wrapper
- `services/api/src/lib/redis.ts` — Upstash client
- `apps/website/src/components/sections/*.tsx` — Marketing blocks (Hero, Pricing, FAQ, Testimonials)
- `apps/website/src/components/ui/*.tsx` — Primitive UI components (Button, Card, Input, Badge, Textarea)
- `apps/admin/src/components/dashboard/*.tsx` — Chart components (StatCard, BarChart, DonutChart)
- Mobile screen files under `apps/*/app/(tabs)/*.tsx` — Individual screens (profile, earnings, etc.)
- CI/CD configs, secret-guard script, seed scripts

---

## 6. What Existing Docs Claim (Unverified — Flagged as Claims)

> **Source**: `AGENTS.md` (project handoff doc), `README` (if any), code comments

| Claim | Status | Evidence Needed |
|-------|--------|-----------------|
| "Full-stack model — we hire, train, verify, and manage workers ourselves" | **Claim** | Worker onboarding flow in code? Admin approval UI? |
| "Launching as single-city MVP (Kolkata)" | **Claim** | City filtering in booking/worker queries? |
| "Fee-free UPI payments (default)" | **Verified** | `payments.ts` builds UPI link when `UPI_VPA` set; Razorpay only if keys present |
| "15% platform fee, server-computed" | **Verified** | `payments.ts:69-70` computes from `RATE_TABLE` × duration |
| "JWT in httpOnly, secure, sameSite:lax cookies" | **Verified** | `auth.ts:64-68` sets cookie with those flags |
| "Email/password only — no Firebase dependency" | **Verified** | `auth.ts` uses bcrypt; `FIREBASE_SERVICE_ACCOUNT_KEY` / `FCM_SERVER_KEY` in `.env.example` marked unused |
| "Worker verification: Aadhaar for all, License for drivers" | **Verified** | `eligibility.ts`, `workers.ts`, `bookings.ts` assign gate |
| "Admin dashboard: dark sidebar, charts, skeletons" | **Verified** | `Sidebar.tsx`, `dashboard/page.tsx`, chart components |
| "Website: booking flow + customer tracking + worker portal" | **Verified** | `/book`, `/my-bookings`, `/worker` pages exist and wired |
| "Mobile apps: 6 screens each, Expo 56, secure-store auth" | **Verified** | Package.json, AuthContext, tab navigator structure |
| "Real-time worker location via Socket.io" | **Partial** | `socket.ts` exists, worker app imports `socket.io-client` + `expo-location` |
| "CI: secret-guard prevents server secrets in client bundles" | **Verified** | `.github/workflows/ci.yml` runs `secret-guard.mjs` pre/post build |
| "Local signed APK builds (no Expo/EAS account)" | **Claim** | AGENTS.md documents keystore path, gradle fixes — needs manual verify |
| "SENTRY_DSN wired but not set" | **Verified** | `index.ts:39-46` initializes only if DSN present |
| "Security checklist enforced on every change" | **Claim** | `SECURITY_CHECKLIST.md` exists; CI doesn't visibly enforce it |

---

## 7. Observations for Later Phases

1. **Auth Duality**: Web uses httpOnly cookies; mobile uses Bearer + SecureStore. Admin uses same cookie pattern as website. No shared session store — tokens are stateless JWT.
2. **Cookie Domain Gap**: `vercel.app` + `onrender.com` are different registrable domains → cookies are third-party in Chrome. Documented as deferred until custom domain.
3. **Pricing Immutability**: `RATE_TABLE` in `constants.ts` is the only pricing source. No DB-backed pricing, no surge engine yet (Phase 2 item).
4. **OTP Flow**: OTPs generated by admin only (`generate-otp` endpoint), emailed to customer, customer shares with worker. Worker never receives OTP via API — only via customer. Verified in `bookings.ts:CUSTOMER_FIELDS` vs `BOOKING_SAFE_FIELDS`.
5. **Payment Idempotency**: `create-order` reuses existing payment record for booking (prevents duplicate UPI QRs).
6. **Worker Eligibility Centralized**: `eligibility.ts` is single gate for assign/available/activate — good architecture.
7. **Design System Maturity**: HSL tokens, cubic-bezier motion curve, reduced-motion, dark mode flash-prevention — production-grade.
8. **CI Secret Guard**: Scans both source and built bundles — prevents accidental `process.env` leakage to client.
9. **No Test Coverage Visible**: `vitest` configured in API only (`auth.test.ts`, `eligibility.test.ts`). No E2E or integration tests in CI.
10. **Mobile Build Complexity**: Documented NDK/CMake/gradle fixes for Windows + RN 0.85 New Architecture — fragile; any `expo prebuild` requires re-applying patches.

---

## 8. Recommended Phase 2 Focus Areas

1. **Auth & Session Deep Dive** — Cookie vs Bearer, token refresh (none currently), logout race conditions.
2. **Booking State Machine** — Validate all transitions in `bookings.ts` against `BookingStatus` enum; check for race on concurrent assign/start.
3. **Payment Verification Security** — DB-backed signature check is correct; verify idempotency and replay protection.
4. **Worker Verification Flow** — How does admin verify Aadhaar/License? UI exists (`workers/page.tsx` Verify actions) but backend flow?
5. **Real-time Location** — Socket.io events, auth on connection, worker location updates, customer tracking view.
6. **Admin RBAC** — Only `isAdmin` boolean; no granular roles. Check all admin routes use `adminMiddleware`.
7. **Rate Limiting Coverage** — Auth routes (10/min), OTP generate (5/min), global (100/min). Missing: booking create, payment create.
8. **Error Handling Consistency** — All routes log with `[route] action error:` prefix; good for log search.

---

**End of Phase 1 Discovery Report**  
*Next: Phase 2 — Deep Architecture & Security Review (read P0 files in full)*