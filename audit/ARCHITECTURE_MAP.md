# HomeHelp — ARCHITECTURE_MAP

## System Architecture Overview

HomeHelp is a multi-tier microservices-style architecture built as a monorepo, with clear separation of concerns between the backend API, admin dashboard, customer website, and mobile applications.

**High-Level Architecture**:
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Mobile Apps    │    │   Backend API    │    │  Vercel/Vercel  │
│  (Expo/React   │───▶│ (Express/Types ┐│───▶│   (Static/Web  │
│   Native)      │    │    Script)      │    │  SSR)           │
└─────────────────┘    │                 │    └─────────────────┘
                       │  ┌─────────────────┐
                       │  │  Neon Postgres  │
                       │  │   (serverless)  │
                       │  └─────────────────┘
                       │         │
                       │  ┌─────────────────┐
                       │  │  Upstash Redis  │
                       │  │   (OTP/Cache)   │
                       │  └─────────────────┘
                       │         │
                       │  ┌─────────────────┐
                       │  │   Resend SMTP    │
                       │  │   (Email)        │
                       │  └─────────────────┘
                       └──────────────────┘
```

## Data Flow

### 1. Customer Journey
1. **Customer** (Web/Mobile) → `/api/auth/login` → JWT cookie / Bearer token
2. **Customer** → `/api/bookings` (create) → Validate RATE_TABLE → Store booking
3. **System** (admin) → `/api/bookings/:id/generate-otp` → Create/verify OTP in Redis
4. **Customer** → `/my-bookings` → Get booking with OTPs for worker sharing
5. **Worker** → `/api/bookings/:id/start` → Verify OTP + update booking status
6. **Worker** → `/api/bookings/:id/complete` → Verify OTP + rating + payment

### 2. Payment Flow
```
Customer → /api/payments/create-order → Server: Compute amount (15% fee) → UPI QR / Razorpay order
                  ↓
System (admin) → /api/payments/:id/mark-paid (manual verification) → Mark payment as completed
```

### 3. Worker Management
```
Worker App → /api/workers POST → Auth check → Create worker profile
            ↓
System (admin) → /workers/:id PATCH → Update verification (Aadhaar/License)
            ↓
Customer/Worker Apps → /api/workers/available/:mode → Get eligible workers (verified only)
            ↓
Booking System → Eligibility check (`eligibility.ts`) → Only eligible workers can be assigned
```

## Core Services and Modules

### Backend API (`services/api/src/`)

#### Authentication & Authorization
- **Auth Service** (`src/routes/auth.ts`): Email/password auth, JWT tokens, password reset
- **Auth Middleware** (`src/middleware/auth.ts`): HTTPBearerAuth, admin role checking
- **Socket Auth** (`src/socket.ts`): Worker connection tracking
- **Rate Limiter** (`index.ts:23-37`): Global (100/min) + auth (10/min) throttling

#### Booking Core
- **Booking Service** (`src/routes/bookings.ts`): Full lifecycle (create/assign/start/complete/cancel)
- **OTP Service**: Redis-based OTP generation/validation, expiry cleanup
- **Eligibility Service** (`src/lib/eligibility.ts`): Worker verification gates
- **Constants** (`src/lib/constants.ts`): RATE_TABLE immutability

#### Payments
- **Payment Service** (`src/routes/payments.ts`): UPI QR generation, Razorpay fallback, admin confirmation
- **Signature Verification**: DB-backed Razorpay verification
- **Webhooks**: Payment state synchronization

#### Business Intelligence
- **Stats Service** (`src/routes/stats.ts`): Dashboard metrics, weekly revenue
- **Payout Service** (`src/routes/payouts.ts`): Worker payout processing, batch management

#### User Management
- **Waitlist Service** (`src/routes/waitlist.ts`): Email-validated waitlisting
- **User Service** (`src/routes/users.ts`): Admin customer management
- **Worker Service** (`src/routes/workers.ts`): Worker CRUD, verification actions

#### Infrastructure
- **Prisma Schema** (`prisma/schema.prisma`): Database migration management
- **Redis Client** (`src/lib/redis.ts`): Upstash integration
- **Mailer** (`src/lib/mailer.ts`): Resend integration
- **Error Handler** (`index.ts:73`): Sentry, logging, global error handling

### Frontend Applications

#### Website (`apps/website/`)
- **Routing System**: Next.js 14 App Router (`app/` directory)
- **Booking Wizard**: 4-step progressive disclosure (`book/page.tsx`)
- **Customer Tracking**: `/my-bookings` with status timeline and OTP display
- **Worker Portal**: `/worker` self-service interface
- **Design System**: HSL tokens, shadcn-inspired component library

#### Admin Dashboard (`apps/admin/`)
- **Navigation**: Dark sidebar with gradient logo
- **Dashboard**: 6 stat cards, SVG charts, recent bookings table
- **Management**: Bookings, Workers, Payouts, Customers sections
- **Components**: StatCard, BarChart, DonutChart, Modal, ErrorBoundary

#### Mobile Apps (`apps/customer-app/`, `apps/worker-app/`)
- **Auth Context**: `expo-secure-store` token management
- **API Client**: Axios with token interceptor, offline GET caching
- **Tabs**: Bottom tab navigation with multiple screens
- **Location Tracking**: Socket.io for real-time worker location

### External Integrations

#### Required (Must exist for functionality)
1. **PostgreSQL (Neon)**: Primary database, persistent storage
2. **Upstash Redis**: OTP caching, user session management
3. **Resend**: Email delivery for OTPs and notifications
4. **Google Maps API**: For address autocomplete (requires payment)
5. **Razorpay**: Payment gateway (optional, keys-controlled)

#### Optional (Controller-dependent)
1. **Sentry**: Error tracking (DSN-wirable but unset)
2. **FCM Server Key**: Push notifications (unused, marked as removable)
3. **Firebase Service Account**: Previously used, now fully removed
4. **UPI VPA**: Payment processor (required for fee-free payments)
5. **Razorpay Keys**: Direct payment processing (optional, can be disabled)

## Deployment/Runtime Shape

### Backend API
- **Build**: `prisma generate && tsc` (TypeScript compilation)
- **Run**: Node.js via Render (auto-deploy from main branch)
- **Secrets**: environment variables from Render dashboard
- **Startup**: Express server with Socket.io, CORS filter, rate limiting
- **Health**: `/health` endpoint, no Redis/DB readiness checks

### Frontend Deployments
- **Website**: Vercel (auto-deploy from main)
- **Admin**: Vercel (auto-deploy from main, different project ID)
- **Root Directory**: Empty for all Vercel projects (builds from app subdirectory)
- **Environment Variables**: `NEXT_PUBLIC_API_URL` set to API endpoint

### Mobile Apps
- **Build**: Local signed APKs (no EAS)
- **Signing**: Shared keystore (`homehelp.keystore`) with `homehelp` alias
- **Build Fixes**: Custom Android project modifications for Windows + RN 0.85
- **Dependencies**: react-native-razorpay removed (native module incompatibility)

## Runtime Dependencies Analysis

### Application-Level Risks
1. **Single Point of Failure**: API hosted on Render (external to repo)
2. **Database Dependence**: Bookings, workers, payments all require DB connection
3. **Redis Optionality**: OTP and session caching uses Redis
4. **Browser Dependence**: Website functionality requires modern browser
5. **Native Build Fragility**: Custom NDK/CMake/gradle fixes required

### Infrastructure Dependencies
1. **Third-Party Services**: Google Maps, Razorpay, Sentry (optional controllers)
2. **CI/CD**: GitHub Actions with secret-guard prebuild
3. **Domain Resolution**: No custom domain, using `.vercel.app`/`.onrender.com`
4. **Geographic Lock**: Kolkata-specific copy, but no technical city filtering

## Risks and Weak Points

### Critical (Level 1)
1. **Mobile UX**: Horizontal table scrolling on mobile (≤768ऄ7) makes app unusable
2. **OTP Friction**: Manual copying, no auto-refresh, error-prone process
3. **Authentication Security**: JWT in response bodies + mixed cookie/bearer auth
4. **Email Enumeration**: Waitlist endpoint reveals email existence
5. **Rate Limiting**: Inconsistent (OTP has 5/min, others have none)

### High Risk (Level 2)
1. **Dependency Management**: react-native-razorpay removal creates legacy code
2. **Build Pipeline**: Complex Android project fixes required every `expo prebuild`
3. **Security Checklist**: Not enforced in CI/CD, pure documentation
4. **Color System**: Inconsistent HSL tokens between apps
5. **Poor Error Handling**: No error boundaries for critical paths

### Medium Risk (Level 3)
1. **Memory Leak**: Socket.io `userSockets` map never cleaned
2. **Performance**: N+1 queries in booking/worker endpoints
3. **N/A**: Function overloading and type conflicts
4. **N/A**: Missing audit logs for critical actions
5. **N/A**: Hard-coded CORS origins limit deployment flexibility

### Low Risk (Level 4)
1. **N/A**: Email validation could be stricter but functional
2. **N/A**: Some components could be more performant
3. **N/A**: Documentation over-promises on some features
4. **N/A**: Mobile features behind native app boundary
5. **N/A**: Browser compatibility issues for web payments

## Areas of Technical Strength

### Security
- JWT with httpOnly, secure, sameSite: 'lax' cookies
- Server-side pricing immutability (RATE_TABLE)
- Payment access guards with ownership validation
- Worker verification gates centralized
- Comprehensive error logging with searchable prefixes

### Architecture
- Centralized design system (HSL tokens)
- Service-oriented permission system
- Clean separation of concerns (auth, booking, payment)
- Single source of truth for business rules
- Consistent error handling patterns

### Code Quality
- TypedScript with strict type checking
- Prisma ORM for database management
- Component-based UI architecture
- CSS animations with cubic-bezier curve
- Reduced-motion and accessibility compliance

### Documentation
- Comprehensive AGENTS.md handoff document
- Named technical debt in Phase 2 audit
- Clear roadmap with implementation guidance
- Consistency checks between documentation and reality

## Technology Debt Areas

### Immediate (0-30 days)
1. Mobile responsiveness fixes
2. OTP workflow improvements
3. Authentication security hardening
4. Email enumeration protection
5. Worker eligibility logic bug

### Near-term (30-90 days)
1. Component library standardization
2. Performance optimizations
3. Color system consistency
4. Worker verification workflow completion
5. Address autocomplete implementation

### Long-term (90+ days)
1. Push notification integration
2. Offline support implementation
3. Native mobile navigation
4. Bulk action systems
5. Custom export functionality

## Service Boundaries and Data Protection

### Data Access Controls
- **Users**: Customer data only accessible to same user or admin
- **Workers**: Full profile only accessible to owner/admin; limited fields for public
- **Bookings**: OTPs visible only to owning customer; worker assignment via eligibility check
- **Payments**: Access requires booking ownership or admin status
- **Waitlist**: Email stored securely, duplicate prevention at DB level

### Cross-Service Security
- All HTTP endpoints require explicit auth middleware unless public
- Admin routes use `adminMiddleware` for role enforcement
- Socket.io authentication checks JWT validity
- Rate limiting applied per endpoint where critical
- CORS configured for specific origins only

## Resilience and Recovery

### Failure Points and Mitigations
1. **Redis Down**: OTP functionality affected, booking creation still works
2. **Database Migration**: System blocked until migration completes
3. **Email Service (Resend)**: Notifications fail but core functionality intact
4. **Razorpay**: Optional, UPI-first approach ensures payments work
5. **Frontend Build**: Vercel deploys from main, CI/CD ensures build validity

### Monitoring Capabilities
- Global error handling with error boundaries
- Sentry integration (configured but no DSN)
- Comprehensive logging with searchable prefixes
- Health check endpoint
- No metrics endpoint (analytics via `/api/stats/dashboard`)

## Scalability Considerations

### Horizontal Scaling
- Backend API designed for stateless operation
- Redis for session/data caching
- PostgreSQL for persistence
- Static frontend deployment
- Service separation allows independent scaling

### Performance Optimization
- CSS-only animations (no JS libraries)
- Component-based architecture
- Code splitting via Next.js dynamic imports
- Static site generation for marketing pages
- Mobile-optimized builds for both apps

## Future Extensibility

### Architecture Advantages
- Monorepo allows shared code (auth, components, types)
- Clear service boundaries for individual scaling
- Database-agnostic via Prisma (could migrate)
- Frontend stable across versions
- CI/CD pipeline prevents secret leakage

### Extension Points
- Webhook architecture for third-party integration
- Event-driven architecture via Socket.io
- Modular plugin system for future features
- External API integration patterns
- Automated CI/CD for new services