import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const payoutsRouter = Router();

payoutsRouter.use(authMiddleware);

payoutsRouter.get('/', adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const weekStart = req.query.weekStart as string | undefined;
    const weekEnd = req.query.weekEnd as string | undefined;

    const where: Record<string, unknown> = {};
    if (status && ['pending', 'processed', 'failed'].includes(status)) {
      where.status = status;
    }
    if (weekStart || weekEnd) {
      where.weekStartDate = {};
      if (weekStart) (where.weekStartDate as Record<string, unknown>).gte = new Date(weekStart);
      if (weekEnd) (where.weekStartDate as Record<string, unknown>).lte = new Date(weekEnd);
    }

    const [payouts, total] = await Promise.all([
      prisma.workerPayout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { worker: { select: { id: true, name: true, phoneNumber: true } } },
      }),
      prisma.workerPayout.count({ where }),
    ]);

    return res.json({ payouts, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[payouts] list error:', error);
    return res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

payoutsRouter.get('/me', async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const payouts = await prisma.workerPayout.findMany({
      where: { workerId: worker.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ payouts });
  } catch (error) {
    console.error('[payouts] me error:', error);
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
    console.error('[payouts] detail error:', error);
    return res.status(500).json({ error: 'Failed to fetch payout' });
  }
});

payoutsRouter.post('/process', adminMiddleware, async (req, res) => {
  try {
    const { weekStartDate, weekEndDate } = req.body;
    if (!weekStartDate || !weekEndDate) {
      return res.status(400).json({ error: 'weekStartDate and weekEndDate are required' });
    }

    const start = new Date(weekStartDate);
    const end = new Date(weekEndDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    const existing = await prisma.workerPayout.findFirst({
      where: { weekStartDate: start, weekEndDate: end },
    });
    if (existing) {
      return res.status(409).json({ error: 'Payouts already processed for this week' });
    }

    const completedBookings = await prisma.booking.findMany({
      where: {
        status: 'completed',
        completedAt: { gte: start, lte: end },
        workerId: { not: null },
        payment: { status: { in: ['captured', 'paid'] } },
      },
      select: {
        workerId: true,
        payment: { select: { workerPayout: true, amount: true } },
      },
    });

    if (completedBookings.length === 0) {
      return res.status(400).json({ error: 'No completed bookings found for this period' });
    }

    const workerTotals = new Map<string, number>();
    let skippedBookings = 0;
    for (const b of completedBookings) {
      if (!b.workerId) continue;
      // workerPayout may be null on legacy rows; recalculate from the payment
      // amount using the published 85% worker share fallback.
      const stored = b.payment?.workerPayout ? Number(b.payment.workerPayout) : null;
      const amount = b.payment?.amount ? Number(b.payment.amount) : null;
      const payout = stored !== null && stored > 0
        ? stored
        : (amount !== null && amount > 0 ? parseFloat((amount * 0.85).toFixed(2)) : 0);
      if (payout <= 0) {
        skippedBookings += 1;
        continue;
      }
      workerTotals.set(b.workerId, (workerTotals.get(b.workerId) || 0) + payout);
    }

    if (skippedBookings > 0) {
      console.warn(`[payouts] Skipped ${skippedBookings} bookings with no valid worker payout`);
    }

    if (workerTotals.size === 0) {
      return res.status(400).json({ error: 'No valid worker payouts found for this period' });
    }

    const payouts = await Promise.all(
      Array.from(workerTotals.entries()).map(([workerId, amount]) =>
        prisma.workerPayout.create({
          data: {
            workerId,
            amount,
            weekStartDate: start,
            weekEndDate: end,
            status: 'pending',
          },
          include: { worker: { select: { id: true, name: true, phoneNumber: true } } },
        }),
      ),
    );

    return res.status(201).json({ payouts, totalAmount: Array.from(workerTotals.values()).reduce((s, a) => s + a, 0) });
  } catch (error) {
    console.error('[payouts] process error:', error);
    return res.status(500).json({ error: 'Failed to process payouts' });
  }
});

payoutsRouter.post('/:id/mark-paid', adminMiddleware, async (req, res) => {
  try {
    const { razorpayPayoutId } = req.body;
    const payout = await prisma.workerPayout.findUnique({ where: { id: req.params.id } });
    if (!payout) return res.status(404).json({ error: 'Payout not found' });
    if (payout.status !== 'pending') {
      return res.status(409).json({ error: 'Payout is not in pending status' });
    }

    const updated = await prisma.workerPayout.update({
      where: { id: req.params.id },
      data: {
        status: 'processed',
        processedAt: new Date(),
        razorpayPayoutId: razorpayPayoutId || null,
      },
      include: { worker: { select: { id: true, name: true, phoneNumber: true } } },
    });

    return res.json({ payout: updated });
  } catch (error) {
    console.error('[payouts] mark-paid error:', error);
    return res.status(500).json({ error: 'Failed to mark payout as paid' });
  }
});
