export interface DigiLockerAuthRequest {
  workerId: string;
  callbackUrl: string;
}

export interface DigiLockerDocument {
  docType: string; // 'ADHAR' | 'DRVLC'
  name?: string;
  dob?: string;
  maskedId?: string;
  vehicleClasses?: string[];
  expiryDate?: string;
  rawXml?: string; // Never expose to frontend
}

export interface IDigiLockerProvider {
  name: string;
  getAuthorizationUrl(req: DigiLockerAuthRequest): Promise<{ authUrl: string; state: string }>;
  handleCallback(code: string, state: string): Promise<{ accessToken: string; digilockerId: string }>;
  fetchDocument(accessToken: string, docType: string): Promise<DigiLockerDocument | null>;
}
