import { IIdentityProvider, IdentityVerificationRequest, IdentityVerificationResponse } from './IIdentityProvider';

export class MockIdentityProvider implements IIdentityProvider {
  name = 'MockIdentity';
  private static store = new Map<string, IdentityVerificationRequest>();

  async startVerification(req: IdentityVerificationRequest) {
    return new Promise<{ redirectUrl?: string; providerRefId: string; status: 'pending' | 'in_progress' }>((resolve) => {
      setTimeout(() => {
        const providerRefId = `mock_identity_${Date.now()}`;
        MockIdentityProvider.store.set(providerRefId, req);
        resolve({
          providerRefId,
          status: 'pending'
        });
      }, 1000);
    });
  }

  async checkStatus(providerRefId: string): Promise<IdentityVerificationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const req = MockIdentityProvider.store.get(providerRefId);
        const workerName = req?.workerName || '';

        if (workerName.includes('FAIL')) {
          resolve({ success: false, status: 'failed', providerRefId, failureReason: 'Simulated failure based on name' });
        } else if (workerName.includes('REVIEW')) {
          resolve({ success: false, status: 'manual_review', providerRefId, failureReason: 'Simulated manual review' });
        } else if (workerName.includes('PENDING')) {
          resolve({ success: true, status: 'pending', providerRefId });
        } else {
          resolve({ 
            success: true, 
            status: 'verified', 
            providerRefId, 
            maskedAadhaar: 'XXXX-XXXX-1234', 
            name: workerName || 'Mock User', 
            dob: '1995-01-15' 
          });
        }
      }, 1000);
    });
  }
}
