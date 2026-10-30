import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KycService } from './KycService';
import { prisma } from '../../lib/prisma';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    kycVerification: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    worker: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('./KycAuditService', () => ({
  logKycEvent: vi.fn(),
}));

describe('KycService', () => {
  let service: KycService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new KycService();
  });

  describe('startIdentityVerification', () => {
    it('should complete with mock provider using name-only flow and return pending initially', async () => {
      vi.mocked(prisma.kycVerification.upsert).mockResolvedValue({} as any);
      
      const res = await service.startIdentityVerification('w1', 'John Doe');
      
      // Since it's MockIdentityProvider, startVerification returns { status: 'pending' } initially
      expect(res.status).toBe('pending');
      expect(prisma.kycVerification.upsert).toHaveBeenCalled();
    });
  });

  describe('adminReview', () => {
    it('should approve kyc verification', async () => {
      vi.mocked(prisma.kycVerification.update).mockResolvedValue({} as any);
      vi.mocked(prisma.kycVerification.findMany).mockResolvedValue([{ verificationType: 'identity', status: 'verified' }] as any);
      vi.mocked(prisma.worker.update).mockResolvedValue({} as any);

      const res = await service.adminReview('w1', 'identity', 'approve', 'admin1');
      
      expect(prisma.kycVerification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'verified',
            reviewedByAdminId: 'admin1'
          })
        })
      );
      // It should sync boolean flags after
      expect(prisma.kycVerification.findMany).toHaveBeenCalledWith({ where: { workerId: 'w1' } });
      expect(prisma.worker.update).toHaveBeenCalled();
    });
  });
});
