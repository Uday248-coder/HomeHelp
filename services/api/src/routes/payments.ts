import { Router, Request } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { RATE_TABLE } from '../lib/constants';
import { youpiClient, YoupiClient } from '../services/youpi/YoupiClient';

export const paymentsRouter = Router();

const upiVpa = process.env.UPI_VPA || '';
const upiName = process.env.UPI_NAME || 'HomeHelp';

function computeWorkerPayout(amount: number): number {
  const platformFee = parseFloat((amount * 0.15).toFixed(2));
  return parseFloat((amount - platformFee).toFixed(2));
}

// YouPI-PG Webhook endpoint (unauthenticated, requires HMAC-SHA256 signature in X-Gateway-Signature)
paymentsRouter.post('/webhook', async (req: Request & { rawBody?: string }, res) => {
  try {
    const signature = (req.headers['x-gateway-signature'] || req.headers['x-webhook-signature']) as string;
    const rawBody = req.rawBody || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));

    if (!youpiClient.isConfigured()) {
      return res.status(400).json({ error: 'YouPI PG is not configured on this server' });
    }

    const verification = youpiClient.verifyWebhook(rawBody, signature);
    if (!verification.isValid) {
      console.error('[Payments] YouPI webhook verification failed:', verification.error);
      return res.status(401).json({ error: 'Invalid webhook signature', details: verification.error });
    }

    const payload = verification.event;
    console.log(`[Payments] Webhook received event=${payload.event} for orderId=${payload.orderId}`);

    // In YouPI PG: OBSERVED_SUCCESS, RECONCILED, or SUCCESS (COD/Counter/Direct)
    if (['RECONCILED', 'OBSERVED_SUCCESS', 'SUCCESS'].includes(payload.event)) {
      const orderId = payload.orderId;
      const paymentId = payload.paymentId;
      const utr = payload.utr;

      if (!orderId && !paymentId) {
        return res.status(400).json({ error: 'Missing orderId or paymentId in webhook payload' });
      }

      // Look up payment by youpiOrderId, youpiPaymentId, or fallback to cashfreeOrderId
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            ...(orderId ? [{ youpiOrderId: orderId }, { cashfreeOrderId: orderId }] : []),
            ...(paymentId ? [{ youpiPaymentId: paymentId }] : []),
          ],
        },
      });

      if (payment && (payment.status === 'pending' || payment.status === 'captured')) {
        const recomputed = computeWorkerPayout(Number(payment.amount));
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'paid',
            workerPayout: recomputed,
            utr: utr || payment.utr,
            youpiPaymentId: paymentId || payment.youpiPaymentId,
          },
        });
        console.log(`[Payments] YouPI Webhook processed. Payment ${payment.id} marked as PAID with UTR ${utr || 'N/A'}.`);
      }
    }

    return res.status(200).json({ status: 'OK', received: true });
  } catch (err) {
    console.error('[Payments] Webhook processing error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

paymentsRouter.use(authMiddleware);

paymentsRouter.post('/create-order', async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'You can only create payments for your own bookings' });
    }

    const defaultRate = booking.mode && RATE_TABLE[booking.mode] ? RATE_TABLE[booking.mode] : 0;
    const rate = booking.hourlyRate ? Number(booking.hourlyRate) : defaultRate;
    const hours = booking.durationHours ? Number(booking.durationHours) : 1;
    const amount = parseFloat((rate * hours).toFixed(2));

    if (amount <= 0) {
      return res.status(400).json({ error: 'Cannot create payment: booking has no valid rate or duration' });
    }

    const platformFee = parseFloat((amount * 0.15).toFixed(2));
    const workerPayout = computeWorkerPayout(amount);

    let payment = await prisma.payment.findUnique({ where: { bookingId } });

    if (payment && (payment.status === 'paid' || payment.status === 'captured')) {
      return res.status(409).json({ error: 'Payment already completed for this booking', payment });
    }

    let youpiPaymentId: string | null = null;
    let youpiOrderId: string | null = null;
    let checkoutUrl: string | null = null;
    let method = 'upi';

    const generatedOrderId = `booking_${bookingId.replace(/-/g, '').slice(0, 15)}_${Date.now()}`;

    if (!payment) {
      if (youpiClient.isConfigured()) {
        try {
          const youpiRes = await youpiClient.createPayment({
            orderId: generatedOrderId,
            amount,
            currency: 'INR',
            returnUrl: `${process.env.FRONTEND_URL || 'https://homehelp-website.vercel.app'}/my-bookings?order_id=${generatedOrderId}`,
            customer: {
              name: booking.user?.name || 'Customer',
              phoneNumber: booking.user?.phoneNumber || '9999999999',
              email: booking.user?.email || 'customer@homehelp.local',
            },
            metadata: {
              bookingId,
              userId: req.user!.userId,
            },
          });

          youpiPaymentId = youpiRes.paymentId || null;
          youpiOrderId = youpiRes.orderId || generatedOrderId;
          checkoutUrl = youpiRes.checkoutUrl || null;
          method = 'youpi';
        } catch (err: any) {
          console.warn('[Payments] YouPI session creation failed, falling back to direct UPI:', err.message);
          youpiOrderId = generatedOrderId;
          method = 'upi';
        }
      } else {
        youpiOrderId = generatedOrderId;
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
          youpiPaymentId,
          youpiOrderId,
        },
      });
    } else if (payment.status === 'pending') {
      youpiPaymentId = payment.youpiPaymentId;
      youpiOrderId = payment.youpiOrderId || generatedOrderId;
      method = payment.paymentMethod || 'upi';

      if (!youpiPaymentId && youpiClient.isConfigured()) {
        try {
          const youpiRes = await youpiClient.createPayment({
            orderId: youpiOrderId,
            amount: Number(payment.amount),
            currency: 'INR',
            returnUrl: `${process.env.FRONTEND_URL || 'https://homehelp-website.vercel.app'}/my-bookings?order_id=${youpiOrderId}`,
            customer: {
              name: booking.user?.name || 'Customer',
              phoneNumber: booking.user?.phoneNumber || '9999999999',
              email: booking.user?.email || 'customer@homehelp.local',
            },
            metadata: {
              bookingId,
              userId: req.user!.userId,
            },
          });
          youpiPaymentId = youpiRes.paymentId || null;
          checkoutUrl = youpiRes.checkoutUrl || null;
          method = 'youpi';

          payment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
              youpiPaymentId,
              paymentMethod: method,
            },
          });
        } catch (err: any) {
          console.warn('[Payments] YouPI session retry failed:', err.message);
        }
      }
    }

    const upiLinks = YoupiClient.buildDirectUpiLinks(upiVpa, upiName, Number(payment.amount), bookingId);

    return res.json({
      payment,
      youpiPaymentId: payment.youpiPaymentId,
      youpiOrderId: payment.youpiOrderId,
      checkoutUrl,
      portalUrl: youpiClient.getPortalUrl(),
      upi: upiLinks
        ? {
            pa: upiVpa,
            pn: upiName,
            am: Number(payment.amount),
            cu: 'INR',
            tn: `HomeHelp Booking ${bookingId.slice(0, 8)}`,
            link: upiLinks.standard,
            gpay: upiLinks.gpay,
            phonepe: upiLinks.phonepe,
            paytm: upiLinks.paytm,
            cred: upiLinks.cred,
          }
        : null,
    });
  } catch (err) {
    console.error('[payments] create-order error:', err);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
});

paymentsRouter.post('/:id/mark-paid', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { utr } = req.body || {};
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    if (payment.status === 'paid' || payment.status === 'captured') {
      return res.json({ payment });
    }

    const recomputed = computeWorkerPayout(Number(payment.amount));

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'paid',
        workerPayout: recomputed,
        ...(utr ? { utr } : {}),
      },
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
    const { paymentId, utr } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isAdmin = user?.isAdmin ?? false;

    if (!isAdmin && (!payment.booking || payment.booking.userId !== req.user!.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If UTR is provided by user, attach it to the payment record for reconciliation
    if (utr && utr !== payment.utr) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { utr },
      });
      payment.utr = utr;
    }

    // If already marked paid, return payment
    if (payment.status === 'paid' || payment.status === 'captured') {
      return res.json({ payment });
    }

    // If YouPI payment session exists and YouPI is configured, query status from YouPI-PG
    if (payment.youpiPaymentId && youpiClient.isConfigured()) {
      try {
        const details = await youpiClient.getPayment(payment.youpiPaymentId);
        if (['SUCCESS', 'OBSERVED_SUCCESS', 'RECONCILED'].includes(details.status)) {
          const recomputed = computeWorkerPayout(Number(payment.amount));
          const updated = await prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: 'paid',
              workerPayout: recomputed,
              utr: details.utr || payment.utr || utr,
            },
          });
          return res.json({ payment: updated, verified: true });
        }
      } catch (err: any) {
        console.warn(`[Payments] Could not query YouPI status for ${payment.youpiPaymentId}:`, err.message);
      }
    }

    // If payment is pending without gateway confirmation
    return res.status(400).json({
      error: 'Payment has not been completed or verified yet. If you completed the transfer, wait a moment for bank observation or have an admin confirm.',
      payment,
    });
  } catch (err: any) {
    console.error('[payments] verify error:', err);
    return res.status(500).json({ error: 'Failed to verify payment status' });
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
