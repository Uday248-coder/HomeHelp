import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const payoutsRouter = Router();

payoutsRouter.use(authMiddleware);

payoutsRouter.get('/', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      prisma.workerPayout.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { worker: { select: { id: true, name: true, phoneNumber: true } } },
      }),
      prisma.workerPayout.count(),
    ]);

    return res.json({ payouts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

payoutsRouter.get('/me', async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { phoneNumber: req.user!.phoneNumber },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const payouts = await prisma.workerPayout.findMany({
      where: { workerId: worker.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ payouts });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

payoutsRouter.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const payout = await prisma.workerPayout.findUnique({
      where: { id: req.params.id },
      include: { worker: { select: { id: true, name: true, phoneNumber: true } } },
    });
    if (!payout) return res.status(404).json({ error: 'Payout not found' });
    return res.json({ payout });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payout' });
  }
});
