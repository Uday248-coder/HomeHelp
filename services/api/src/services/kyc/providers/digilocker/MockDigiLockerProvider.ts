import { IDigiLockerProvider, DigiLockerAuthRequest, DigiLockerDocument } from './IDigiLockerProvider';

export class MockDigiLockerProvider implements IDigiLockerProvider {
  name = 'MockDigiLocker';

  async getAuthorizationUrl(req: DigiLockerAuthRequest) {
    const stateObj = { workerId: req.workerId, random: Date.now() };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
    return {
      authUrl: `https://mock.digilocker.gov.in/oauth?callback=${encodeURIComponent(req.callbackUrl)}&state=${state}`,
      state
    };
  }

  async handleCallback(code: string, state: string) {
    return {
      accessToken: `mock_access_token_${code}`,
      digilockerId: `mock_digilocker_user_${Date.now()}`
    };
  }

  async fetchDocument(accessToken: string, docType: string): Promise<DigiLockerDocument | null> {
    if (docType === 'ADHAR') {
      return {
        docType: 'ADHAR',
        name: 'Mock Aadhaar User',
        dob: '1990-01-01',
        maskedId: 'XXXX-XXXX-9999',
        rawXml: '<Aadhaar>Mock Data</Aadhaar>'
      };
    }
    
    if (docType === 'DRVLC') {
      return {
        docType: 'DRVLC',
        name: 'Mock DL User',
        maskedId: 'XXXXXXXX1111',
        vehicleClasses: ['LMV', 'MCWG'],
        expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        rawXml: '<DrivingLicense>Mock Data</DrivingLicense>'
      };
    }
    
    return null;
  }
}
