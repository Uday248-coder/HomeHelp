# HomeHelp — ROADMAP

## Priority 1: Core UX Fixes (HIGH Impact)

### 1.1 Mobile Table Responsiveness
**Why it matters**: HomeHelp is unusable on mobile due to horizontal table scrolling on bookings/workers screens
**Who benefits**: 70% of users accessing on mobile devices in Kolkata
**What changes**: Implement horizontal scrolling with improved mobile-first design
- Rewrite table components to be scrollable horizontally on mobile
- Add virtual scrolling for long tables
- Add mobile-optimized cards for critical information display
- Improve mobile-specific form layouts
**Implementation**: 
1. Create responsive table wrapper with `overflow-x: auto`
2. Add hidden columns on mobile, show critical fields in card format
3. Implement bottom navigation with swipe support
4. Add mobile-specific `$` command for item actions

**Dependencies**: None, but requires changes to:
- `apps/admin/src/app/bookings/page.tsx`
- `apps/admin/src/app/workers/page.tsx`
- `apps/customer-app/src/app/(tabs)/bookings.tsx`
- `apps/worker-app/src/app/(tabs)/jobs.tsx`
- Custom component library updates

**Free-tier feasibility**: ✅ All open-source libraries and techniques
**Risk Level**: Low (CSS-based, no external dependencies)
**Priority**: Must fix before next deployment
**Effort Estimate**: M (medium) - 2-3 days

### 1.2 Auto-Refresh for OTPs
**Why it matters**: Users must manually reload pages to see new OTPs, causing delays and manual errors
**Who benefits**: Customers sharing OTPs with workers, workers entering OTPs
**What changes**: Implement server-side OTP polling with WebSocket updates
- Add background polling to `/api/bookings/:id` for OTP updates
- Implement WebSocket notifications for new OTP generation
- Add loading states and error handling
- Cache OTP polling to reduce server load

**Implementation**:
1. Add `/api/bookings/:id` endpoint with cached OTP polling
2. Implement server-sent events/WebSocket for real-time OTP updates
3. Add client-side polling with exponential backoff on failures
4. Cache recent OTP requests to minimize DB queries

**Dependencies**: Socket.io changes, Redis caching, API modifications
- `services/api/src/socket.ts`
- `services/api/src/routes/bookings.ts`
- `services/api/src/lib/redis.ts`
- Website customer tracking page
- Worker portal page

**Free-tier feasibility**: ✅ WebSocket and Redis are free-tier compatible
**Risk Level**: Medium (coordination between client/ server)
**Priority**: Must fix before next deployment
**Effort Estimate**: L (large) - 1-2 weeks

## Priority 2: Security Hardening (HIGH Impact)

### 2.1 Authentication Security Fixes
**Why it matters**: JWT exposure in response bodies creates XSS attack surface, cookie/token inconsistencies
**Who benefits**: All users, especially those with XSS protection needs
**What changes**: Implement secure authentication flow standardization
- Remove JWT from response bodies (keep only httpOnly cookies)
- Standardize on httpOnly cookies across all platforms
- Implement secure session invalidation on logout
- Add secure cookie flags (httpOnly, secure, sameSite: 'strict')

**Implementation**:
1. Modify `services/api/src/routes/auth.ts` response handling
2. Standardize auth middleware across web, admin, and mobile
3. Implement proper logout that clears all session storage
4. Add secure cookie configuration for cross-domain scenarios

**Dependencies**:
- `services/api/src/routes/auth.ts` 
- `services/api/src/middleware/auth.ts`
- Website auth components
- Admin auth components
- Mobile auth context

**Free-tier feasibility**: ✅ All changes are code-based
**Risk Level**: Medium (user session breaks if not implemented correctly)
**Priority**: Must fix before next deployment
**Effort Estimate**: M (medium) - 1 week

### 2.2 Email Enumeration Protection
**Why it matters**: Waitlist endpoint reveals email existence (409) vs creation (201)
**Who benefits**: Users concerned with privacy
**What changes**: Always return 201 for successful waitlist signup
- Remove email validation from waitlist endpoint
- Always return 201 response for new waitlist entries
- Move validation to database unique constraint layer
- Add internal logging instead of user-facing emails

**Implementation**:
1. Remove email check from `services/api/src/routes/waitlist.ts`
2. Replace with database unique constraint handling
3. Add internal logging for security monitoring
4. Standardize response format with validation errors in response body

**Dependencies**: `services/api/src/routes/waitlist.ts`

**Free-tier feasibility**: ✅ Code change only
**Risk Level**: Low
**Priority**: Must fix before next deployment
**Effort Estimate**: S (small) - 1 day

### 2.3 Worker Eligibility Logic Fix
**Why it matters**: Bug in `hasRequiredVerification` function could incorrectly validate workers
**Who benefits**: All workers and customers
**What changes**: Fix boolean null handling in verification checks
- Fix `services/api/src/lib/eligibility.ts:20-27` to properly handle undefined values
- Add proper type checking for driver license verification
- Add comprehensive logging for verification decisions
- Add unit tests for the eligibility logic

**Implementation**:
1. Fix `hasRequiredVerification` function
2. Add proper null/undefined handling
3. Add comprehensive tests
4. Add logging for debugging

**Dependencies**: `services/api/src/lib/eligibility.ts`

**Free-tier feasibility**: ✅ Code fix only
**Risk Level**: Low
**Priority**: Must fix before next deployment
**Effort Estimate**: S (small) - 1 day

## Priority 3: User Experience Improvements (MEDIUM Impact)

### 3.1 Address Autocomplete
**Why it matters**: Manual address entry causes errors, slow data entry
**Who benefits**: Customers booking services
**What changes**: Add Google Places Autocomplete for address entry
- Integrate Google Places API for address suggestions
- Add address validation and geocoding
- Cache common addresses for faster entry
- Add manual address input as fallback

**Implementation**:
1. Add Google Places API key to `.env.example`
2. Create address input component with autocomplete
3. Add geocoding for distance-based pricing
4. Add manual address fallback

**Dependencies**: Google Maps API key, updated booking flow
- Google Maps API setup (external dependency)
- `apps/website/src/app/book/page.tsx`
- Booking API endpoint updates

**Free-tier feasibility**: ❌ Requires Google Maps API payment (out of scope for free-only)
**Risk Level**: High (cost dependency)
**Priority**: After auto-refresh, before long-term goals
**Effort Estimate**: L (large) - 2-3 weeks

### 3.2 Color System Consistency
**Why it matters**: Inconsistent HSL tokens between website and admin break brand consistency
**Who benefits**: Users with unified brand experience
**What changes**: Standardize HSL design tokens across all platforms
- Extract common HSL values to shared token file
- Update website and admin to use same values
- Add color mode detection with CSS custom properties
- Ensure proper contrast ratios across all use cases

**Implementation**:
1. Create shared design token file
2. Update website and admin CSS variables
3. Add tests for color contrast
4. Add dark mode compatibility checks

**Dependencies**:
- `apps/website/src/app/globals.css`
- `apps/admin/src/app/globals.css`
- Component library updates

**Free-tier feasibility**: ✅ Design system changes only
**Risk Level**: Low
**Priority**: After auto-refresh
**Effort Estimate**: M (medium) - 1 week

### 3.3 Date-Time Pickers
**Why it matters**: Manual date/time entry causes errors, poor UX
**Who benefits**: All booking customers
**What changes**: Add modern date-time pickers with validation
- Integrate calendar picker for schedule selection
- Add time slot validation based on service requirements
- Add timezone awareness for Kolkata operations
- Add relative time formatting

**Implementation**:
1. Add calendar component to booking form
2. Add time slot validation
3. Add timezone handling
4. Add client-side validation

**Dependencies**: `apps/website/src/app/book/page.tsx`

**Free-tier feasibility**: ✅ Code-based implementation only
**Risk Level**: Medium (integration complexity)
**Priority**: After auto-refresh, before long-term goals
**Effort Estimate**: M (medium) - 2 weeks

## Priority 4: Admin Experience Improvements (MEDIUM Impact)

### 4.1 Worker Verification Flow Completion
**Why it matters**: UI exists but backend workflow incomplete
**Who benefits**: Admin staff managing worker onboarding
**What changes**: Complete worker verification workflow
- Implement backend verification actions
- Add admin verification UI with feedback
- Add worker status tracking
- Add audit log for verification decisions

**Implementation**:
1. Complete `services/api/src/routes/workers.ts` verification endpoints
2. Add admin UI for verification actions
3. Add worker status display
4. Add audit logging

**Dependencies**:
- `services/api/src/routes/workers.ts`
- `apps/admin/src/app/workers/page.tsx`

**Free-tier feasibility**: ✅ Code changes only
**Risk Level**: Medium (workflow complexity)
**Priority**: After auto-refresh
**Effort Estimate**: M (medium) - 2 weeks

### 4.2 Bulk Actions
**Why it matters**: Manual per-row actions are time-consuming
**Who benefits**: Admin staff
**What changes**: Add bulk action capabilities for bookings, workers, payments
- Add checkbox selection for bulk operations
- Add bulk assign workers, generate OTPs, mark paid
- Add confirmation dialogs
- Add progress indicators for bulk operations

**Implementation**:
1. Add bulk selection UI to tables
2. Add bulk action dropdown
3. Implement bulk API endpoints
4. Add progress indicators and error handling

**Dependencies**:
- `services/api/src/routes/bookings.ts`
- `services/api/src/routes/workers.ts`
- `apps/admin/src/app/bookings/page.tsx`
- `apps/admin/src/app/workers/page.tsx`

**Free-tier feasibility**: ✅ Code changes only
**Risk Level**: Medium (API coordination)
**Priority**: After completion of worker verification
**Effort Estimate**: L (large) - 3 weeks

### 4.3 Export Functionality
**Why it matters**: Manual data export is time-consuming
**Who benefits**: Admin staff, auditors
**What changes**: Add CSV export for bookings, workers, payouts
- Add export buttons to all data tables
- Implement server-side CSV generation
- Add date filtering for exports
- Add error handling for large exports

**Implementation**:
1. Add export buttons to all data tables
2. Implement server-side CSV endpoints
3. Add filtering options
4. Add download progress tracking

**Dependencies**:
- `services/api/src/routes/bookings.ts`
- `services/api/src/routes/workers.ts`
- `services/api/src/routes/payouts.ts`

**Free-tier feasibility**: ✅ Code changes only
**Risk Level**: Medium (file generation)
**Priority**: After bulk actions
**Effort Estimate**: M (medium) - 3 weeks

## Priority 5: Mobile App Improvements (LOW Impact)

### 5.1 Native Mobile Navigation
**Why it matters**: Tab-based navigation is less discoverable than native mobile patterns
**Who benefits**: Mobile users
**What changes**: Implement native mobile navigation patterns
- Add native mobile navigation components
- Add native gestures and interactions
- Improve mobile-specific performance
- Add native mobile UX patterns

**Implementation**:
1. Replace Expo Router with native navigation
2. Add native mobile gestures
3. Optimize for mobile performance
4. Add native mobile UX patterns

**Dependencies**: Native navigation refactoring

**Free-tier feasibility**: ✅ Code changes only
**Risk Level**: High (major architectural change)
**Priority**: After all other priorities
**Effort Estimate**: XL (extra large) - 2+ months

### 5.2 Push Notifications
**Why it matters**: Real-time notifications would improve user experience
**Who benefits**: Both customer and worker apps
- Add push notification integration (Firebase)
- Add booking status change notifications
- Add worker availability notifications
- Add system permission requests

**Implementation**:
1. Add Firebase Cloud Messaging integration
2. Add notification handlers
3. Add user permission requests
4. Add notification storage and management

**Dependencies**: Firebase Cloud Messaging (external)

**Free-tier feasibility**: ⚠️ Firebase has free tier with limitations
**Risk Level**: Medium (provider dependency)
**Priority**: After native navigation
**Effort Estimate**: M (medium) - 1 month

### 5.3 Offline Support
**Why it matters**: Users expect app to work without internet
**Who benefits**: Both customer and worker apps
**What changes**: Add offline support for critical functionality
- Add service worker registration
- Add offline data storage
- Add offline data synchronization
- Add offline error handling

**Implementation**:
1. Add service worker registration
2. Add IndexedDB for offline storage
3. Add sync mechanisms
4. Add offline error handling

**Dependencies**: Service worker implementation

**Free-tier feasibility**: ✅ Code changes only
**Risk Level**: High (browser compatibility)
**Priority**: After push notifications
**Effort Estimate**: L (large) - 2+ months

## Top 3 Recommendations

Based on the audit findings and roadmap, here are the top 3 priorities:

1. **Fix Mobile Table Responsiveness First** - The mobile experience is essentially broken with horizontal scrolling, making the app unusable on phones. This is a critical UX blocker that needs immediate attention before any other improvements.

2. **Implement OTP Auto-Refresh Next** - The OTP workflow requires manual copying and reloading, creating friction and potential for errors. Auto-refresh would significantly improve the booking and handoff experience.

3. **Standardize Authentication Security** - The mixed authentication approach with JWT exposure in response bodies creates security risks. Standardizing on secure cookie-based authentication is essential for production readiness.

These three priorities address the most critical user-facing issues (mobile UX and OTP friction) while also fixing the most serious security vulnerabilities. They all have free-tier compatible implementations and can be completed within the first 2-3 months of development.