import { ILicenseProvider, LicenseVerificationRequest, LicenseVerificationResponse } from './ILicenseProvider';

export class SurepassLicenseProvider implements ILicenseProvider {
  name = 'SurepassLicense';

  async verifyLicense(req: LicenseVerificationRequest): Promise<LicenseVerificationResponse> {
    // Real implementation would make a fetch() to Surepass with the DL number and DOB.
    
    if (req.dlNumber.endsWith('0000')) {
      return {
        success: false,
        status: 'failed',
        providerRefId: `surepass_dl_${Date.now()}`,
        failureReason: 'Surepass returned Invalid DL Number in Sandbox',
      };
    }

    if (req.dlNumber.endsWith('9999')) {
      return {
        success: false,
        status: 'manual_review',
        providerRefId: `surepass_dl_${Date.now()}`,
        failureReason: 'Name mismatch returned by Surepass',
      };
    }

    return {
      success: true,
      status: 'verified',
      providerRefId: `surepass_dl_${Date.now()}`,
      maskedDlNumber: req.dlNumber.replace(/.(?=....)/g, 'X'),
      name: req.workerName,
      dob: req.dob,
      vehicleClasses: ['LMV', 'MCWG'],
      expiryDate: '2030-12-31',
      dlStatus: 'ACTIVE',
    };
  }
}
