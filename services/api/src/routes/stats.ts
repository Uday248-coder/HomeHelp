import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const statsRouter = Router();

statsRouter.get('/dashboard', async (_req, res) => {
  try {
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
        include: { user: true, worker: true },
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

statsRouter.get('/revenue/weekly', async (_req, res) => {
  try {
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
