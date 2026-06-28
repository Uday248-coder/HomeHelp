import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { RATE_TABLE } from '../lib/constants';
import { Prisma } from '@prisma/client';

export const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

function getId(req: Request): string {
  return req.params.id as string;
}

bookingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      include: { worker: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

bookingsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { mode, serviceType, scheduledAt, customerAddress, customerLat, customerLng, durationHours } = req.body;
    if (!mode || !serviceType) {
      return res.status(400).json({ error: 'mode and serviceType are required' });
    }
    if (!['home_help', 'driver'].includes(mode)) {
      return res.status(400).json({ error: 'mode must be home_help or driver' });
    }

    const hourlyRate = RATE_TABLE[mode];
    if (!hourlyRate) {
      return res.status(400).json({ error: 'Invalid mode for pricing' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.userId,
        mode,
        serviceType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        customerAddress,
        customerLat: customerLat ? parseFloat(customerLat) : null,
        customerLng: customerLng ? parseFloat(customerLng) : null,
        durationHours: durationHours ? parseFloat(durationHours) : null,
        hourlyRate,
        status: 'pending',
      },
      include: { worker: true, payment: true },
    });
    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

bookingsRouter.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: Prisma.BookingWhereInput = {};
    if (status && ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      where.status = status as Prisma.BookingWhereInput['status'];
    }
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: search } } },
        { worker: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: { worker: true, user: true, payment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

bookingsRouter.get('/available', async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { phoneNumber: req.user!.phoneNumber },
    });
    if (!worker || !worker.isActive) {
      return res.status(403).json({ error: 'Only active workers can view available bookings' });
    }

    const mode = req.query.mode as string | undefined;
    const where: Prisma.BookingWhereInput = {
      status: 'pending',
      workerId: null,
    };
    if (mode && ['home_help', 'driver'].includes(mode)) {
      where.mode = mode as Prisma.BookingWhereInput['mode'];
    }
    const bookings = await prisma.booking.findMany({
      where,
      include: { user: { select: { id: true, name: true, phoneNumber: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch available bookings' });
  }
});

bookingsRouter.get('/worker', async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { phoneNumber: req.user!.phoneNumber },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const bookings = await prisma.booking.findMany({
      where: { workerId: worker.id },
      include: { user: { select: { id: true, name: true, phoneNumber: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch worker bookings' });
  }
});

bookingsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: getId(req) },
      include: { worker: true, payment: true, user: true },
    });
    if (!booking || booking.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json({ booking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

bookingsRouter.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isAdmin = user?.isAdmin ?? false;
    if (!booking || (booking.userId !== req.user!.userId && !isAdmin)) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!['pending', 'assigned'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }
    const updated = await prisma.booking.update({
      where: { id: getId(req) },
      data: { status: 'cancelled' },
    });
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

bookingsRouter.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { workerId } = req.body;
    if (!workerId) return res.status(400).json({ error: 'workerId is required' });

    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Booking must be pending to assign' });

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const updated = await prisma.booking.update({
      where: { id: getId(req) },
      data: { workerId, status: 'assigned' },
      include: { worker: true, payment: true },
    });
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign worker' });
  }
});

bookingsRouter.patch('/:id/start', async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const worker = await prisma.worker.findUnique({
      where: { phoneNumber: req.user!.phoneNumber },
    });
    if (!worker) return res.status(403).json({ error: 'Worker profile not found' });

    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.workerId !== worker.id) return res.status(403).json({ error: 'You are not the assigned worker' });
    if (booking.status !== 'assigned') return res.status(400).json({ error: 'Booking not in assigned state' });
    if (!booking.startOtp || booking.startOtp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

    const updated = await prisma.booking.update({
      where: { id: getId(req) },
      data: { status: 'in_progress', startedAt: new Date() },
    });
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start booking' });
  }
});

bookingsRouter.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { otp, rating, reviewText } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const worker = await prisma.worker.findUnique({
      where: { phoneNumber: req.user!.phoneNumber },
    });
    if (!worker) return res.status(403).json({ error: 'Worker profile not found' });

    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.workerId !== worker.id) return res.status(403).json({ error: 'You are not the assigned worker' });
    if (booking.status !== 'in_progress') return res.status(400).json({ error: 'Booking not in progress' });
    if (!booking.endOtp || booking.endOtp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

    const updated = await prisma.booking.update({
      where: { id: getId(req) },
      data: {
        status: 'completed',
        completedAt: new Date(),
        ratingByUser: rating ? Math.min(Math.max(Math.round(rating), 1), 5) : null,
        reviewText: reviewText || null,
      },
    });

    if (booking.workerId) {
      const allCompleted = await prisma.booking.count({
        where: { workerId: booking.workerId, status: 'completed' },
      });
      await prisma.worker.update({
        where: { id: booking.workerId },
        data: { totalJobs: allCompleted },
      });
    }

    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to complete booking' });
  }
});

bookingsRouter.patch('/:id/generate-otp', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type } = req.body;
    if (!type || !['start', 'end'].includes(type)) {
      return res.status(400).json({ error: 'type must be start or end' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const field = type === 'start' ? 'startOtp' : 'endOtp';

    await prisma.booking.update({
      where: { id: getId(req) },
      data: { [field]: otp },
    });

    console.log(`[Booking OTP] Booking ${getId(req)} ${type} OTP: ${otp}`);

    return res.json({ message: `${type} OTP generated` });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate OTP' });
  }
});
