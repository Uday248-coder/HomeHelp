import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { canActivate } from '../lib/eligibility';

export const workersRouter = Router();

const BOOKING_SAFE_FIELDS = {
  id: true, userId: true, mode: true, serviceType: true, status: true,
  scheduledAt: true, startedAt: true, completedAt: true,
  durationHours: true, hourlyRate: true, customerAddress: true,
  ratingByUser: true, reviewText: true, createdAt: true, updatedAt: true,
} as const;

const PAYOUT_SAFE_FIELDS = {
  id: true, workerId: true, amount: true, status: true,
  weekStartDate: true, weekEndDate: true, processedAt: true,
  createdAt: true, updatedAt: true,
} as const;

const WORKER_DETAIL_FIELDS = {
  id: true, userId: true, name: true, workerType: true, phoneNumber: true,
  photoUrl: true, experience: true, averageRating: true, totalJobs: true,
  isAvailable: true, isActive: true, aadhaarVerified: true, licenseVerified: true,
  currentLat: true, currentLng: true, deactivationReason: true,
  createdAt: true, updatedAt: true,
} as const;

workersRouter.get('/', authMiddleware, async (_req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        workerType: true,
        phoneNumber: true,
        averageRating: true,
        photoUrl: true,
        isAvailable: true,
        isActive: true,
        aadhaarVerified: true,
        licenseVerified: true,
        deactivationReason: true,
        totalJobs: true,
      },
    });
    return res.json({ workers });
  } catch (err) {
    console.error('[workers] fetch workers error:', err);
    return res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

workersRouter.post('/register', authMiddleware, async (req, res) => {
  try {
    const { workerType, name, photoUrl, phoneNumber: bodyPhone, experience } = req.body;
    if (!workerType || !name) {
      return res.status(400).json({ error: 'workerType and name are required' });
    }
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const phoneNumber = bodyPhone || user?.phoneNumber || undefined;

    const existingByUser = await prisma.worker.findUnique({ where: { userId } });
    if (existingByUser) {
      return res.status(409).json({ error: 'A worker profile already exists for this account' });
    }
    if (phoneNumber) {
      const existing = await prisma.worker.findUnique({ where: { phoneNumber } });
      if (existing) {
        return res.status(409).json({ error: 'Worker profile already exists for this phone number' });
      }
    }

    const worker = await prisma.worker.create({
      data: { 
        workerType, 
        name, 
        phoneNumber,
        experience: experience || undefined,
        userId,
        photoUrl,
        isActive: false, // Needs admin approval
      },
      select: {
        id: true, name: true, workerType: true,
        phoneNumber: true, photoUrl: true, isAvailable: true,
        averageRating: true, createdAt: true,
      },
    });
    return res.status(201).json({ worker });
  } catch (err) {
    console.error('[workers] register worker error:', err);
    return res.status(500).json({ error: 'Failed to register worker' });
  }
});

workersRouter.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { workerType, name, phoneNumber, photoUrl } = req.body;
    if (!workerType || !name || !phoneNumber) {
      return res.status(400).json({ error: 'workerType, name, and phoneNumber are required' });
    }

    const existing = await prisma.worker.findUnique({ where: { phoneNumber } });
    if (existing) {
      return res.status(409).json({ error: 'Worker with this phone number already exists' });
    }

    const worker = await prisma.worker.create({
      data: { workerType, name, phoneNumber, photoUrl },
      select: {
        id: true, name: true, workerType: true,
        phoneNumber: true, photoUrl: true, isAvailable: true,
        averageRating: true, createdAt: true,
      },
    });
    return res.status(201).json({ worker });
  } catch (err) {
    console.error('[workers] create worker error:', err);
    return res.status(500).json({ error: 'Failed to create worker' });
  }
});

workersRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
      select: {
        ...WORKER_DETAIL_FIELDS,
        bookings: {
          select: BOOKING_SAFE_FIELDS,
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
        payouts: {
          select: PAYOUT_SAFE_FIELDS,
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });
    return res.json({ worker });
  } catch (err) {
    console.error('[workers] fetch worker profile error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker profile' });
  }
});

workersRouter.patch('/me/availability', authMiddleware, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    if (isAvailable === undefined) return res.status(400).json({ error: 'isAvailable is required' });

    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const updated = await prisma.worker.update({
      where: { id: worker.id },
      data: { isAvailable },
    });
    return res.json({ worker: updated });
  } catch (err) {
    console.error('[workers] update availability error:', err);
    return res.status(500).json({ error: 'Failed to update availability' });
  }
});

workersRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.params.id },
      select: {
        ...WORKER_DETAIL_FIELDS,
        bookings: {
          select: BOOKING_SAFE_FIELDS,
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
        payouts: {
          select: PAYOUT_SAFE_FIELDS,
          orderBy: { createdAt: 'desc' },
          take: 25,
        },
      },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isOwnProfile = req.user!.userId === worker.userId;
    const isAdmin = user?.isAdmin ?? false;

    if (!isOwnProfile && !isAdmin) {
      return res.json({
        worker: {
          id: worker.id,
          name: worker.name,
          workerType: worker.workerType,
          averageRating: worker.averageRating,
          photoUrl: worker.photoUrl,
          isAvailable: worker.isAvailable,
        },
      });
    }

    return res.json({ worker });
  } catch (err) {
    console.error('[workers] get worker error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

workersRouter.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, photoUrl, aadhaarVerified, licenseVerified, isAvailable, isActive, currentLat, currentLng, deactivationReason } = req.body;
    const workerId = req.params.id as string;

    const existing = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!existing) return res.status(404).json({ error: 'Worker not found' });

    // Activation guard: a worker can only be activated once the required
    // verification is in place (Aadhaar for all; License for driver-only types).
    if (isActive === true) {
      const check = canActivate({
        workerType: existing.workerType,
        aadhaarVerified: aadhaarVerified !== undefined ? aadhaarVerified : existing.aadhaarVerified,
        licenseVerified: licenseVerified !== undefined ? licenseVerified : existing.licenseVerified,
      });
      if (!check.ok) return res.status(400).json({ error: check.reason });
    }

    const worker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        ...(name !== undefined && { name }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(aadhaarVerified !== undefined && { aadhaarVerified }),
        ...(licenseVerified !== undefined && { licenseVerified }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isActive !== undefined && { isActive }),
        // Clear the archive reason on activation; set/keep it otherwise.
        ...(isActive === true
          ? { deactivationReason: null }
          : deactivationReason !== undefined && { deactivationReason }),
        ...(currentLat !== undefined && { currentLat: parseFloat(currentLat) }),
        ...(currentLng !== undefined && { currentLng: parseFloat(currentLng) }),
      },
    });
    return res.json({ worker });
  } catch (err) {
    console.error('[workers] update worker error:', err);
    return res.status(500).json({ error: 'Failed to update worker' });
  }
});

workersRouter.get('/available/:mode', authMiddleware, async (req, res) => {
  try {
    const mode = req.params.mode;
    const isDriver = mode === 'driver';
    const workers = await prisma.worker.findMany({
      where: {
        isAvailable: true,
        isActive: true,
        workerType: isDriver ? { in: ['driver', 'both'] } : { in: ['home_help', 'both'] },
        // Verification gate: Aadhaar for all, License additionally for driving.
        aadhaarVerified: true,
        ...(isDriver && { licenseVerified: true }),
      },
      select: {
        id: true,
        name: true,
        workerType: true,
        averageRating: true,
        photoUrl: true,
        isAvailable: true,
      },
    });
    return res.json({ workers });
  } catch (err) {
    console.error('[workers] available workers error:', err);
    return res.status(500).json({ error: 'Failed to fetch available workers' });
  }
});
