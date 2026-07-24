import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const pushRouter = Router();

pushRouter.use(authMiddleware);

pushRouter.post('/subscribe', async (req, res) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Subscription requires endpoint, keys.p256dh, and keys.auth' });
    }

    // Upsert so re-subscribes (e.g. after browser rotation) refresh the row
    // rather than creating duplicates.
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: req.user!.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.headers['user-agent'] || null,
      },
      update: {
        userId: req.user!.userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('[push] subscribe error:', err);
    return res.status(500).json({ error: 'Failed to register subscription' });
  }
});

pushRouter.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'endpoint is required' });

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: req.user!.userId },
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[push] unsubscribe error:', err);
    return res.status(500).json({ error: 'Failed to remove subscription' });
  }
});
