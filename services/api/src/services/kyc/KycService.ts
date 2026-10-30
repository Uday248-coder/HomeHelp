import { prisma } from '../../lib/prisma';
import { VerificationStatus } from '@prisma/client';
import { getIdentityProvider, getLicenseProvider, getDigiLockerProvider } from './provider-factory';
import { logKycEvent } from './KycAuditService';

export class KycService {
  async getWorkerKycStatus(workerId: string) {
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { kycVerifications: true }
    });
    
    if (!worker) {
      throw new Error('Worker not found');
    }

    const identityVerification = worker.kycVerifications.find(v => v.verificationType === 'identity');
    const licenseVerification = worker.kycVerifications.find(v => v.verificationType === 'driving_licence');

    const identityStatus = identityVerification?.status || 'not_started';
    const licenseStatus = licenseVerification?.status || 'not_started';

    return {
      identityStatus,
      licenseStatus,
      overallStatus: this.calculateOverallStatus({
        workerType: worker.workerType,
        kycVerifications: worker.kycVerifications.map(v => ({ verificationType: v.verificationType, status: v.status }))
      })
    };
  }

  async startIdentityVerification(workerId: string, workerName: string, aadhaarNumber?: string) {
    const provider = getIdentityProvider();
    
    const { providerRefId, status, redirectUrl } = await provider.startVerification({
      workerId,
      workerName,
      aadhaarNumber
    });

    await prisma.kycVerification.upsert({
      where: { workerId_verificationType: { workerId, verificationType: 'identity' } },
      create: {
        workerId,
        verificationType: 'identity',
        status: 'pending',
        provider: provider.name,
        providerRefId
      },
      update: {
        status: 'pending',
        provider: provider.name,
        providerRefId
      }
    });

    await logKycEvent({ workerId, event: 'IDENTITY_VERIFICATION_STARTED', provider: provider.name });

    return { providerRefId, status, redirectUrl };
  }

  async checkIdentityStatus(workerId: string) {
    const verification = await prisma.kycVerification.findUnique({
      where: { workerId_verificationType: { workerId, verificationType: 'identity' } }
    });

    if (!verification || !verification.providerRefId) {
      throw new Error('No pending verification found');
    }

    const provider = getIdentityProvider();
    const response = await provider.checkStatus(verification.providerRefId);

    const updated = await prisma.kycVerification.update({
      where: { id: verification.id },
      data: {
        status: response.status,
        maskedIdentifier: response.maskedAadhaar,
        nameOnDocument: response.name,
        dobOnDocument: response.dob ? new Date(response.dob) : null,
        failureReason: response.failureReason,
        verifiedAt: response.status === 'verified' ? new Date() : null
      }
    });

    if (response.status === 'verified') {
      await this.syncVerificationBooleans(workerId);
      await logKycEvent({ workerId, event: 'IDENTITY_VERIFIED', provider: provider.name });
    } else if (response.status === 'failed') {
      await logKycEvent({ workerId, event: 'IDENTITY_VERIFICATION_FAILED', provider: provider.name });
    } else if (response.status === 'manual_review') {
      await logKycEvent({ workerId, event: 'MANUAL_REVIEW_STARTED', provider: provider.name });
    }

    return updated;
  }

  async startLicenseVerification(workerId: string, dlNumber: string, dob: string, workerName: string) {
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    
    if (!worker) {
      throw new Error('Worker not found');
    }
    
    if (worker.workerType !== 'driver' && worker.workerType !== 'both') {
      throw new Error('DL verification is not required for this worker type');
    }

    const provider = getLicenseProvider();
    await logKycEvent({ workerId, event: 'DL_VERIFICATION_STARTED', provider: provider.name });

    const response = await provider.verifyLicense({ workerId, dlNumber, dob, workerName });

    const maskedDl = 'XXXXXXXX' + (dlNumber.length >= 4 ? dlNumber.slice(-4) : dlNumber);

    const updated = await prisma.kycVerification.upsert({
      where: { workerId_verificationType: { workerId, verificationType: 'driving_licence' } },
      create: {
        workerId,
        verificationType: 'driving_licence',
        status: response.status,
        provider: provider.name,
        providerRefId: response.providerRefId,
        maskedIdentifier: maskedDl,
        nameOnDocument: response.name,
        dobOnDocument: response.dob ? new Date(response.dob) : null,
        failureReason: response.failureReason,
        verifiedAt: response.status === 'verified' ? new Date() : null
      },
      update: {
        status: response.status,
        provider: provider.name,
        providerRefId: response.providerRefId,
        maskedIdentifier: maskedDl,
        nameOnDocument: response.name,
        dobOnDocument: response.dob ? new Date(response.dob) : null,
        failureReason: response.failureReason,
        verifiedAt: response.status === 'verified' ? new Date() : null
      }
    });

    if (response.status === 'verified') {
      await this.syncVerificationBooleans(workerId);
      await logKycEvent({ workerId, event: 'DL_VERIFIED', provider: provider.name });
    } else if (response.status === 'failed' || response.status === 'expired') {
      await logKycEvent({ workerId, event: 'DL_VERIFICATION_FAILED', provider: provider.name, metadata: { reason: response.failureReason } });
    } else if (response.status === 'manual_review') {
      await logKycEvent({ workerId, event: 'MANUAL_REVIEW_STARTED', provider: provider.name });
    }

    return updated;
  }

  async startDigiLocker(workerId: string, callbackUrl: string) {
    const provider = getDigiLockerProvider();
    const res = await provider.getAuthorizationUrl({ workerId, callbackUrl });
    
    await logKycEvent({ workerId, event: 'KYC_STARTED', provider: provider.name });
    
    return res;
  }

  async handleDigiLockerCallback(workerId: string, code: string, state: string) {
    const provider = getDigiLockerProvider();
    const { accessToken } = await provider.handleCallback(code, state);

    await logKycEvent({ workerId, event: 'DIGILOCKER_CONSENT_GRANTED', provider: provider.name });

    const adharDoc = await provider.fetchDocument(accessToken, 'ADHAR');
    if (adharDoc) {
      await prisma.kycVerification.upsert({
        where: { workerId_verificationType: { workerId, verificationType: 'identity' } },
        create: {
          workerId,
          verificationType: 'identity',
          status: 'verified',
          provider: provider.name,
          maskedIdentifier: adharDoc.maskedId,
          nameOnDocument: adharDoc.name,
          dobOnDocument: adharDoc.dob ? new Date(adharDoc.dob) : null,
          verifiedAt: new Date()
        },
        update: {
          status: 'verified',
          provider: provider.name,
          maskedIdentifier: adharDoc.maskedId,
          nameOnDocument: adharDoc.name,
          dobOnDocument: adharDoc.dob ? new Date(adharDoc.dob) : null,
          verifiedAt: new Date()
        }
      });
      await logKycEvent({ workerId, event: 'IDENTITY_VERIFIED', provider: provider.name });
    }

    const dlDoc = await provider.fetchDocument(accessToken, 'DRVLC');
    if (dlDoc) {
      await prisma.kycVerification.upsert({
        where: { workerId_verificationType: { workerId, verificationType: 'driving_licence' } },
        create: {
          workerId,
          verificationType: 'driving_licence',
          status: 'verified',
          provider: provider.name,
          maskedIdentifier: dlDoc.maskedId,
          nameOnDocument: dlDoc.name,
          dobOnDocument: dlDoc.dob ? new Date(dlDoc.dob) : null,
          verifiedAt: new Date()
        },
        update: {
          status: 'verified',
          provider: provider.name,
          maskedIdentifier: dlDoc.maskedId,
          nameOnDocument: dlDoc.name,
          dobOnDocument: dlDoc.dob ? new Date(dlDoc.dob) : null,
          verifiedAt: new Date()
        }
      });
      await logKycEvent({ workerId, event: 'DL_VERIFIED', provider: provider.name });
    }

    await this.syncVerificationBooleans(workerId);
    return { success: true };
  }
  async adminReview(workerId: string, verificationType: string, action: 'approve' | 'reject' | 'request_reverification', adminId: string, notes?: string) {
    let statusEnum: VerificationStatus = 'pending' as VerificationStatus;
    let verifiedAt: Date | null = null;
    let failureReason: string | null = null;
    let auditEvent: any = 'REVERIFICATION_REQUESTED';

    if (action === 'approve') {
      statusEnum = 'verified' as VerificationStatus;
      verifiedAt = new Date();
      auditEvent = 'MANUAL_REVIEW_APPROVED';
    } else if (action === 'reject') {
      statusEnum = 'failed' as VerificationStatus;
      failureReason = notes || 'Rejected during manual review';
      auditEvent = 'MANUAL_REVIEW_REJECTED';
    } else {
      auditEvent = 'REVERIFICATION_REQUESTED';
    }

    const verification = await prisma.kycVerification.update({
      where: { workerId_verificationType: { workerId, verificationType } },
      data: { status: statusEnum, verifiedAt, failureReason, reviewedByAdminId: adminId, reviewNotes: notes }
    });

    await logKycEvent({ workerId, event: auditEvent, performedBy: adminId, metadata: { notes } });
    await this.syncVerificationBooleans(workerId);

    return verification;
  }

  calculateOverallStatus(worker: { workerType: string; kycVerifications: Array<{ verificationType: string; status: string }> }): 'verified' | 'pending' | 'failed' | 'manual_review' | 'not_started' {
    const identity = worker.kycVerifications.find(v => v.verificationType === 'identity')?.status;
    const license = worker.kycVerifications.find(v => v.verificationType === 'driving_licence')?.status;

    const requiresLicense = worker.workerType === 'driver' || worker.workerType === 'both';
    const requiredStatuses = requiresLicense ? [identity, license] : [identity];

    if (requiredStatuses.every(s => s === undefined || s === 'not_started')) {
      return 'not_started';
    }
    
    if (requiredStatuses.some(s => s === 'failed' || s === 'expired')) {
      return 'failed';
    }
    
    if (requiredStatuses.some(s => s === 'manual_review')) {
      return 'manual_review';
    }
    
    if (requiredStatuses.every(s => s === 'verified')) {
      return 'verified';
    }
    
    return 'pending';
  }

  async syncVerificationBooleans(workerId: string): Promise<void> {
    const verifications = await prisma.kycVerification.findMany({ where: { workerId } });
    
    const identityStatus = verifications.find(v => v.verificationType === 'identity')?.status;
    const licenseStatus = verifications.find(v => v.verificationType === 'driving_licence')?.status;

    await prisma.worker.update({
      where: { id: workerId },
      data: {
        aadhaarVerified: identityStatus === 'verified',
        licenseVerified: licenseStatus === 'verified'
      }
    });
  }
}

export const kycService = new KycService();
