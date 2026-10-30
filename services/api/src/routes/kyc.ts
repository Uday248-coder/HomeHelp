import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { kycService } from '../services/kyc/KycService';
import { logKycEvent } from '../services/kyc/KycAuditService';
import rateLimit from 'express-rate-limit';

export const kycRouter = Router();

// Rate limit KYC endpoints: 10 requests per minute per IP
const kycLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many KYC requests, please try again later' },
});

kycRouter.use(kycLimiter);

// ─── Worker-facing endpoints (require auth) ──────────────────────────

// GET /api/kyc/status — Get worker's overall KYC status
kycRouter.get('/status', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const status = await kycService.getWorkerKycStatus(worker.id);
    return res.json(status);
  } catch (err) {
    console.error('[kyc] status error:', err);
    return res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

// POST /api/kyc/identity/start — Initiate Aadhaar/identity verification
kycRouter.post('/identity/start', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const result = await kycService.startIdentityVerification(worker.id, worker.name);
    return res.json(result);
  } catch (err: any) {
    console.error('[kyc] identity start error:', err);
    return res.status(500).json({ error: err.message || 'Failed to start identity verification' });
  }
});

// GET /api/kyc/identity/status — Check identity verification status
kycRouter.get('/identity/status', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const result = await kycService.checkIdentityStatus(worker.id);
    return res.json(result);
  } catch (err) {
    console.error('[kyc] identity status error:', err);
    return res.status(500).json({ error: 'Failed to check identity status' });
  }
});

// POST /api/kyc/license/start — Submit DL for verification
kycRouter.post('/license/start', authMiddleware, async (req, res) => {
  try {
    const { dlNumber, dob } = req.body;
    if (!dlNumber || !dob) {
      return res.status(400).json({ error: 'dlNumber and dob are required' });
    }

    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    if (worker.workerType === 'home_help') {
      return res.status(400).json({ error: 'Driving licence verification is not required for home_help workers' });
    }

    const result = await kycService.startLicenseVerification(worker.id, dlNumber, dob, worker.name);
    return res.json(result);
  } catch (err: any) {
    console.error('[kyc] license start error:', err);
    return res.status(500).json({ error: err.message || 'Failed to start licence verification' });
  }
});

// POST /api/kyc/digilocker/start — Generate DigiLocker OAuth URL
kycRouter.post('/digilocker/start', authMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!worker) return res.status(404).json({ error: 'Worker profile not found' });

    const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com'}/api/kyc/digilocker/callback`;
    const result = await kycService.startDigiLocker(worker.id, callbackUrl);
    return res.json(result);
  } catch (err) {
    console.error('[kyc] digilocker start error:', err);
    return res.status(500).json({ error: 'Failed to start DigiLocker flow' });
  }
});

// GET /api/kyc/digilocker/callback — DigiLocker OAuth redirect handler
kycRouter.get('/digilocker/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Decode state to get workerId
    const stateStr = Buffer.from(state as string, 'base64').toString('utf8');
    const stateObj = JSON.parse(stateStr);
    const workerId = stateObj.workerId;
    
    if (!workerId) {
       return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const result = await kycService.handleDigiLockerCallback(
      workerId,
      code as string,
      state as string,
    );

    // Redirect back to worker portal with status
    const frontendUrl = process.env.FRONTEND_URL || 'https://homehelp-website.vercel.app';
    const statusParam = result.success ? 'success' : 'error';
    return res.redirect(`${frontendUrl}/worker?kyc_status=${statusParam}`);
  } catch (err) {
    console.error('[kyc] digilocker callback error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'https://homehelp-website.vercel.app';
    return res.redirect(`${frontendUrl}/worker?kyc_status=error`);
  }
});

// ─── Admin-facing endpoints ──────────────────────────────────────────

// GET /api/kyc/admin/workers — List all workers with KYC status
kycRouter.get('/admin/workers', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        workerType: true,
        phoneNumber: true,
        photoUrl: true,
        aadhaarVerified: true,
        licenseVerified: true,
        isActive: true,
        isAvailable: true,
        createdAt: true,
        kycVerifications: {
          select: {
            verificationType: true,
            status: true,
            provider: true,
            maskedIdentifier: true,
            failureReason: true,
            reviewNotes: true,
            verifiedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    return res.json({ workers });
  } catch (err) {
    console.error('[kyc] admin workers error:', err);
    return res.status(500).json({ error: 'Failed to fetch workers KYC status' });
  }
});

// GET /api/kyc/admin/workers/:id — Detailed KYC info for one worker
kycRouter.get('/admin/workers/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const worker = await prisma.worker.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        workerType: true,
        phoneNumber: true,
        photoUrl: true,
        aadhaarVerified: true,
        licenseVerified: true,
        isActive: true,
        isAvailable: true,
        createdAt: true,
        kycVerifications: true,
        kycAuditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            event: true,
            provider: true,
            performedBy: true,
            metadata: true,
            createdAt: true,
          },
        },
      },
    });
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    return res.json({ worker });
  } catch (err) {
    console.error('[kyc] admin worker detail error:', err);
    return res.status(500).json({ error: 'Failed to fetch worker KYC details' });
  }
});

// POST /api/kyc/admin/workers/:id/review — Admin approve/reject/re-verify
kycRouter.post('/admin/workers/:id/review', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { verificationType, action, notes } = req.body;

    if (!verificationType || !action) {
      return res.status(400).json({ error: 'verificationType and action are required' });
    }
    if (!['approve', 'reject', 'request_reverification'].includes(action)) {
      return res.status(400).json({ error: 'action must be approve, reject, or request_reverification' });
    }
    if (!['identity', 'driving_licence'].includes(verificationType)) {
      return res.status(400).json({ error: 'verificationType must be identity or driving_licence' });
    }

    const result = await kycService.adminReview(
      req.params.id,
      verificationType,
      action,
      req.user!.userId,
      notes,
    );
    return res.json(result);
  } catch (err: any) {
    console.error('[kyc] admin review error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process review' });
  }
});

// GET /api/kyc/admin/audit/:workerId — Audit log for a worker
kycRouter.get('/admin/audit/:workerId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await prisma.kycAuditLog.findMany({
      where: { workerId: req.params.workerId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        event: true,
        provider: true,
        performedBy: true,
        metadata: true,
        createdAt: true,
      },
    });
    return res.json({ logs });
  } catch (err) {
    console.error('[kyc] admin audit error:', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});
