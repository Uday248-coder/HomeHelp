import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const bookingsRouter = Router();

bookingsRouter.use(authMiddleware);

bookingsRouter.get('/', async (req, res) => {
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

bookingsRouter.post('/', async (req, res) => {
  try {
    const { mode, serviceType, scheduledAt, customerAddress, customerLat, customerLng, durationHours, hourlyRate } = req.body;
    if (!mode || !serviceType) {
      return res.status(400).json({ error: 'mode and serviceType are required' });
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
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        status: 'pending',
      },
      include: { worker: true, payment: true },
    });
    return res.status(201).json({ booking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

bookingsRouter.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
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

bookingsRouter.patch('/:id/cancel', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking || booking.userId !== req.user!.userId) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (!['pending', 'assigned'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
    });
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

bookingsRouter.patch('/:id/assign', async (req, res) => {
  try {
    const { workerId } = req.body;
    if (!workerId) return res.status(400).json({ error: 'workerId is required' });

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { workerId, status: 'assigned' },
      include: { worker: true, payment: true },
    });
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign worker' });
  }
});

bookingsRouter.patch('/:id/start', async (req, res) => {
  try {
    const { otp } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'assigned') return res.status(400).json({ error: 'Booking not in assigned state' });
    if (booking.startOtp && booking.startOtp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'in_progress', startedAt: new Date() },
    });
    return res.json({ booking: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to start booking' });
  }
});

bookingsRouter.patch('/:id/complete', async (req, res) => {
  try {
    const { otp, rating, reviewText } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'in_progress') return res.status(400).json({ error: 'Booking not in progress' });
    if (booking.endOtp && booking.endOtp !== otp) return res.status(401).json({ error: 'Invalid OTP' });

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        ratingByUser: rating || null,
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

bookingsRouter.get('/admin/all', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { worker: true, user: true, payment: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
