import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.get('/', adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const search = (req.query.q as string || '').trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneNumber: true,
          name: true,
          email: true,
          isAdmin: true,
          createdAt: true,
          _count: { select: { bookings: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Batch query: one fetch for all captured payments whose booking belongs
    // to anyone on this page, then group in memory. Replaces the previous
    // per-user payment.aggregate() N+1 (1 + N queries -> 2 queries).
    const userIds = users.map((u) => u.id);
    const capturedPayments = userIds.length
      ? await prisma.payment.findMany({
          where: {
            status: { in: ['captured', 'paid'] },
            booking: { userId: { in: userIds } },
          },
          select: { amount: true, booking: { select: { userId: true } } },
        })
      : [];
    const spentByUser = new Map<string, number>();
    for (const p of capturedPayments) {
      const uid = p.booking?.userId;
      if (!uid) continue;
      spentByUser.set(uid, (spentByUser.get(uid) || 0) + Number(p.amount));
    }

    const enriched = users.map((u) => ({
      id: u.id,
      phoneNumber: u.phoneNumber,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      bookingCount: u._count.bookings,
      totalSpent: spentByUser.get(u.id) || 0,
      createdAt: u.createdAt,
    }));

    return res.json({ users: enriched, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[users] list error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

usersRouter.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        phoneNumber: true,
        name: true,
        email: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const spent = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { booking: { userId: user.id }, status: { in: ['captured', 'paid'] } },
    });

    return res.json({
      user: {
        ...user,
        bookingCount: user._count.bookings,
        totalSpent: spent._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('[users] detail error:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

usersRouter.get('/:id/bookings', adminMiddleware, async (req, res) => {
  try {
    const userExists = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!userExists) return res.status(404).json({ error: 'User not found' });

    const bookings = await prisma.booking.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        mode: true,
        serviceType: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        completedAt: true,
        worker: { select: { name: true } },
        payment: { select: { amount: true, status: true } },
      },
    });

    return res.json({ bookings });
  } catch (error) {
    console.error('[users] bookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});
