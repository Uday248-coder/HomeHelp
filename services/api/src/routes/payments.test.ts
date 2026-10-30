import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock auth middleware
vi.mock('../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', email: 'test@test.com', isAdmin: false };
    next();
  },
  adminMiddleware: (req: any, res: any, next: any) => next(),
}));

// Mock Prisma
vi.mock('../lib/prisma', () => {
  const prismaMock = {
    booking: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    workerEarning: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => {
      if (typeof cb === 'function') {
        return cb(prismaMock);
      }
      return Promise.resolve(cb);
    }),
  };
  return { default: prismaMock, prisma: prismaMock };
});

// Mock YoupiClient
vi.mock('../services/youpi/YoupiClient', async () => {
  const actual = await vi.importActual('../services/youpi/YoupiClient') as any;
  const mockYoupi = {
    isConfigured: vi.fn(() => true),
    getPortalUrl: vi.fn(() => 'http://localhost:7000'),
    createPayment: vi.fn().mockResolvedValue({
      paymentId: 'youpi_pay_1',
      orderId: 'booking_booking1_123',
      amount: '398.00',
      amountPaise: '39800',
      currency: 'INR',
      status: 'INITIATED',
      checkoutUrl: 'http://localhost:7000/checkout/youpi_pay_1',
    }),
    getPayment: vi.fn().mockResolvedValue({
      paymentId: 'youpi_pay_1',
      orderId: 'booking_booking1_123',
      amount: '398.00',
      amountPaise: '39800',
      currency: 'INR',
      status: 'SUCCESS',
      method: 'UPI',
      utr: '123456789012',
    }),
    cancelPayment: vi.fn().mockResolvedValue({ success: true, status: 'CANCELLED' }),
    verifyWebhook: vi.fn((rawBody: string, signature?: string) => {
      if (signature === 'valid_gateway_sig') {
        return { isValid: true, event: JSON.parse(rawBody) };
      }
      return { isValid: false, error: 'Invalid HMAC signature' };
    }),
  };

  return {
    ...actual,
    youpiClient: mockYoupi,
    YoupiClient: actual.YoupiClient,
  };
});

import { paymentsRouter } from './payments';
import { prisma } from '../lib/prisma';
import { youpiClient } from '../services/youpi/YoupiClient';

const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRouter);

describe('Payments Routes (YouPI PG Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/payments/create-order', () => {
    it('should successfully create a payment session via YouPI for a valid booking', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        userId: 'user-123',
        mode: 'home_help',
        hourlyRate: 199,
        durationHours: 2,
        status: 'pending',
        user: { name: 'Shivam', phoneNumber: '9876543210', email: 'shivam@example.com' },
      });

      (prisma.payment.findUnique as any).mockResolvedValue(null);

      (prisma.payment.create as any).mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        amount: 398,
        platformFee: 59.7,
        workerPayout: 338.3,
        status: 'pending',
        paymentMethod: 'youpi',
        youpiPaymentId: 'youpi_pay_1',
        youpiOrderId: 'booking_booking1_123',
      });

      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ bookingId: 'booking-1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment.paymentMethod).toBe('youpi');
      expect(response.body).toHaveProperty('checkoutUrl');
      expect(youpiClient.createPayment).toHaveBeenCalled();
    });

    it('should return 403 if the user does not own the booking', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-2',
        userId: 'user-456',
        mode: 'home_help',
        durationHours: 2,
      });

      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ bookingId: 'booking-2' });

      expect(response.status).toBe(403);
    });

    it('should return 404 if booking is not found', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/payments/create-order')
        .send({ bookingId: 'non-existent' });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/payments/verify', () => {
    it('should verify payment successfully using YouPI status and update 15/85 payout split', async () => {
      (prisma.payment.findUnique as any).mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        amount: 1000,
        status: 'pending',
        paymentMethod: 'youpi',
        youpiPaymentId: 'youpi_pay_1',
        booking: {
          userId: 'user-123',
        },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-123',
        isAdmin: false,
      });

      (prisma.payment.update as any).mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        amount: 1000,
        platformFee: 150,
        workerPayout: 850,
        status: 'paid',
        utr: '123456789012',
      });

      const response = await request(app)
        .post('/api/payments/verify')
        .send({ paymentId: 'payment-1', utr: '123456789012' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('payment');
      expect(prisma.payment.update).toHaveBeenCalled();
      expect(youpiClient.getPayment).toHaveBeenCalledWith('youpi_pay_1');
    });

    it('should return 400 if payment is still pending without gateway confirmation', async () => {
      (youpiClient.getPayment as any).mockResolvedValueOnce({
        paymentId: 'youpi_pay_1',
        status: 'PENDING',
      });

      (prisma.payment.findUnique as any).mockResolvedValue({
        id: 'payment-1',
        bookingId: 'booking-1',
        amount: 1000,
        status: 'pending',
        paymentMethod: 'youpi',
        youpiPaymentId: 'youpi_pay_1',
        booking: {
          userId: 'user-123',
        },
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-123',
        isAdmin: false,
      });

      const response = await request(app)
        .post('/api/payments/verify')
        .send({ paymentId: 'payment-1' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should process a valid YouPI webhook and mark payment as paid', async () => {
      (prisma.payment.findFirst as any).mockResolvedValue({
        id: 'payment-1',
        amount: 499,
        status: 'pending',
        youpiOrderId: 'order_1',
      });

      const payload = {
        event: 'OBSERVED_SUCCESS',
        orderId: 'order_1',
        paymentId: 'youpi_pay_1',
        amount: '499.00',
        utr: '987654321012',
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-gateway-signature', 'valid_gateway_sig')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK', received: true });
      expect(prisma.payment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payment-1' },
          data: expect.objectContaining({
            status: 'paid',
            utr: '987654321012',
          }),
        })
      );
    });

    it('should reject webhook with invalid signature', async () => {
      const response = await request(app)
        .post('/api/payments/webhook')
        .set('x-gateway-signature', 'invalid_sig')
        .send({ event: 'OBSERVED_SUCCESS' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/payments/booking/:bookingId', () => {
    it('should return payments for the booking if authorized', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        userId: 'user-123',
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-123',
        isAdmin: false,
      });

      (prisma.payment.findUnique as any).mockResolvedValue({
        id: 'payment-1',
        amount: 1000,
        status: 'paid',
      });

      const response = await request(app).get('/api/payments/booking/booking-1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('payment');
      expect(response.body.payment.id).toBe('payment-1');
    });

    it('should return 403 if trying to view another users booking payments', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-2',
        userId: 'user-456',
      });

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-123',
        isAdmin: false,
      });

      const response = await request(app).get('/api/payments/booking/booking-2');

      expect(response.status).toBe(403);
    });
  });
});
