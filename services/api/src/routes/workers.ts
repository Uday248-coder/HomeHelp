import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const workersRouter = Router();

workersRouter.get('/', async (_req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json({ workers });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

workersRouter.post('/', authMiddleware, async (req, res) => {
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
    });
    return res.status(201).json({ worker });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create worker' });
  }
});

workersRouter.get('/:id', async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.params.id },
      include: { bookings: true, payouts: true },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    return res.json({ worker });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch worker' });
  }
});

workersRouter.patch('/:id', authMiddleware, async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update worker' });
  }
});

workersRouter.get('/available/:mode', async (req, res) => {
  try {
    const mode = req.params.mode;
    const workers = await prisma.worker.findMany({
      where: {
        isAvailable: true,
        isActive: true,
        workerType: mode === 'driver' ? { in: ['driver', 'both'] } : { in: ['home_help', 'both'] },
      },
    });
    return res.json({ workers });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch available workers' });
  }
});
