import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const statsRouter = Router();
statsRouter.use(authMiddleware);

statsRouter.get('/dashboard', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const [
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      activeWorkers,
      totalRevenue,
      recentBookings,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'completed' } }),
      prisma.booking.count({ where: { status: 'cancelled' } }),
      prisma.worker.count({ where: { isActive: true } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'captured' } }),
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
      totalBookings,
      activeWorkers,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      recentBookings,
    });
  } catch (error) {
    console.error('[stats] dashboard error:', error);
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
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'captured',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, number>();
    const cursor = new Date(sevenDaysAgo);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    while (cursor <= end) {
      dailyMap.set(cursor.toISOString().slice(0, 10), 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const p of payments) {
      const key = p.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) || 0) + Number(p.amount));
    }
    const revenue = Array.from(dailyMap.entries()).map(([date, rev]) => ({ date, revenue: rev }));

    return res.json({ revenue });
  } catch (error) {
    console.error('[stats] revenue/weekly error:', error);
    return res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

statsRouter.get('/analytics', adminMiddleware, async (req, res) => {
  try {
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const [
      dailyRevenue,
      bookingFunnel,
      topWorkers,
      modeRevenue,
      workerStats,
      revenueByMode,
      driverRevenue,
      availableWorkers,
    ] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'captured',
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { amount: true, createdAt: true, booking: { select: { mode: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.worker.findMany({
        orderBy: { totalJobs: 'desc' },
        take: 10,
        select: {
          id: true, name: true, workerType: true, totalJobs: true,
          averageRating: true, isAvailable: true, isActive: true,
          _count: { select: { bookings: { where: { status: 'completed' } } } },
        },
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: {
          status: 'captured',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.worker.aggregate({
        _count: { id: true },
        where: { isActive: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'captured',
          createdAt: { gte: startDate, lte: endDate },
          booking: { mode: 'home_help' },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'captured',
          createdAt: { gte: startDate, lte: endDate },
          booking: { mode: 'driver' },
        },
      }),
      prisma.worker.count({ where: { isAvailable: true, isActive: true } }),
    ]);

    const dailyMap = new Map<string, number>();
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      dailyMap.set(cursor.toISOString().slice(0, 10), 0);
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const p of dailyRevenue) {
      const key = p.createdAt.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) || 0) + Number(p.amount));
    }
    const dailyRevenueArray = Array.from(dailyMap.entries()).map(([date, revenue]) => ({ date, revenue }));

    return res.json({
      dailyRevenue: dailyRevenueArray,
      bookingFunnel: bookingFunnel.map((b) => ({ status: b.status, count: b._count.id })),
      totalRevenueThisPeriod: dailyRevenueArray.reduce((s, d) => s + d.revenue, 0),
      topWorkers: topWorkers.map((w) => ({
        id: w.id,
        name: w.name,
        workerType: w.workerType,
        totalJobs: w.totalJobs,
        completedJobs: w._count.bookings,
        averageRating: w.averageRating,
        isAvailable: w.isAvailable,
      })),
      modeBreakdown: {
        homeHelp: Number(revenueByMode._sum.amount || 0),
        driver: Number(driverRevenue._sum.amount || 0),
      },
      workerStats: {
        total: workerStats._count.id,
        available: availableWorkers,
      },
    });
  } catch (error) {
    console.error('[stats] analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});
