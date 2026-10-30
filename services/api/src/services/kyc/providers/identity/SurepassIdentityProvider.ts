import { IIdentityProvider, IdentityVerificationRequest, IdentityVerificationResponse } from './IIdentityProvider';

export class SurepassIdentityProvider implements IIdentityProvider {
  name = 'SurepassIdentity';

  async startVerification(req: IdentityVerificationRequest): Promise<{ redirectUrl?: string; providerRefId: string; status: 'pending' | 'in_progress' }> {
    // In production, this would call Surepass Aadhaar OTP generation API
    // For sandbox, we simulate an immediate "in_progress" state
    return {
      providerRefId: `surepass_${Date.now()}_${req.workerId}`,
      status: 'in_progress',
    };
  }

  async checkStatus(providerRefId: string): Promise<IdentityVerificationResponse> {
    // In production, this would call Surepass to check OTP verification status
    // For sandbox, we simulate a successful verification
    return {
      success: true,
      status: 'verified',
      providerRefId,
      maskedAadhaar: 'XXXX-XXXX-1234',
      name: 'Sandbox User',
      dob: '1990-01-01',
    };
  }
}
