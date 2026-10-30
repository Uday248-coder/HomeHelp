import { prisma } from '../../lib/prisma';

export type KycEvent = 
  | 'KYC_STARTED'
  | 'IDENTITY_VERIFICATION_STARTED'
  | 'IDENTITY_VERIFIED'
  | 'IDENTITY_VERIFICATION_FAILED'
  | 'DIGILOCKER_CONSENT_GRANTED'
  | 'DL_VERIFICATION_STARTED'
  | 'DL_VERIFIED'
  | 'DL_VERIFICATION_FAILED'
  | 'DOCUMENT_ANALYZED'
  | 'MANUAL_REVIEW_STARTED'
  | 'MANUAL_REVIEW_APPROVED'
  | 'MANUAL_REVIEW_REJECTED'
  | 'REVERIFICATION_REQUESTED'
  | 'VERIFICATION_EXPIRED';

export async function logKycEvent(params: {
  workerId: string;
  event: KycEvent;
  provider?: string;
  performedBy?: string; // admin userId
  metadata?: Record<string, unknown>; // non-sensitive only
}): Promise<void> {
  await prisma.kycAuditLog.create({
    data: {
      workerId: params.workerId,
      event: params.event,
      provider: params.provider,
      performedBy: params.performedBy,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
