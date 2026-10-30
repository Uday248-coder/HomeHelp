import { IDigiLockerProvider, DigiLockerAuthRequest, DigiLockerDocument } from './IDigiLockerProvider';

export class SetuDigiLockerProvider implements IDigiLockerProvider {
  name = 'SetuDigiLocker';
  private baseUrl = 'https://dg-sandbox.setu.co/api';

  async getAuthorizationUrl(req: DigiLockerAuthRequest) {
    // In a real flow, we would call Setu's API to get an authorization URL
    const stateObj = { workerId: req.workerId, random: Date.now() };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
    
    return {
      authUrl: `${this.baseUrl}/authorize?client_id=sandbox_setu&redirect_uri=${encodeURIComponent(req.callbackUrl)}&state=${state}`,
      state
    };
  }

  async handleCallback(code: string, state: string) {
    // In a real flow, we would exchange the code for an access token
    return {
      accessToken: `setu_sandbox_token_${code}`,
      digilockerId: `setu_sandbox_user_${Date.now()}`
    };
  }

  async fetchDocument(accessToken: string, docType: string): Promise<DigiLockerDocument | null> {
    // In a real flow, we would fetch the specific document from Setu's API
    if (docType === 'ADHAR') {
      return {
        docType: 'ADHAR',
        name: 'Setu Sandbox Aadhaar',
        dob: '1990-01-01',
        maskedId: 'XXXX-XXXX-8888',
        rawXml: '<Aadhaar>Setu Mock</Aadhaar>'
      };
    }
    
    if (docType === 'DRVLC') {
      return {
        docType: 'DRVLC',
        name: 'Setu Sandbox DL',
        maskedId: 'XXXXXXXX8888',
        vehicleClasses: ['LMV'],
        expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        rawXml: '<DrivingLicense>Setu Mock</DrivingLicense>'
      };
    }
    
    return null;
  }
}
