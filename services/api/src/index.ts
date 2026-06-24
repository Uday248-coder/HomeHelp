import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { bookingsRouter } from './routes/bookings';
import { workersRouter } from './routes/workers';
import { paymentsRouter } from './routes/payments';
import { statsRouter } from './routes/stats';
import { waitlistRouter } from './routes/waitlist';

const app = express();
const PORT = process.env.PORT || 3001;

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  integrations: [Sentry.expressIntegration()],
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/workers', workersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/waitlist', waitlistRouter);

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
