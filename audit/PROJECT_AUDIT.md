# HomeHelp — PROJECT AUDIT

## Executive Summary
HomeHelp is a two-sided marketplace platform for home help services (cleaners, domestic workers) and driver booking services, operating in Kolkata as a single-city MVP. It's a full-stack model where the company handles hiring, training, verification, and management of workers. The platform includes a Next.js marketing website, admin dashboard, customer mobile app, and worker mobile app, backed by an Express.js TypeScript API with PostgreSQL (Neon), Upstash Redis, and email/password authentication.

**Current State**: All core features implemented including booking lifecycle, OTP-based verification, fee-free UPI payments, real-time worker tracking, and admin role management.

**Major Issues**: Security gaps in authentication flows, UX problems in mobile experience, significant discrepancies between documentation and implementation, missing core functionality (city filtering, auto-refresh), and technical debt in the codebase.

**Overall Grade**: C+ (Implementation is functional but lacks polish, security hygiene, and modern UX patterns)

## Architecture Overview
HomeHelp follows a microservices-friendly monorepo structure with distinct separation of concerns:

- **Backend API** (`services/api/`): Express.js server handling all business logic, authentication, payments, and booking lifecycle with JWT-based auth
- **Admin Dashboard** (`apps/admin/`): Next.js 14 admin interface for managing bookings, workers, payouts, and analytics
- **Website** (`apps/website/`): Next.js 14 marketing site with full booking flow (customer tracking, worker portal)
- **Mobile Apps** (`apps/customer-app/`, `apps/worker-app/`): React Native Expo 56 apps with secure auth and offline capabilities

**Data Flow**: Client apps → Backend API (REST + WebSocket) → PostgreSQL + Redis + Resend email service

## Module Breakdown

### Backend API (`services/api/`)
- **Authentication**: JWT with httpOnly cookies (web) and Bearer tokens (mobile)
- **Bookings**: Full CRUD lifecycle with OTP generation/entrance, worker assignment, status transitions
- **Workers**: Verification (Aadhaar for all, License for drivers), availability management, eligibility gating
- **Payments**: UPI QR generation (default), Razorpay fallback, 15% platform fee, admin confirmation
- **Stats**: Dashboard metrics, weekly revenue, worker analytics (admin-only)
- **Waitlist**: Email-validated customer waitlisting
- **Admin**: User management, payout processing, role-based access control
- **Messaging**: Socket.io for real-time worker location tracking

### Website (`apps/website/`)
- 4-step booking wizard: Service selection → Details → Authentication → Confirmation
- Customer tracking with 4-step status timeline and OTP display
- Worker self-service portal (accept jobs, enter OTPs, provide ratings)
- Waitlist integration and pricing display

### Admin (`apps/admin/`)
- Dark-themed dashboard with 6 stat cards and analytics charts
- Bookings management: search, filter, pagination, bulk actions
- Worker verification: Aadhaar/License verification, availability toggles
- Payouts processing: weekly batches, status filtering, manual approval

### Mobile (`apps/customer-app/`, `apps/worker-app/`)
- Expo 56 with native builds (no EAS)
- Auth via `expo-secure-store`
- Tab-based navigation with 6 screens per app
- Worker app includes location tracking via Socket.io
- Both apps support fee-free UPI QR payment flow

## UI/UX Audit

### Strengths
- Design system: HSL CSS tokens, cubic-bezier(0.16,1,0.3,1) animations, reduced-motion support
- Component quality: Semantic HTML, proper focus management, loading skeletons everywhere
- Authentication: Secure, persistent across all platforms
- Booking flow: Progressive disclosure with 4-step wizard

### Critical Issues
1. **Mobile Experience**: Tables require horizontal scrolling (<768px) - major UX blocker
2. **OTP Workflow**: Manual copying from email and re-typing, no auto-refresh mechanism
3. **Forms**: No date-time pickers, address autocomplete, or text area auto-resize
4. **Navigation**: Stick header works, but admin sidebar logo broken on mobile
5. **Color System**: Inconsistent HSL tokens between website and admin apps

### Documentation vs Reality
| Claim (AGENTS.md) | Reality |
|-------------------|----------|
| "Launching as single-city MVP (Kolkata)" | ❌ No city/location filtering implemented anywhere |
| "Full-stack model — hire/train/verify/manage workers" | ✅ Worker verification UI exists but backend flow incomplete |
| "Real-time worker location via Socket.io" | ⚠️ Socket.io exists but UI for location tracking missing |
| "Fee-free UPI payments (default)" | ✅ Implemented but QR appears before booking confirmation |
| "15% platform fee, server-computed" | ✅ Verified via RATE_TABLE in constants.ts |

## Code Quality Audit

### Critical Issues
1. **Duplicate Rate Limiting** (`index.ts:23-37`): Two separate limiters instead of configurable per-route
2. **Weak Email Validation** (`validation.ts:21-23`): Simple regex only, no domain validation
3. **Worker Eligibility Logic** (`eligibility.ts:20-27`): `hasRequiredVerification` returns `true` for undefined values (type safety)
4. **Memory Leak** (`socket.ts:21`): `userSockets` map never cleaned up on disconnect
5. **Email Enumeration** (`waitlist.ts:19-25`): 409 if email exists vs 201 for new signup

### Architectural Issues
- Missing service layer abstraction (OTP, payments, booking orchestration)
- N+1 query patterns in booking/worker endpoints
- Race conditions in booking status transitions
- Hard-coded CORS origins prevent deployment flexibility

## Security Audit

### Critical Vulnerabilities
1. **Razorpay Signature Verification**: Bug from previous session not verified in current code
2. **Cookie Exposure**: JWT in both httpOnly cookie AND response body (`auth.ts:73`)
3. **OTP Generation**: No rate limiting on critical booking operations (create, assign)
4. **CORS Restriction**: Only 4 specific origins allowed, breaks mobile usage
5. **Weak Password Reset**: No cleanup mechanism for expired reset tokens

### Security Hardening (Implemented)
- JWT with httpOnly, secure, sameSite: 'lax' cookies
- Server-side pricing via RATE_TABLE (no client tampering)
- Payment access guards (booking ownership checks)
- Worker verification gates (Aadhaar + License for drivers)
- Comprehensive error logging with searchable prefixes
- Secret-guard CI pipeline (prevents leakage to client bundles)

## Performance Audit

### Database Issues
1. **N+1 Queries**: Booking endpoints fetch worker/payment data per booking (`bookings.ts:30-46`)
2. **Sequential Aggregations**: Admin aggregations run loops per record (`stats.ts:110-144`)
3. **Inefficient Payouts**: `payouts.ts:115-121` loops through completed bookings individually
4. **Repeated Queries**: `stats.ts:110-144` runs workerStats and topWorkers queries separately

### Memory Issues
- Socket.io `userSockets` map never cleaned up on disconnect
- Global Redis client without connection pooling/ retry logic
- No readiness probes for critical dependencies

### Client Performance
- No bundle analysis performed
- Components appear inline in critical pages (potential optimization)

## Reliability/Operability Audit

### Error Handling Issues
- No error boundaries for request logger (`validation.ts:3-15`)
- Unhandled Promise rejections in `eligibility.ts:30-39`
- Sentry only initializes if DSN present (no fallback)
- No startup validation for critical services

### Monitoring Issues
- Only basic health check (`/health`) - no metrics endpoint
- Inconsistent log levels (warnings treated as INFO)
- Missing audit logs for worker activation/denial

## Deployment Audit

### Infrastructure Risks
- No health checks for Redis/Dependencies before startup
- Port hard-coded without validation (`3001`)
- Static CORS origins limit deployment flexibility
- JIT JWT secret validation at startup (no rotation)
- Mock Redis implementation could mask production issues

### CI/CD Issues
- No readiness probes
- Secret-guard exists but not visually enforced
- Security checklist not referenced in CI process

## Free-Only Constraint Analysis

### What Requires Payment
| Feature | Cost | Status |
|---------|------|----------|
| Google Maps API (autocomplete) | Paid API | ❌ Not implemented |
| Sentry Error Tracking | Pay-as-you-go | ⚠️ Wired but DS not set |
| Advanced Email Validation | Third-party APIs | ❌ Using simple regex |
| Advanced Email Validation | Third-party APIs | ❌ Weaker than needed |

### All Other Features: Implemented with Zero Direct Payment
- Email/password auth ✅
- OTP verification ✅
- UPI QR payments ✅
- Socket.io real-time ✅
- Design system ✅
- Mobile apps (local builds) ✅

## Recommended Fixes

### Immediate (0-1 month)
1. Fix worker eligibility logic (boolean null handling)
2. Implement per-route rate limiting with generic limiter
3. Clean up socket connections on disconnect
4. Implement email enumeration protection
5. Add server-side email validation

### Medium-term (1-3 months)
1. Address mobile table responsiveness (horizontal scroll)
2. Implement OTP auto-refresh
3. Add address autocomplete (Google Maps API)
4. Fix reactive component performance issues
5. Complete worker verification workflow

### Long-term (3-6 months)
1. Implement proper session management (refresh tokens)
2. Add webhook payments for real payment processing
3. Build worker heat map UI (Kolkata location insights)
4. Implement custom export functionality
5. Audit and fix Razorpay signature verification bug

## Final Verdict
HomeHelp is a fully-featured platform built with impressive technical depth and production-ready security practices, but suffers from significant UX gaps and architectural inconsistencies that would surface with user traffic. The mobile experience is particularly problematic, with tables requiring horizontal scrolling making the app practically unusable on small screens. The authentication flow is over-engineered with mixed cookie/bearer strategies and exposed session tokens in response bodies creating XSS risks. While the core business logic works well (pricing is server-side protected, OTP flow is secure, payments are fee-free), the product needs significant UX refinement and security patching before it can compete. The biggest issue is the gap between documentation claims (city-specific MVP, full-stack worker management) and reality (no city filtering, incomplete verification workflows). Immediate attention to mobile UX, OTP friction, and authentication security is critical before any further scaling.