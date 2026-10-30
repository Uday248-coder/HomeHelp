export interface LicenseVerificationRequest {
  workerId: string;
  dlNumber: string;
  dob: string; // ISO date
  workerName: string;
}

export interface LicenseVerificationResponse {
  success: boolean;
  status: 'verified' | 'failed' | 'expired' | 'manual_review';
  providerRefId: string;
  maskedDlNumber?: string; // 'XXXXXXXX1234'
  name?: string;
  dob?: string;
  vehicleClasses?: string[]; // ['LMV','MCWG']
  issueDate?: string;
  expiryDate?: string; // non-transport validity
  dlStatus?: string; // 'ACTIVE','SUSPENDED','EXPIRED'
  failureReason?: string;
}

export interface ILicenseProvider {
  name: string;
  verifyLicense(req: LicenseVerificationRequest): Promise<LicenseVerificationResponse>;
}
