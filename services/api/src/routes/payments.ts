import { Router } from 'express';
import Razorpay from 'razorpay';
import { createHmac } from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const paymentsRouter = Router();
paymentsRouter.use(authMiddleware);

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const hasRazorpayKeys = !!(razorpayKeyId && razorpayKeySecret);

let razorpay: Razorpay | null = null;
if (hasRazorpayKeys) {
  razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
}

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  try {
    const expected = createHmac('sha256', razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  } catch {
    return false;
  }
}

paymentsRouter.post('/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only create payments for your own bookings' });
    }

    const rate = booking.hourlyRate ? Number(booking.hourlyRate) : 0;
    const hours = booking.durationHours ? Number(booking.durationHours) : 1;
    const amount = parseFloat((rate * hours).toFixed(2));

    if (amount <= 0) {
      return res.status(400).json({ error: 'Cannot create payment: booking has no hourly rate or duration' });
    }

    const platformFee = parseFloat((amount * 0.15).toFixed(2));
    const workerPayout = parseFloat((amount - platformFee).toFixed(2));
    const amountInPaise = Math.round(Number(amount) * 100);

    let razorpayOrderId: string | null = null;

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `booking_${bookingId.slice(0, 8)}`,
      });
      razorpayOrderId = order.id;
    } else {
      razorpayOrderId = `order_mock_${Date.now()}`;
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: Number(amount),
        platformFee,
        workerPayout,
        status: 'pending',
        razorpayOrderId,
      },
    });

    return res.json({ payment, razorpayOrderId });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

paymentsRouter.post('/verify', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      const payment = await prisma.payment.findUnique({ where: { id: req.body.paymentId } });
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });
      if (!booking || booking.userId !== req.user!.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!paymentId) return res.status(400).json({ error: 'paymentId is required' });

    if (!razorpay) {
      console.warn('[Payments] Razorpay not configured - skipping signature verification');
    } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'captured',
        razorpayPaymentId: razorpayPaymentId || undefined,
      },
    });
    return res.json({ payment });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
});

paymentsRouter.get('/booking/:bookingId', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.bookingId },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isAdmin = user?.isAdmin ?? false;
    if (booking.userId !== req.user!.userId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const payment = await prisma.payment.findUnique({
      where: { bookingId: req.params.bookingId },
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    return res.json({ payment });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payment' });
  }
});
