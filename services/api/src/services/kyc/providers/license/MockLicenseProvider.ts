import { ILicenseProvider, LicenseVerificationRequest, LicenseVerificationResponse } from './ILicenseProvider';

export class MockLicenseProvider implements ILicenseProvider {
  name = 'MockLicense';

  async verifyLicense(req: LicenseVerificationRequest): Promise<LicenseVerificationResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const providerRefId = `mock_dl_${Date.now()}`;
        if (req.dlNumber.includes('EXPIRED')) {
          resolve({ 
            success: false, 
            status: 'expired', 
            providerRefId, 
            expiryDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), 
            failureReason: 'License has expired' 
          });
        } else if (req.dlNumber.includes('INVALID')) {
          resolve({ 
            success: false, 
            status: 'failed', 
            providerRefId, 
            failureReason: 'Invalid driving license number' 
          });
        } else if (req.dlNumber.includes('MISMATCH')) {
          resolve({ 
            success: false, 
            status: 'manual_review', 
            providerRefId, 
            failureReason: 'Name mismatch on driving license' 
          });
        } else {
          resolve({
            success: true,
            status: 'verified',
            providerRefId,
            maskedDlNumber: 'XXXXXXXX' + (req.dlNumber.length >= 4 ? req.dlNumber.slice(-4) : '1234'),
            name: req.workerName,
            dob: req.dob,
            vehicleClasses: ['LMV', 'MCWG'],
            expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
            dlStatus: 'ACTIVE'
          });
        }
      }, 1000);
    });
  }
}
