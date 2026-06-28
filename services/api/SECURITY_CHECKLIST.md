# API Security Checklist

Every change to this API must satisfy the following checks before merging:

## Authentication & Authorization

- [ ] **Every new route has explicit auth** — uses `authMiddleware` (or has an explicit comment explaining why it's public, e.g. `/health`)
- [ ] **Admin routes use `adminMiddleware`** — any route that exposes all records or mutates state on behalf of others must check `isAdmin`
- [ ] **Caller identity verified** — every endpoint that mutates a booking or worker state checks `req.user` matches the resource being acted on (worker check via `phoneNumber`, customer check via `userId`)

## Data Exposure

- [ ] **Every response uses a Prisma `select`** — never return a full model row (`.findMany()` or `.findUnique()`) by default. Explicitly list the fields the client needs. **Booking OTP fields (`startOtp`, `endOtp`) must always be excluded from responses**
- [ ] **Phone numbers and coordinates** are never returned from list routes (`GET /api/workers`, `GET /api/workers/available/:mode`, `GET /api/bookings/available`, `GET /api/bookings/worker`)
- [ ] **Booking OTPs** are never returned in response bodies — only logged server-side

## Payment & Pricing

- [ ] **Money values computed server-side** — never trust `req.body.amount` or `req.body.hourlyRate`. Compute from stored rate table + booking data
- [ ] **Platform fee is server-calculated** — never accept from the client
- [ ] **Rate table** in `constants.ts` is the single source of truth for hourly pricing

## Rate Limiting & Abuse

- [ ] **OTP send is rate-limited** (5/15min per phone, Redis-backed)
- [ ] **OTP verify is rate-limited** (5 failed attempts deletes the OTP and counter, requires fresh send)
- [ ] **Global rate limit** (100 req/min per IP) is applied in `index.ts`
- [ ] **Auth routes** have tighter limit (10 req/min per IP)

## Database & Input

- [ ] **User IDs are compared, not trusted** — `booking.userId !== req.user!.userId` check before returning or mutating
- [ ] **Status transitions are validated** — booking cannot skip states (e.g. `pending` → `assigned` → `in_progress` → `completed`)
