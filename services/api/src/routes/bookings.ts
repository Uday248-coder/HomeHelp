import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { RATE_TABLE } from '../lib/constants';
import { sendOtpEmail } from '../lib/mailer';
import { Prisma } from '@prisma/client';
import { isWorkerEligible, eligibleModes, type BookingMode } from '../lib/eligibility';
import { sendPushToUser } from '../lib/push';

export const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

function getId(req: Request): string {
  return req.params.id as string;
}

const BOOKING_SAFE_FIELDS = {
  id: true, userId: true, mode: true, serviceType: true, status: true,
  scheduledAt: true, startedAt: true, completedAt: true,
  durationHours: true, hourlyRate: true, customerAddress: true,
  ratingByUser: true, reviewText: true, createdAt: true, updatedAt: true,
} as const;

// Owner-scoped view: includes OTPs so the customer (who receives them by email)
// can share them with the worker to start/complete the job. Not used for
// worker or admin endpoints, where OTPs must stay hidden.
const CUSTOMER_FIELDS = { ...BOOKING_SAFE_FIELDS, startOtp: true, endOtp: true } as const;

bookingsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      select: {
        ...CUSTOMER_FIELDS,
        worker: { select: { id: true, name: true, workerType: true, averageRating: true, photoUrl: true } },
        payment: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ bookings });
  } catch (err) {
    console.error('[bookings] fetch bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

const generateOtpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP requests, please try again later' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many OTP attempts, please try again later' },
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

    // Validate coordinates if provided (lat: -90..90, lng: -180..180)
    const lat = customerLat !== undefined && customerLat !== '' ? parseFloat(customerLat) : null;
    const lng = customerLng !== undefined && customerLng !== '' ? parseFloat(customerLng) : null;
    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      return res.status(400).json({ error: 'Invalid customer latitude' });
    }
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      return res.status(400).json({ error: 'Invalid customer longitude' });
    }

    const duration = durationHours !== undefined && durationHours !== '' ? parseFloat(durationHours) : null;
    if (duration !== null && (isNaN(duration) || duration <= 0)) {
      return res.status(400).json({ error: 'Invalid durationHours' });
    }

    // Server-side total computed from the rate table — never trust client amounts.
    const totalAmount = duration ? Math.round(hourlyRate * duration) : null;

    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.userId,
        mode,
        serviceType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        customerAddress,
        customerLat: lat,
        customerLng: lng,
        durationHours: duration,
        hourlyRate,
        totalAmount,
        status: 'pending',
      },
      select: {
        ...BOOKING_SAFE_FIELDS,
        worker: { select: { id: true, name: true, workerType: true, averageRating: true, photoUrl: true } },
        payment: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
    });
    return res.status(201).json({ booking });
  } catch (err) {
    console.error('[bookings] create booking error:', err);
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
        select: {
          ...BOOKING_SAFE_FIELDS,
          user: { select: { id: true, name: true } },
          worker: { select: { id: true, name: true, workerType: true, averageRating: true, photoUrl: true } },
          payment: { select: { id: true, amount: true, status: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return res.json({ bookings, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('[bookings] admin all bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

bookingsRouter.get('/available', async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker || !worker.isActive) {
      return res.status(403).json({ error: 'Only active workers can view available bookings' });
    }

    // Only surface bookings this worker is verified + typed to take
    // (Aadhaar for all, License additionally for driving).
    const allowedModes = eligibleModes(worker);
    if (allowedModes.length === 0) {
      return res.json({ bookings: [] });
    }

    const mode = req.query.mode as string | undefined;
    const where: Prisma.BookingWhereInput = {
      status: 'pending',
      workerId: null,
    };
    if (mode && ['home_help', 'driver'].includes(mode)) {
      if (!allowedModes.includes(mode as BookingMode)) {
        return res.json({ bookings: [] });
      }
      where.mode = mode as Prisma.BookingWhereInput['mode'];
    } else {
      where.mode = { in: allowedModes };
    }
    const bookings = await prisma.booking.findMany({
      where,
      select: {
        ...BOOKING_SAFE_FIELDS,
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ bookings });
  } catch (err) {
    console.error('[bookings] available bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch available bookings' });
  }
});

bookingsRouter.get('/worker', async (req: Request, res: Response) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const bookings = await prisma.booking.findMany({
      where: { workerId: worker.id },
      select: {
        ...BOOKING_SAFE_FIELDS,
        user: { select: { id: true, name: true } },
        payment: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ bookings });
  } catch (err) {
    console.error('[bookings] worker bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker bookings' });
  }
});

bookingsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: getId(req) },
      select: {
        ...CUSTOMER_FIELDS,
        worker: { select: { id: true, name: true, workerType: true, averageRating: true, photoUrl: true } },
        payment: { select: { id: true, amount: true, status: true, createdAt: true } },
        user: { select: { id: true, name: true } },
      },
    });
    if (!booking || booking.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.json({ booking });
  } catch (err) {
    console.error('[bookings] get booking error:', err);
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
      select: BOOKING_SAFE_FIELDS,
    });

    if (booking.workerId) {
      const assignedWorker = await prisma.worker.findUnique({
        where: { id: booking.workerId },
        select: { userId: true },
      });
      if (assignedWorker?.userId) {
        await sendPushToUser(prisma as any, assignedWorker.userId, {
          title: 'Booking cancelled',
          body: 'A booking assigned to you has been cancelled.',
          url: `/worker`,
          tag: `booking-${updated.id}-cancelled`,
        });
      }
    }

    return res.json({ booking: updated });
  } catch (err) {
    console.error('[bookings] cancel booking error:', err);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

bookingsRouter.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isAdmin = user?.isAdmin ?? false;

    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'pending' || booking.workerId) {
      return res.status(400).json({ error: 'Booking must be pending and unassigned to assign' });
    }

    let workerId: string;
    if (isAdmin) {
      workerId = req.body.workerId;
      if (!workerId) return res.status(400).json({ error: 'workerId is required' });
    } else {
      const worker = await prisma.worker.findUnique({ where: { userId: req.user!.userId } });
      if (!worker) return res.status(403).json({ error: 'Worker profile required to accept jobs' });
      workerId = worker.id;
    }

    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    // Gate on verification + type + active status. Self-serve accept also
    // requires the worker to be marked available.
    if (!isWorkerEligible(booking.mode as BookingMode, worker, { requireAvailable: !isAdmin })) {
      return res.status(403).json({
        error: booking.mode === 'driver'
          ? 'Worker must be active with verified Aadhaar and License to take driver jobs'
          : 'Worker must be active with verified Aadhaar to take this job',
      });
    }

    // Overlap guard: prevent double-booking if the job has a scheduled time slot.
    if (booking.scheduledAt && booking.durationHours) {
      const jobEnd = new Date(booking.scheduledAt.getTime() + Number(booking.durationHours) * 3600000);
      const overlapping = await prisma.booking.findFirst({
        where: {
          workerId,
          status: { in: ['assigned', 'in_progress'] },
          id: { not: booking.id },
          scheduledAt: {
            lt: jobEnd,
            gte: booking.scheduledAt,
          },
        },
      });
      if (overlapping) {
        return res.status(409).json({ error: 'Worker already has an overlapping scheduled job in this time slot' });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: getId(req) },
      data: { workerId, status: 'assigned' },
      select: {
        ...BOOKING_SAFE_FIELDS,
        worker: { select: { id: true, name: true, workerType: true, averageRating: true, photoUrl: true } },
        payment: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
    });

    // Customer notification: a worker has accepted their booking.
    await sendPushToUser(prisma as any, booking.userId, {
      title: 'Worker confirmed',
      body: `${updated.worker?.name || 'A worker'} is on the way for your ${booking.mode === 'driver' ? 'driver' : 'home help'} booking.`,
      url: `/my-bookings`,
      tag: `booking-${updated.id}-assigned`,
    });

    return res.json({ booking: updated });
  } catch (err) {
    console.error('[bookings] assign error:', err);
    return res.status(500).json({ error: 'Failed to assign booking' });
  }
});

bookingsRouter.patch('/:id/start', otpVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(403).json({ error: 'Worker profile not found' });

    const booking = await prisma.booking.findUnique({ where: { id: getId(req) } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.workerId !== worker.id) return res.status(403).json({ error: 'You are not the assigned worker' });
    if (booking.status !== 'assigned') return res.status(400).json({ error: 'Booking not in assigned state' });
    if (!booking.startOtp || booking.startOtp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

    const updated = await prisma.booking.update({
      where: { id: getId(req) },
      data: { status: 'in_progress', startedAt: new Date(), startOtp: null },
      select: BOOKING_SAFE_FIELDS,
    });

    await sendPushToUser(prisma as any, booking.userId, {
      title: 'Job started',
      body: 'Your worker has started the job. We\xe2\x80\x99ll notify you when it completes.',
      url: `/my-bookings`,
      tag: `booking-${updated.id}-started`,
    });

    return res.json({ booking: updated });
  } catch (err) {
    console.error('[bookings] start booking error:', err);
    return res.status(500).json({ error: 'Failed to start booking' });
  }
});

bookingsRouter.patch('/:id/complete', otpVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const { otp, rating, reviewText } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
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
        endOtp: null,
      },
      select: BOOKING_SAFE_FIELDS,
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

    await sendPushToUser(prisma as any, booking.userId, {
      title: 'Job complete',
      body: 'Your job is done. Thanks for using HomeHelp!',
      url: `/my-bookings`,
      tag: `booking-${updated.id}-completed`,
    });

    return res.json({ booking: updated });
  } catch (err) {
    console.error('[bookings] complete booking error:', err);
    return res.status(500).json({ error: 'Failed to complete booking' });
  }
});

bookingsRouter.patch('/:id/generate-otp', generateOtpLimiter, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type } = req.body;
    if (!type || !['start', 'end'].includes(type)) {
      return res.status(400).json({ error: 'type must be start or end' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: getId(req) },
      include: { user: { select: { email: true } } },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const otp = crypto.randomInt(1000, 10000).toString();
    const field = type === 'start' ? 'startOtp' : 'endOtp';

    await prisma.booking.update({
      where: { id: getId(req) },
      data: { [field]: otp },
    });

    if (booking.user?.email) {
      await sendOtpEmail(booking.user.email, getId(req), type, otp);
    } else {
      // Never log the OTP — even masked. Confirm only that it was generated;
      // operator can request re-issue if the email pipeline is broken.
      console.log(`[Booking OTP] Booking ${getId(req)} ${type} OTP generated (no email on file)`);
    }

    return res.json({ message: `${type} OTP generated` });
  } catch (err) {
    console.error('[bookings] generate otp error:', err);
    return res.status(500).json({ error: 'Failed to generate OTP' });
  }
});
