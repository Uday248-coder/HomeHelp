import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// Helper to run payouts
export async function processWeeklyPayouts(start: Date, end: Date) {
  const existing = await prisma.workerPayout.findFirst({
    where: { weekStartDate: start, weekEndDate: end },
  });
  if (existing) {
    console.log('[cron:payouts] Payouts already processed for this week. Skipping.');
    return;
  }

  const completedBookings = await prisma.booking.findMany({
    where: {
      status: 'completed',
      completedAt: { gte: start, lte: end },
      workerId: { not: null },
      payment: { status: { in: ['captured', 'paid'] } },
    },
    select: {
      workerId: true,
      payment: { select: { workerPayout: true, amount: true } },
    },
  });

  if (completedBookings.length === 0) {
    console.log('[cron:payouts] No completed bookings found for this period.');
    return;
  }

  const workerTotals = new Map<string, number>();
  let skippedBookings = 0;

  for (const b of completedBookings) {
    if (!b.workerId) continue;
    const stored = b.payment?.workerPayout ? Number(b.payment.workerPayout) : null;
    const amount = b.payment?.amount ? Number(b.payment.amount) : null;
    const payout = stored !== null && stored > 0
      ? stored
      : (amount !== null && amount > 0 ? parseFloat((amount * 0.85).toFixed(2)) : 0);
    
    if (payout <= 0) {
      skippedBookings += 1;
      continue;
    }
    workerTotals.set(b.workerId, (workerTotals.get(b.workerId) || 0) + payout);
  }

  if (skippedBookings > 0) {
    console.warn(`[cron:payouts] Skipped ${skippedBookings} bookings with no valid worker payout.`);
  }

  if (workerTotals.size === 0) {
    console.log('[cron:payouts] No valid worker payouts found for this period.');
    return;
  }

  await Promise.all(
    Array.from(workerTotals.entries()).map(([workerId, amount]) =>
      prisma.workerPayout.create({
        data: {
          workerId,
          amount,
          weekStartDate: start,
          weekEndDate: end,
          status: 'pending',
        },
      })
    )
  );

  console.log(`[cron:payouts] Successfully created ${workerTotals.size} payouts for the week.`);
}

export function startPayoutCron() {
  // Run at 00:00 every Monday
  cron.schedule('0 0 * * 1', async () => {
    console.log('[cron:payouts] Running automated weekly payout job...');
    try {
      const now = new Date();
      // Calculate previous Monday
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - 7);
      start.setHours(0, 0, 0, 0);

      // Calculate previous Sunday
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      await processWeeklyPayouts(start, end);
    } catch (error) {
      console.error('[cron:payouts] CRON Error:', error);
    }
  });
  console.log('[cron:payouts] Cron job scheduled: 00:00 every Monday.');
}
