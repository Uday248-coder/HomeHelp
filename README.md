# HomeHelp

On-demand platform for hourly home help (cleaning, domestic work) and driver booking (drive your own car).

## Structure

```
homehelp/
├── apps/
│   ├── customer-app/   # React Native / Expo (customer)
│   ├── worker-app/     # React Native / Expo (worker)
│   ├── website/        # Next.js marketing site
│   └── admin/          # Next.js admin dashboard
├── services/
│   └── api/            # Express + TypeScript backend
├── .github/workflows/  # CI/CD
└── package.json        # Workspace root
```

## Stack

- **Mobile:** React Native + Expo, TypeScript
- **Web:** Next.js 14 (App Router), Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Infra:** Railway, Vercel, Upstash Redis, Sentry
