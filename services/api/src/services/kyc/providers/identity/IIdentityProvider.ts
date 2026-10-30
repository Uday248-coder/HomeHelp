export interface IdentityVerificationRequest {
  workerId: string;
  workerName: string;
  aadhaarNumber?: string; // Only used transiently for OTP, never stored
}

export interface IdentityVerificationResponse {
  success: boolean;
  status: 'verified' | 'failed' | 'pending' | 'manual_review';
  providerRefId: string;
  maskedAadhaar?: string; // 'XXXX-XXXX-1234'
  name?: string;
  dob?: string; // ISO date
  gender?: string;
  photo?: string; // base64 or URL
  failureReason?: string;
}

export interface IIdentityProvider {
  name: string;
  startVerification(req: IdentityVerificationRequest): Promise<{ redirectUrl?: string; providerRefId: string; status: 'pending' | 'in_progress' }>;
  checkStatus(providerRefId: string): Promise<IdentityVerificationResponse>;
}
