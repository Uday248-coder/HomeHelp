You are coding the HomeHelp two-sided marketplace platform. Here's the complete architecture and specifications:

## SYSTEM ARCHITECTURE & REQUIREMENTS

**Backend API** (`services/api/`):
- Node.js + Express + TypeScript
- PostgreSQL (Neon) + Upstash Redis
- JWT auth with httpOnly cookies + Bearer tokens
- 9 route modules: auth, bookings, workers, payments, stats, waitlist, payouts, users, health
- Rate limiting: global (100/min), auth (10/min)
- Features: OTP-based booking flow, UPI QR payments, worker verification (Aadhaar+License for drivers), 15% platform fee

**Website** (`apps/website/`):
- Next.js 14 App Router
- Customer journey: 4-step booking wizard
- Storage: Email/password auth (removed Firebase), localStorage token
- Pages: /book (booking), /my-bookings (tracking), /worker (worker portal), /join (worker signup)
- Design system: HSL tokens, cubic-bezier(0.16,1,0.3,1) animations, reduced-motion support

**Admin Dashboard** (`apps/admin/`):
- Next.js 14 with dark sidebar navigation
- 6 stat cards + SVG charts (weekly revenue, booking status donut)
- Bookings management: search, filter, paginate, assign workers, generate OTPs
- Workers management: search, type filter, verify Aadhaar/License
- Payouts: weekly batches, status filtering, mark-paid actions

**Mobile Apps** (`apps/customer-app/`, `apps/worker-app/`):
- Expo 56 + React Native 0.85
- Auth: `expo-secure-store` token management
- 6 screens each with tab navigation
- Worker app: location tracking via Socket.io
- Customer app: UPI QR payment flow

## CRITICAL ISSUES TO FIX

1. **Mobile UX**: Tables require horizontal scrolling on <768px
2. **OTP Friction**: Manual copying from email, no auto-refresh
3. **Security**: JWT exposure in response bodies, mixed auth strategies
4. **Email Enumeration**: Waitlist endpoint reveals email existence
5. **Worker Eligibility**: Bug in boolean null handling

## PRIORITIZED IMPLEMENTATION

**Phase 1 (urgency)**:
- Fix mobile table responsiveness (CSS-based)
- Implement OTP auto-refresh (WebSocket + polling)
- Secure authentication (standardize httpOnly cookies)

**Phase 2 (security)**:
- Fix email enumeration protection
- Fix worker eligibility logic
- Implement consistent rate limiting

**Phase 3 (UX improvements)**:
- Address autocomplete (Google Maps API)
- Color system consistency
- Component library standardization

## EXISTING CODEBASE PATTERNS

**Backend API Structure**:
- All `.ts` files use strict TypeScript
- Prisma schema in `services/api/prisma/schema.prisma`
- Routes in `services/api/src/routes/` with middleware in `src/middleware/`
- Error handling: all catch blocks log with `[route] action error:` prefix

**Website Structure**:
- App Router: `src/app/` directory
- Components: `src/components/ui/` (shadcn-inspired)
- Sections: `src/components/sections/` for marketing blocks
- Design tokens in `src/app/globals.css` with HSL custom properties
- Auth: `src/lib/auth.ts` with `homehelp_token` localStorage key

**Admin Dashboard Structure**:
- Similar to website but premium dark UI
- Components: `src/components/dashboard/` (StatCard, BarChart, DonutChart)
- Sidebar: `src/components/Sidebar.tsx` with dark/light toggle
- Login: `src/components/LoginScreen.tsx`

**Mobile Apps Structure**:
- Expo Router for navigation
- Auth Context: `src/context/AuthContext.tsx`
- API Client: `src/api/client.ts` with axios interceptor
- Native modules: `expo-secure-store`, `expo-location`, `socket.io-client`

## CODE PATTERNS TO FOLLOW

**Component Structure** (from `apps/website/src/components/ui/Button.tsx`):
```tsx
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className, loading })}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <Loader /> : null}
        {props.children}
      </button>
    )
  }
)
```

**CSS Pattern** (from website globals.css):
```css
:root {
  --accent: 160 84% 39%;        /* emerald green */
  --accent-hover: 160 72% 34%;
  --warm: 18 48% 54%;           /* clay accent */
  --surface: 0 0% 100%;         /* light mode surface */
  --surface-secondary: 210 20% 98%;
  --foreground: 210 16% 10%;
  --foreground-secondary: 210 10% 36%;
  --border: 210 14% 89%;
  --border-hover: 210 10% 62%;
  --shadow-md: 0 4px 16px -4px rgb(0 0 0 / 0.08);
}

.card-base {
  background: hsl(var(--surface));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.card-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px -10px rgb(0 0 0 / 0.12);
}
```

**Motion System**:
- All animations use `cubic-bezier(0.16, 1, 0.3, 1)`
- Micro feedback: 120-180ms (hover, active, focus)
- Standard transition: 180-260ms (card lift, nav scroll)
- Entry animation: 300-500ms (fade-in-up, scale-in)

**Accessibility Pattern**:
- Use aria-invalid, aria-describedby for validation
- Focus ring styles for all interactive elements
- Reduced motion support with `prefers-reduced-motion: reduce`

## SPECIFIC FILES TO MODIFY FOR MOBILE FIXES

**Admin Mobile Responsiveness**:
- `apps/admin/src/app/bookings/page.tsx` (booking table)
- `apps/admin/src/app/workers/page.tsx` (worker table)
- `apps/admin/src/styles/globals.css` (responsive utilities)

**Customer App Mobile**:
- `apps/customer-app/src/app/(tabs)/bookings.tsx` (booking list)
- `apps/customer-app/src/app/(tabs)/booking-detail.tsx` (single booking)

**Worker App Mobile**:
- `apps/worker-app/src/app/(tabs)/jobs.tsx` (available jobs)
- `apps/worker-app/src/app/(tabs)/active-job.tsx` (accept/ complete OTPs)

**Implementation Requirements**:
- Use Tailwind CSS for responsive utilities
- Implement CSS media queries for <768px
- Convert tables to cards with expandable details on mobile
- Maintain desktop experience unchanged
- Ensure all interactive elements remain accessible
- Add proper focus states for keyboard navigation

Please implement the mobile table responsiveness FIRST, then OTP auto-refresh, then authentication security fixes.

Make sure to:
1. Follow existing component patterns exactly
2. Use the established CSS architecture with HSL tokens
3. Implement proper accessibility
4. Follow the motion system with cubic-bezier easing
5. Remove warnings and fix lint issues
6. Maintain TypeScript strict compliance
7. Add error boundaries where critical
8. Implement all loading states and skeletons
9. Follow the security best practices
10. Document any new component APIs

This is a freelance expert task. Complete the critical fixes first and ensure production-ready quality.