import crypto from 'node:crypto';

export interface YoupiClientOptions {
  apiUrl?: string;
  merchantId?: string;
  webhookSecret?: string;
  portalUrl?: string;
}

export interface CreatePaymentParams {
  orderId: string;
  amount: number | string;
  currency?: string;
  returnUrl?: string;
  customer?: {
    phoneNumber?: string;
    name?: string;
    email?: string;
  };
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

export interface CreatePaymentResult {
  paymentId: string;
  orderId: string;
  amount: string;
  amountPaise: string;
  currency: string;
  status: string;
  checkoutUrl: string;
  queuePosition?: number;
}

export interface YoupiPaymentDetails {
  paymentId: string;
  orderId: string;
  amount: string;
  amountPaise: string;
  currency: string;
  status: 'INITIATED' | 'ACTIVE' | 'QUEUED' | 'PROCESSING' | 'SUCCESS' | 'OBSERVED_SUCCESS' | 'RECONCILED' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | string;
  method?: string;
  utr?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  event?: any;
  error?: string;
}

export class YoupiClient {
  private apiUrl: string;
  private merchantId: string | null;
  private webhookSecret: string | null;
  private portalUrl: string;

  constructor(options: YoupiClientOptions = {}) {
    let url = options.apiUrl || process.env.YOUPI_API_URL || 'http://localhost:6100';
    while (url.endsWith('/')) url = url.slice(0, -1);
    this.apiUrl = url;

    let portal = options.portalUrl || process.env.YOUPI_PORTAL_URL || 'http://localhost:7000';
    while (portal.endsWith('/')) portal = portal.slice(0, -1);
    this.portalUrl = portal;

    this.merchantId = options.merchantId || process.env.YOUPI_MERCHANT_ID || null;
    this.webhookSecret = options.webhookSecret || process.env.YOUPI_WEBHOOK_SECRET || null;
  }

  isConfigured(): boolean {
    return !!(this.apiUrl && this.webhookSecret);
  }

  getPortalUrl(): string {
    return this.portalUrl;
  }

  /**
   * Initializes a new payment session on the self-hosted YouPI-PG gateway.
   */
  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    const url = `${this.apiUrl}/api/v1/payments`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.merchantId) {
      headers['X-Merchant-Id'] = this.merchantId;
    }
    if (this.webhookSecret) {
      headers['X-Merchant-Key'] = this.webhookSecret;
    }
    if (params.idempotencyKey) {
      headers['Idempotency-Key'] = params.idempotencyKey;
    }

    const formattedAmount = typeof params.amount === 'number' 
      ? params.amount.toFixed(2) 
      : parseFloat(params.amount).toFixed(2);

    const payload = {
      orderId: params.orderId,
      amount: formattedAmount,
      currency: params.currency || 'INR',
      returnUrl: params.returnUrl,
      customer: params.customer,
      metadata: params.metadata,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouPI createPayment failed [HTTP ${res.status}]: ${err}`);
    }

    const data = (await res.json()) as CreatePaymentResult;
    return data;
  }

  /**
   * Queries payment status and details from YouPI-PG.
   */
  async getPayment(paymentId: string): Promise<YoupiPaymentDetails> {
    const url = `${this.apiUrl}/api/v1/payments/${paymentId}`;
    const headers: Record<string, string> = {};

    if (this.webhookSecret) {
      headers['X-Merchant-Key'] = this.webhookSecret;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouPI getPayment failed [HTTP ${res.status}]: ${err}`);
    }

    return (await res.json()) as YoupiPaymentDetails;
  }

  /**
   * Cancels an active or queued payment session.
   */
  async cancelPayment(paymentId: string): Promise<{ success: boolean; status: string }> {
    const url = `${this.apiUrl}/api/v1/checkout/${paymentId}/cancel`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`YouPI cancelPayment failed [HTTP ${res.status}]: ${err}`);
    }
    return (await res.json()) as { success: boolean; status: string };
  }

  /**
   * Cryptographically verifies incoming YouPI-PG webhook using HMAC-SHA256
   * against X-Gateway-Signature header.
   */
  verifyWebhook(rawPayloadString: string, signatureHeader?: string): WebhookVerificationResult {
    if (!this.webhookSecret) {
      return { isValid: false, error: 'YOUPI_WEBHOOK_SECRET is not configured' };
    }
    if (!signatureHeader) {
      return { isValid: false, error: 'Missing X-Gateway-Signature header' };
    }

    try {
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawPayloadString, 'utf8')
        .digest('hex');

      const expected = signatureHeader.startsWith('sha256=')
        ? `sha256=${hash}`
        : hash;

      const sigBuffer = Buffer.from(signatureHeader);
      const expectedBuffer = Buffer.from(expected);

      if (sigBuffer.length !== expectedBuffer.length) {
        return { isValid: false, error: 'Signature length mismatch' };
      }

      const match = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
      if (!match) {
        return { isValid: false, error: 'Signature mismatch' };
      }

      const parsed = JSON.parse(rawPayloadString);
      return { isValid: true, event: parsed };
    } catch (err: any) {
      return { isValid: false, error: err.message || 'Webhook verification exception' };
    }
  }

  /**
   * Builds direct standard UPI links & intent links for popular UPI apps.
   */
  static buildDirectUpiLinks(vpa: string, name: string, amount: number, bookingId: string, note?: string) {
    if (!vpa) return null;
    const tn = note || `HomeHelp Booking ${bookingId.slice(0, 8)}`;
    const params = new URLSearchParams({
      pa: vpa,
      pn: name,
      am: amount.toFixed(2),
      cu: 'INR',
      tn,
    });

    const standardLink = `upi://pay?${params.toString()}`;

    return {
      standard: standardLink,
      gpay: `tez://upi/pay?${params.toString()}`,
      phonepe: `phonepe://pay?${params.toString()}`,
      paytm: `paytmmp://pay?${params.toString()}`,
      cred: `cred://upi/pay?${params.toString()}`,
    };
  }
}

export const youpiClient = new YoupiClient();
