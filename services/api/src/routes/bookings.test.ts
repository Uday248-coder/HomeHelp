import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { bookingsRouter } from './bookings';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { PricingEngine } from '../services/pricing/PricingEngine';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    worker: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../services/pricing/PricingEngine', () => ({
  PricingEngine: {
    calculatePrice: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Mock push notifications to avoid external calls during tests
vi.mock('../lib/push', () => ({
  sendPushToUser: vi.fn(),
}));

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingsRouter);

describe('Bookings Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default auth mock: authenticated user
    (jwt.verify as any).mockReturnValue({ userId: 'user-1', isAdmin: false });
  });

  describe('GET /api/bookings', () => {
    it('should return bookings for the authenticated user', async () => {
      const mockBookings = [{ id: 'booking-1', mode: 'home_help', status: 'pending' }];
      (prisma.booking.findMany as any).mockResolvedValue(mockBookings);

      const res = await request(app)
        .get('/api/bookings')
        .set('Authorization', 'Bearer dummy-token');

      expect(res.status).toBe(200);
      expect(res.body.bookings).toEqual(mockBookings);
      expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: 'user-1' }
      }));
    });

    it('should return 401 if missing authorization token', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/bookings', () => {
    it('should validate mode and serviceType are required', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer dummy-token')
        .send({ distanceKm: 10 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('mode and serviceType are required');
    });

    it('should validate distanceKm > 2000 returning 400', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer dummy-token')
        .send({
          mode: 'driver',
          serviceType: 'driving',
          distanceKm: 2001,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('distanceKm must be between 0 and 2000');
    });

    it('should calculate price using PricingEngine and create a booking', async () => {
      (PricingEngine.calculatePrice as any).mockResolvedValue({
        hourlyRate: 100,
        baseAmount: 200,
        surgeMultiplier: 1.0,
        totalAmount: 200,
      });

      const mockBooking = { id: 'booking-2', totalAmount: 200 };
      (prisma.booking.create as any).mockResolvedValue(mockBooking);

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer dummy-token')
        .send({
          mode: 'home_help',
          serviceType: 'cleaning',
          durationHours: 2,
          distanceKm: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.booking).toEqual(mockBooking);
      expect(PricingEngine.calculatePrice).toHaveBeenCalledWith({
        mode: 'home_help',
        durationHours: 2,
        distanceKm: 10,
      });
      expect(prisma.booking.create).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/bookings/:id', () => {
    it('should return 403 if user is not the owner and not an admin', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'booking-3', userId: 'other-user', status: 'pending' });

      const res = await request(app)
        .patch('/api/bookings/booking-3')
        .set('Authorization', 'Bearer dummy-token')
        .send({ distanceKm: 10 });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should return 400 if booking status is not pending', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'booking-3', userId: 'user-1', status: 'completed' });

      const res = await request(app)
        .patch('/api/bookings/booking-3')
        .set('Authorization', 'Bearer dummy-token')
        .send({ distanceKm: 10 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Only pending bookings can be edited');
    });

    it('should allow owner to edit pending booking and trigger recalculation', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'booking-3', userId: 'user-1', status: 'pending', mode: 'driver' });
      (PricingEngine.calculatePrice as any).mockResolvedValue({ totalAmount: 150 });
      (prisma.booking.update as any).mockResolvedValue({ id: 'booking-3', totalAmount: 150 });

      const res = await request(app)
        .patch('/api/bookings/booking-3')
        .set('Authorization', 'Bearer dummy-token')
        .send({ distanceKm: 15 });

      expect(res.status).toBe(200);
      expect(PricingEngine.calculatePrice).toHaveBeenCalled();
      expect(prisma.booking.update).toHaveBeenCalled();
    });

    it('should allow admin to edit other user booking', async () => {
      (jwt.verify as any).mockReturnValue({ userId: 'admin-1', isAdmin: true });
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'booking-3', userId: 'other-user', status: 'pending', mode: 'driver' });
      (PricingEngine.calculatePrice as any).mockResolvedValue({ totalAmount: 150 });
      (prisma.booking.update as any).mockResolvedValue({ id: 'booking-3', totalAmount: 150 });

      const res = await request(app)
        .patch('/api/bookings/booking-3')
        .set('Authorization', 'Bearer admin-token')
        .send({ distanceKm: 15 });

      expect(res.status).toBe(200);
      expect(prisma.booking.update).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/bookings/:id/cancel', () => {
    it('should return 404 if booking is not found', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue(null);
      (prisma.user.findUnique as any).mockResolvedValue({ isAdmin: false });

      const res = await request(app)
        .patch('/api/bookings/b-unknown/cancel')
        .set('Authorization', 'Bearer dummy-token');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Booking not found');
    });

    it('should return 404 if user is not owner and not admin', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b-4', userId: 'other-user', status: 'pending' });
      (prisma.user.findUnique as any).mockResolvedValue({ isAdmin: false });

      const res = await request(app)
        .patch('/api/bookings/b-4/cancel')
        .set('Authorization', 'Bearer dummy-token');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Booking not found');
    });

    it('should return 400 if booking is already completed or cancelled', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b-4', userId: 'user-1', status: 'completed' });
      (prisma.user.findUnique as any).mockResolvedValue({ isAdmin: false });

      const res = await request(app)
        .patch('/api/bookings/b-4/cancel')
        .set('Authorization', 'Bearer dummy-token');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Booking cannot be cancelled');
    });

    it('should successfully cancel a pending booking for owner', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b-4', userId: 'user-1', status: 'pending' });
      (prisma.user.findUnique as any).mockResolvedValue({ isAdmin: false });
      (prisma.booking.update as any).mockResolvedValue({ id: 'b-4', status: 'cancelled' });

      const res = await request(app)
        .patch('/api/bookings/b-4/cancel')
        .set('Authorization', 'Bearer dummy-token');

      expect(res.status).toBe(200);
      expect(res.body.booking.status).toBe('cancelled');
      expect(prisma.booking.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'b-4' },
        data: { status: 'cancelled' }
      }));
    });
  });
});
