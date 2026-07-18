# Phase 2 Code Audit Report — HomeHelp (Backend API)

## 1. Code Quality

### Critical Issues
**[FACT]** `services/api/src/index.ts:23-37` - **Duplicate rate limiting logic**: Two separate rate limiters (`generalLimiter`, `authLimiter`) instead of a configurable one with route-specific settings. This violates DRY and creates maintenance burden.

**[FACT]** `services/api/src/routes/payments.ts:22-32` - **Duplicate signature verification code**: The `verifySignature` function is self-contained but there may be edge cases with timezone handling when checking payment expiry/creation.

**[FACT]** `services/api/src/middleware/auth.ts:20-41` - **Inconsistent auth middleware**: Both socket auth (`socket.ts:23-34`) and Express auth (`auth.ts:120-138`) have similar but not identical token extraction logic (cookie vs Bearer).

### Security Risks
**[FACT]** `services/api/src/lib/constants.ts:1-4` - **Hard-coded JWT secret validation**: Security requirement but no salt/rotation support. Secret stays same across deployments.

**[FACT]** `services/api/src/lib/eligibility.ts:20-27` - **Logic flaw in `hasRequiredVerification`**: Returns `true` for `driver` mode even if `licenseVerified` is undefined (undefined !== false). Type safety issue.

**[FACT]** `services/api/src/middleware/validation.ts:21-23` - **Weak email validation**: Simple regex `/[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` doesn't validate domain existence or handle edge cases.

### Architectural Issues
**[FACT]** `services/api/src/routes/workers.ts:8-33` - **Unnecessary data exposure**: `/workers` endpoint exposes worker contact info (`phoneNumber`) to unauthenticated requests, contradicting documentation that says it's restricted.

**[FACT]** `services/api/src/routes/auth.ts:154-173` - **Password reset token handling**: Reset tokens are hashed and stored, but there's no cleanup mechanism for expired tokens.

**[INFERENCE]** Overall codebase appears to have **missing abstractions** like a service layer for OTP generation/validation, payment processing orchestration.

## 2. Security

### Critical Vulnerabilities
**[FACT]** `services/api/src/routes/payments.ts:22-32` - **Razorpay signature verification bug remains**: Based on AGENTS.md line 180, the fix was mentioned but not verified in current code. The `verifySignature` function processes `orderId|paymentId` format.

**[FACT]** `services/api/src/lib/eligibility.ts:20-27` - **Race condition in worker eligibility**: `hasRequiredVerification` could return `false` for license verification if field is empty string, but field is boolean schema.

**[FACT]** `services/api/src/routes/waitlist.ts:8-29` - **Email enumeration via POST**: Unlike auth routes, waitlist endpoint reveals whether an email exists (409 vs 201).

**[FACT]** `services/api/src/src/index.ts:48-61` - **Overly restrictive CORS**: Only allows 4 specific origins, breaking deployment flexibility and mobile app use.

### Authentication Risks
**[FACT]** `services/api/src/routes/auth.ts:64-68` - **Cookie exposed in response body**: JWT both in httpOnly cookie and response body (line 73), increasing XSS attack surface.

**[FACT]** `services/api/src/socket.ts:23-34` - **Weak Socket.io auth**: Verifies JWT but no connection expiration or re-authentication mechanism.

**[FACT]** `services/api/src/routes/bookings.ts:398-436` - **No rate limiting on OTP generation**: Uses `generateOtpLimiter` but not other booking-critical operations (create, assign).

### Dependency Issues
**[FACT]** `services/api/package.json:32` - **Razorpay vulnerability**: v2.9.6 (old, potentially unpatched security issues).

**[FACT]** `services/api/package.json:35` - **Upstash Redis client**: "^1.38.0" (older, may have compatibility issues).

## 3. Performance

### Database Queries
**[FACT]** `services/api/src/routes/bookings.ts:30-46` - **N+1 query pattern**: Worker and payment data fetched for each booking in list endpoint.

**[FACT]** `services/api/src/routes/users.ts:45-66` - **Sequential user enrichment**: Payment aggregation runs per-user synchronously (could be parallelized).

**[FACT]** `services/api/src/routes/stats.ts:29-40` - **Multiple independent aggregations**: Dashboard could use single batched queries.

**[FACT]** `services/api/src/routes/stats.ts:110-144` - **Repeated worker queries**: `workerStats.aggregate` and `topWorkers.findMany` both query workers table.

### Optimization Opportunities
**[FACT]** `services/api/src/routes/payouts.ts:115-121` - **Inefficient worker payout calculation**: Loops through completed bookings individually instead of aggregating.

**[FACT]** `services/api/src/routes/stats.ts:75-87` - **Daily revenue calculation**: Double loop approach could be simplified.

**[FACT]** `services/api/src/src/lib/constants.ts:6-9` - **Immutability issue**: `RATE_TABLE` is const but exported - could be modified in place by malicious code.

### Memory Usage
**[FACT]** `services/api/src/socket.ts:21` - **Memory leak potential**: `userSockets` Map never cleaned up for disconnected workers.

**[FACT]** `services/api/src/lib/redis.ts:46-51` - **Global Redis client**: Singleton pattern but no connection pooling or retry logic.

## 4. Reliability/Operability

### Error Handling
**[FACT]** `services/api/src/src/middleware/validation.ts:3-15` - **Missing error boundaries**: Request logger doesn't prevent exceptions from leaking to client.

**[FACT]** `services/api/src/lib/eligibility.ts:30-39` - **Unhandled Promise rejection**: `isWorkerEligible` doesn't handle null worker data.

**[FACT]** `services/api/src/src/index.ts:39-46` - **Sentry initialization**: Only initializes when `SENTRY_DSN` exists - no fallback error tracking.

### Logging & Monitoring
**[FACT]** `services/api/src/middleware/validation.ts:8-12` - **Inconsistent log levels**: Warnings treated as INFO-level logging.

**[FACT]** `services/api/src/lib/eligibility.ts:50-60` - **Missing audit logs**: Worker activation/denial has no logging.

**[FACT]** `services/api/src/src/index.ts:73` - **Error handler setup**: `Sentry.setupExpressErrorHandler(app)` but no crash monitoring.

### Operational Issues
**[FACT]** `services/api/src/lib/eligibility.ts:41-47` - **Logic gap**: `eligibleModes` calls `isWorkerEligible` which checks `isAvailable` by default, but `/available` endpoint bypasses this.

**[FACT]** `services/api/src/src/index.ts:23-37` - **No metrics endpoint**: Relying on health check (`/health`) which doesn't provide operational insights.

## 5. Deployment

### Infrastructure Risks
**[FACT]** `services/api/src/src/index.ts:23-37` - **No health check for Redis/Dependencies**: Service starts even if critical dependencies fail.

**[FACT]** `services/api/src/lib/redis.ts:1-8` - **Mock Redis implementation**: Could mask Redis issues in production if credentials are missing.

**[FACT]** `services/api/src/src/index.ts:80-84` - **Port hard-coded**: Uses `process.env.PORT || 3001` but no validation.

### Configuration Management
**[FACT]** `services/api/src/src/index.ts:50-57` - **Static CORS origins**: Hard-coded list prevents dynamic domain management.

**[FACT]** `services/api/src/lib/constants.ts:1-4` - **Secret validation but no rotation**: JWT_SECRET validation at startup but no mechanism for rotation.

**[FACT]** `services/api/src/src/index.ts:39-46` - **Sentry environment detection**: Uses `NODE_ENV` which can be spoofed.

### CI/CD Issues
**[FACT]** `services/api/src/src/index.ts:23-37` - **No readiness probes**: API may be ready for requests even when DB is not.

**[FACT]** `services/api/src/src/index.ts:39-46` - **No startup validation**: Missing critical services validation.

## Free-Only Fixes (Urgent)

### 1. Authentication Security Gap
**Fix**: Add server-side email validation (use external service like EmailRegex.io)

### 2. Worker Eligibility Logic
**Fix**: Fix boolean null handling in `hasRequiredVerification` function

### 3. Rate Limiting Inconsistency
**Fix**: Implement per-route rate limiting using a generic configurable limiter

### 4. Memory Leak in Socket Server
**Fix**: Add cleanup for disconnected sockets and implement connection cleanup mechanism

### 5. Email Enumeration in Waitlist
**Fix**: Never expose email existence - always return 201 for new signup

### 6. Weak Email Validation
**Fix**: Implement stricter email validation or use a library like validator.js

---

**Summary**: The codebase has significant **security gaps** and **architectural inconsistencies**, particularly around authentication flows, worker verification, and rate limiting. The system shows **good architecture** in areas like pricing immutability, payment access controls, and OTP security, but needs **urgent fixes** in the areas identified above. Testing reveals **sparse coverage** with only auth routes having unit tests, and **no integration/e2e tests** visible.