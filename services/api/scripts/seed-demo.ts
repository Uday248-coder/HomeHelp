import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

const CUSTOMER_EMAIL = 'demo.customer@homehelp.dev';
const WORKER_EMAIL = 'demo.worker@homehelp.dev';
const DEMO_PASSWORD = 'demo1234';

async function main() {
  const password = await hash(DEMO_PASSWORD, 10);

  const customer = await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: { password },
    create: { email: CUSTOMER_EMAIL, password, name: 'Demo Customer' },
  });

  const workerUser = await prisma.user.upsert({
    where: { email: WORKER_EMAIL },
    update: { password },
    create: { email: WORKER_EMAIL, password, name: 'Demo Worker' },
  });

  const worker = await prisma.worker.upsert({
    where: { userId: workerUser.id },
    update: {
      workerType: 'both',
      name: 'Demo Worker',
      isActive: true,
      isAvailable: true,
      aadhaarVerified: true,
      licenseVerified: true,
      averageRating: 4.8,
    },
    create: {
      userId: workerUser.id,
      workerType: 'both',
      name: 'Demo Worker',
      isActive: true,
      isAvailable: true,
      aadhaarVerified: true,
      licenseVerified: true,
      averageRating: 4.8,
    },
  });

  const existingBooking = await prisma.booking.findFirst({
    where: { userId: customer.id, status: 'pending', workerId: null },
  });
  if (!existingBooking) {
    await prisma.booking.create({
      data: {
        userId: customer.id,
        mode: 'home_help',
        serviceType: 'General Cleaning',
        status: 'pending',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        durationHours: 3,
        customerAddress: 'Salt Lake, Sector V, Kolkata',
      },
    });
  }

  console.log('Demo data ready:');
  console.log(`  Customer : ${CUSTOMER_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Worker   : ${WORKER_EMAIL} / ${DEMO_PASSWORD} (active, available, verified)`);
  console.log(`  Booking  : 1 pending home_help booking awaiting a worker`);
  console.log(`  Worker id: ${worker.id}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
