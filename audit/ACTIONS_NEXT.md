# HomeHelp — ACTIONS_NEXT

## Priority 1: Core User Experience Fixes (URGENT)

### 1.1 Mobile Table Responsiveness
**Effort**: Medium (2-3 days) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Implement responsive design for mobile (<768px) tables in all data grids

1. **Update Admin Bookings Table**
   - Modify `apps/admin/src/app/bookings/page.tsx` to implement horizontal scrolling
   - Add mobile-optimized card view for critical columns
   - Hide non-essential columns on mobile, show in expandable details

2. **Update Admin Workers Table**
   - Modify `apps/admin/src/app/workers/page.tsx` for mobile responsiveness
   - Convert status badges and action buttons to mobile-friendly format
   - Add inline action buttons instead of dropdown menus

3. **Update Customer Mobile Bookings**
   - Refactor `apps/customer-app/src/app/(tabs)/bookings.tsx` to fix table layout
   - Implement cards instead of table rows on mobile
   - Add mobile-specific status indicators and action flows

4. **Update Worker Mobile Jobs**
   - Modify `apps/worker-app/src/app/(tabs)/jobs.tsx` for mobile UX
   - Convert job listings to card format with expanded details
   - Add mobile-optimized job action buttons

**Files Changed**:
- `apps/admin/src/app/bookings/page.tsx`
- `apps/admin/src/app/workers/page.tsx`
- `apps/customer-app/src/app/(tabs)/bookings.tsx`
- `apps/worker-app/src/app/(tabs)/jobs.tsx`
- Update `apps/admin/src/styles/globals.css` with responsive table utilities

### 1.2 OTP Auto-Refresh System
**Effort**: Large (1-2 weeks) | **Free-Tier Feasibility**: ✅ WebSocket + Redis (free tier compatible)

**Task**: Implement real-time OTP updates to eliminate manual copying

1. **Backend Implementation**
   - Add WebSocket events to `services/api/src/socket.ts` for OTP generation notifications
   - Update `services/api/src/lib/redis.ts` to implement OTP polling cache
   - Add `/api/bookings/:id/opt-refresh` endpoint for manual OTP refresh
   - Implement Redis pub/sub for real-time OTP updates

2. **Frontend Integration**
   - Add background polling to `apps/website/src/app/my-bookings/page.tsx`
   - Implement WebSocket connection in customer app for real-time updates
   - Add loading states and error handling for polling failures
   - Cache recent OTP requests to reduce API calls

3. **Testing**
   - Add integration tests for WebSocket OTP notifications
   - Test offline scenarios with local storage fallback
   - Verify retry logic for failed polling requests

**Files Changed**:
- `services/api/src/socket.ts`
- `services/api/src/lib/redis.ts`
- `services/api/src/routes/bookings.ts`
- `apps/website/src/app/my-bookings/page.tsx`
- `apps/customer-app/src/context/AuthContext.tsx`
- `apps/customer-app/src/api/client.ts`

### 1.3 Authentication Security Hardening
**Effort**: Medium (1 week) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Fix mixed authentication approach with JWT security issues

1. **Backend Security Fixes**
   - Remove JWT from response body in `services/api/src/routes/auth.ts`
   - Keep only httpOnly cookie for session token
   - Add Secure flag for production environments
   - Implement sameSite: 'strict' for enhanced security
   - Add logout endpoint that clears all session storage

2. **Frontend Cleanup**
   - Remove Bearer token storage from mobile auth contexts
   - Update all mobile auth flows to rely on cookies
   - Add comprehensive logout handling across all platforms
   - Update API clients to not include Bearer tokens in requests

3. **Testing**
   - Add security tests for authentication endpoints
   - Test logout flow across all platforms
   - Verify httpOnly cookie settings

**Files Changed**:
- `services/api/src/routes/auth.ts`
- `services/api/src/middleware/auth.ts`
- `services/api/src/socket.ts`
- `apps/website/src/lib/auth.ts`
- `apps/customer-app/src/context/AuthContext.tsx`
- `apps/worker-app/src/context/AuthContext.tsx`
- `apps/admin/src/lib/auth.ts`

## Priority 2: Security Hardening (IMMEDIATE)

### 2.1 Email Enumeration Protection
**Effort**: Small (1 day) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Prevent email existence disclosure via waitlist endpoint

1. **Update Waitlist Endpoint**
   - Modify `services/api/src/routes/waitlist.ts` to always return 201
   - Remove email validation check from endpoint logic
   - Move duplicate prevention to database unique constraint
   - Add internal logging for security monitoring

2. **Testing**
   - Test waitlist signup with existing email
   - Verify consistent 201 response
   - Ensure database constraints still enforce uniqueness

**Files Changed**:
- `services/api/src/routes/waitlist.ts`

### 2.2 Worker Eligibility Logic Fix
**Effort**: Small (1 day) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Fix boolean null handling in worker verification logic

1. **Update Eligibility Service**
   - Fix `services/api/src/lib/eligibility.ts` to properly handle undefined values
   - Add proper type checking for driver license verification
   - Add comprehensive logging for debugging

2. **Testing**
   - Add tests for null/undefined license verification
   - Verify worker eligibility decisions
   - Test edge cases for eligibility scenarios

**Files Changed**:
- `services/api/src/lib/eligibility.ts`

### 2.3 Rate Limiting Implementation
**Effort**: Medium (2-3 days) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Implement consistent per-route rate limiting

1. **Update Rate Limiter**
   - Refactor `services/api/src/index.ts` to use configurable rate limiter
   - Add route-specific limits for critical operations (create, assign)
   - Implement sliding window algorithm for accurate rate limiting
   - Add Redis-based rate limiting for distributed systems

2. **Update Critical Endpoints**
   - Add rate limits to `POST /api/bookings` (10/min)
   - Add rate limits to `PATCH /api/bookings/:id/assign` (5/min)
   - Keep existing limits for auth (10/min) and OTP (5/min)

3. **Testing**
   - Test rate limiting behavior across endpoints
   - Verify distributed rate limiting
   - Test sliding window algorithm

**Files Changed**:
- `services/api/src/index.ts`
- `services/api/src/lib/rateLimit.ts` (new)

## Priority 3: Memory and Resource Management

### 3.1 Socket.io Connection Cleanup
**Effort**: Small (1 day) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Fix memory leak in Socket.io connection management

1. **Update Socket Server**
   - Modify `services/api/src/socket.ts` to clean up disconnected sockets
   - Add interval cleanup for stale connections
   - Implement connection pooling for better resource management
   - Add Redis store for persistent connection state

2. **Testing**
   - Test connection cleanup on disconnect
   - Verify memory usage patterns
   - Test connection recovery scenarios

**Files Changed**:
- `services/api/src/socket.ts`

### 3.2 Database Query Optimization
**Effort**: Medium (3-5 days) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Fix N+1 query patterns in critical endpoints

1. **Update Booking Endpoint**
   - Optimize `services/api/src/routes/bookings.ts` to eager-load worker/payment data
   - Implement select queries to only fetch needed fields
   - Add query caching for frequently accessed data

2. **Update Admin Stats**
   - Optimize `services/api/src/routes/stats.ts` for batched aggregations
   - Combine multiple independent queries into single requests
   - Implement materialized views for heavy analytics

3. **Testing**
   - Add query performance tests
   - Verify fix eliminates N+1 patterns
   - Test batched query performance

**Files Changed**:
- `services/api/src/routes/bookings.ts`
- `services/api/src/routes/stats.ts`

## Priority 4: Code Quality and Infrastructure

### 4.1 Error Handling Improvements
**Effort**: Small (1 day) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Add error boundaries and improve error handling

1. **Update Error Middleware**
   - Add global error boundary in `services/api/src/middleware/error.ts`
   - Implement consistent error response format
   - Add structured error logging
   - Implement error categorization for better monitoring

2. **Testing**
   - Add error boundary tests
   - Test error response formats
   - Verify comprehensive error logging

**Files Changed**:
- `services/api/src/middleware/error.ts` (new)

### 4.2 Startup Validation
**Effort**: Small (1 day) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Add critical service validation at startup

1. **Update Server Entry**
   - Add Redis connectivity check in `services/api/src/index.ts`
   - Add database migration validation
   - Add JWT secret validation
   - Implement graceful failure handling

2. **Testing**
   - Test startup validation
   - Test graceful failure scenarios
   - Verify error messages are clear

**Files Changed**:
- `services/api/src/index.ts`

## Priority 5: UI/UX Refinements (After Core Fixes)

### 5.1 Color System Consistency
**Effort**: Medium (1 week) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Standardize HSL design tokens across all applications

1. **Create Shared Design Tokens**
   - Extract HSL values to common source (`apps/shared/design-tokens.ts`)
   - Update all applications to use shared tokens
   - Ensure consistent color contrast ratios
   - Add color mode detection and persistence

2. **Update Components**
   - Update Button, Card, Badge components across apps
   - Add consistency checks and validation
   - Update dark mode implementations

**Files Changed**:
- Create `apps/shared/design-tokens.ts`
- Update `apps/website/src/app/globals.css`
- Update `apps/admin/src/app/globals.css`

### 5.2 Component Library Standardization
**Effort**: Medium (1-2 weeks) | **Free-Tier Feasibility**: ✅ Code-only changes

**Task**: Standardize component APIs and behaviors across applications

1. **Implement Common Component Library**
   - Create shared component library with consistent APIs
   - Add wrapper components for application-specific needs
   - Ensure consistent focus states and accessibility
   - Add comprehensive documentation

2. **Update Applications**
   - Update all applications to use shared components
   - Remove duplicate component implementations
   - Add migration path for deprecated components

**Files Changed**:
- Create `apps/shared/components/Button.tsx`
- Create `apps/shared/components/Card.tsx`
- Update all application component imports

## Strategic Direction Summary

**The single most critical strategic direction for HomeHelp is fixing the mobile experience first.** The current horizontal table scrolling on mobile renders the app practically unusable, which is a fatal UX flaw for a marketplace platform. Without addressing this fundamental issue, all other improvements will fail to deliver value.

**Why this matters**: The booking platform relies on users being able to easily view and manage their bookings. If the mobile experience is broken, customer retention will suffer immediately. The core booking flow (website) works well, but the mobile support is the weak link that needs immediate attention before any further scaling or feature additions.

**Implementation approach**: Start with mobile table responsiveness, then address OTP auto-refresh (a major friction point in the handoff flow), then secure the authentication system. These three priorities attack the biggest problems: usability, friction, and security. After these are resolved, the platform can scale properly and additional features can be added with confidence.