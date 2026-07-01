import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

export const workersRouter = Router();

workersRouter.get('/', authMiddleware, async (_req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
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
    console.error('[workers] fetch workers error:', err);
    return res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

workersRouter.post('/register', authMiddleware, async (req, res) => {
  try {
    const { workerType, name, photoUrl } = req.body;
    if (!workerType || !name) {
      return res.status(400).json({ error: 'workerType and name are required' });
    }
    const phoneNumber = req.user!.phoneNumber;

    const existing = await prisma.worker.findUnique({ where: { phoneNumber } });
    if (existing) {
      return res.status(409).json({ error: 'Worker profile already exists for this phone number' });
    }

    const worker = await prisma.worker.create({
      data: { 
        workerType, 
        name, 
        phoneNumber, 
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

workersRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.params.id },
      include: { bookings: true, payouts: true },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    const isOwnProfile = req.user!.phoneNumber === worker.phoneNumber;
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

    const { name, photoUrl, aadhaarVerified, licenseVerified, isAvailable, isActive, currentLat, currentLng } = req.body;
    const workerId = req.params.id as string;
    const worker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        ...(name !== undefined && { name }),
        ...(photoUrl !== undefined && { photoUrl }),
        ...(aadhaarVerified !== undefined && { aadhaarVerified }),
        ...(licenseVerified !== undefined && { licenseVerified }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isActive !== undefined && { isActive }),
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

workersRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { phoneNumber: req.user!.phoneNumber },
      include: { bookings: true, payouts: true },
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
      where: { phoneNumber: req.user!.phoneNumber },
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

workersRouter.get('/available/:mode', authMiddleware, async (req, res) => {
  try {
    const mode = req.params.mode;
    const workers = await prisma.worker.findMany({
      where: {
        isAvailable: true,
        isActive: true,
        workerType: mode === 'driver' ? { in: ['driver', 'both'] } : { in: ['home_help', 'both'] },
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
