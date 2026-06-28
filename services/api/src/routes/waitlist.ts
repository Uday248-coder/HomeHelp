import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateEmail } from '../middleware/validation';

export const waitlistRouter = Router();

waitlistRouter.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const entry = await prisma.waitlistEntry.create({ data: { email } });
    return res.status(201).json({ message: 'Signed up successfully', entry });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process signup' });
  }
});

waitlistRouter.get('/', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const entries = await prisma.waitlistEntry.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ total: entries.length, entries });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch waitlist' });
  }
});
