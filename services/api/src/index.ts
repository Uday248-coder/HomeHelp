import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { bookingsRouter } from './routes/bookings';
import { workersRouter } from './routes/workers';
import { paymentsRouter } from './routes/payments';
import { statsRouter } from './routes/stats';
import { waitlistRouter } from './routes/waitlist';
import { payoutsRouter } from './routes/payouts';
import { usersRouter } from './routes/users';
import { requestLogger } from './middleware/validation';

const app = express();
const PORT = process.env.PORT || 3001;

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later' },
});

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
    integrations: [Sentry.expressIntegration()],
  });
}

app.use(helmet());
app.use(generalLimiter);
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://homehelp-admin.vercel.app',
    'https://homehelp-website.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(requestLogger);

app.use('/health', healthRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/workers', workersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/waitlist', waitlistRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/users', usersRouter);

Sentry.setupExpressErrorHandler(app);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
