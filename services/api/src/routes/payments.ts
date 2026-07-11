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

const upiVpa = process.env.UPI_VPA || '';
const upiName = process.env.UPI_NAME || 'HomeHelp';

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
  } catch (err) {
    console.error('[payments] verifySignature error:', err);
    return false;
  }
}

function buildUpiLink(bookingId: string, amount: number): string | null {
  if (!upiVpa) return null;
  const note = `HomeHelp Booking ${bookingId.slice(0, 8)}`;
  const params = new URLSearchParams({
    pa: upiVpa,
    pn: upiName,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
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

    // Idempotent: reuse an existing payment for this booking instead of duplicating.
    let payment = await prisma.payment.findUnique({ where: { bookingId } });

    let razorpayOrderId: string | null = null;
    let method = 'upi';

    if (!payment) {
      if (razorpay) {
        try {
          const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `booking_${bookingId.slice(0, 8)}`,
          });
          razorpayOrderId = order.id;
          method = 'razorpay';
        } catch (err) {
          console.error('[Payments] Razorpay order creation failed:', err);
          throw new Error('Razorpay order creation failed');
        }
      } else {
        console.warn('[Payments] Razorpay not configured - using UPI manual collection');
        razorpayOrderId = null;
        method = 'upi';
      }

      payment = await prisma.payment.create({
        data: {
          bookingId,
          amount: Number(amount),
          platformFee,
          workerPayout,
          status: 'pending',
          paymentMethod: method,
          razorpayOrderId,
        },
      });
    } else if (payment.paymentMethod === 'razorpay' && razorpay && !payment.razorpayOrderId) {
      // Backfill a missing Razorpay order id for an existing Razorpay payment.
      const order = await razorpay.orders.create({
        amount: Math.round(Number(payment.amount) * 100),
        currency: 'INR',
        receipt: `booking_${bookingId.slice(0, 8)}`,
      });
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: { razorpayOrderId: order.id },
      });
    }

    const upiLink = payment.paymentMethod === 'upi' ? buildUpiLink(bookingId, Number(payment.amount)) : null;

    return res.json({
      payment,
      razorpayOrderId: payment.razorpayOrderId,
      upi: upiLink
        ? {
            pa: upiVpa,
            pn: upiName,
            am: Number(payment.amount),
            cu: 'INR',
            tn: `HomeHelp Booking ${bookingId.slice(0, 8)}`,
            link: upiLink,
          }
        : null,
    });
  } catch (err) {
    console.error('[payments] create-order error:', err);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Admin confirms a manually-collected payment (e.g. UPI transfer verified in bank).
paymentsRouter.post('/:id/mark-paid', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status === 'paid' || payment.status === 'captured') {
      return res.json({ payment });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: { status: 'paid' },
    });

    console.log(`[Payments] Payment ${id} marked paid by admin ${req.user!.userId}`);
    return res.json({ payment: updated });
  } catch (err) {
    console.error('[payments] mark-paid error:', err);
    return res.status(500).json({ error: 'Failed to mark payment paid' });
  }
});

paymentsRouter.post('/verify', async (req, res) => {
  try {
    const { paymentId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required' });
    }

    // 1. Fetch payment from DB first
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true }
    });

    if (!payment) {
      console.error(`[Payments] Verification failed: Payment ${paymentId} not found`);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // 2. Access Control
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isAdmin = user?.isAdmin ?? false;

    if (!isAdmin && (!payment.booking || payment.booking.userId !== req.user!.userId)) {
      console.error(`[Payments] Access denied for user ${req.user!.userId} on payment ${paymentId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // 3. Signature Verification
    if (!razorpay) {
      console.warn('[Payments] Razorpay not configured - skipping signature verification');
    } else {
      if (!razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ error: 'razorpayPaymentId and razorpaySignature are required' });
      }

      if (!payment.razorpayOrderId) {
        console.error(`[Payments] Verification failed: No razorpayOrderId for payment ${paymentId}`);
        return res.status(400).json({ error: 'No razorpay order ID found for this payment' });
      }

      const isValid = verifySignature(payment.razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        console.error(`[Payments] Invalid signature for payment ${paymentId}. OrderID: ${payment.razorpayOrderId}, PaymentID: ${razorpayPaymentId}`);
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    // 4. Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'captured',
        razorpayPaymentId: razorpayPaymentId || undefined,
      },
    });

    console.log(`[Payments] Payment ${paymentId} successfully verified and captured`);
    return res.json({ payment: updatedPayment });
  } catch (err) {
    console.error('[payments] verify error:', err);
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
  } catch (err) {
    console.error('[payments] get booking payment error:', err);
    return res.status(500).json({ error: 'Failed to fetch payment' });
  }
});
