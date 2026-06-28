import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const statsRouter = Router();
statsRouter.use(authMiddleware);

statsRouter.get('/dashboard', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const [
      activeBookings,
      availableWorkers,
      todayRevenue,
      totalUsers,
      totalWorkers,
      totalBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.count({ where: { status: { in: ['assigned', 'in_progress'] } } }),
      prisma.worker.count({ where: { isAvailable: true, isActive: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'captured',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.user.count(),
      prisma.worker.count(),
      prisma.booking.count(),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, mode: true, serviceType: true, status: true,
          createdAt: true, completedAt: true,
          user: { select: { id: true, name: true } },
          worker: { select: { id: true, name: true, averageRating: true } },
          payment: { select: { amount: true, status: true } },
        },
      }),
    ]);

    return res.json({
      activeBookings,
      availableWorkers,
      todayRevenue: todayRevenue._sum.amount || 0,
      totalUsers,
      totalWorkers,
      totalBookings,
      recentBookings,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

statsRouter.get('/revenue/weekly', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'captured',
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ payments });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});
