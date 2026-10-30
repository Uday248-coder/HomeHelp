import { describe, it, expect } from 'vitest';
import crypto from 'node:crypto';
import { YoupiClient } from './YoupiClient';

describe('YoupiClient', () => {
  const webhookSecret = 'test_secret_key_12345';
  const client = new YoupiClient({
    apiUrl: 'http://localhost:6100',
    merchantId: 'merchant-test-uuid',
    webhookSecret,
    portalUrl: 'http://localhost:7000',
  });

  describe('configuration & links', () => {
    it('should report configured when apiUrl and webhookSecret are set', () => {
      expect(client.isConfigured()).toBe(true);
      expect(client.getPortalUrl()).toBe('http://localhost:7000');
    });

    it('should generate valid UPI deep links for multiple apps', () => {
      const links = YoupiClient.buildDirectUpiLinks(
        'homehelp@upi',
        'HomeHelp',
        499,
        'booking-test-123',
        'Test Booking Note'
      );

      expect(links).not.toBeNull();
      expect(links!.standard).toContain('upi://pay?');
      expect(links!.standard).toContain('pa=homehelp%40upi');
      expect(links!.standard).toContain('am=499.00');
      expect(links!.gpay).toContain('tez://upi/pay?');
      expect(links!.phonepe).toContain('phonepe://pay?');
      expect(links!.paytm).toContain('paytmmp://pay?');
      expect(links!.cred).toContain('cred://upi/pay?');
    });
  });

  describe('HMAC-SHA256 Webhook Verification', () => {
    it('should correctly verify an authentic HMAC-SHA256 signature', () => {
      const payload = JSON.stringify({
        event: 'RECONCILED',
        settlementState: 'RECONCILED',
        orderId: 'ORDER-1001',
        paymentId: 'youpi-uuid-1',
        amount: '499.00',
        amountPaise: 49900,
        utr: '123456789012',
      });

      const hash = crypto.createHmac('sha256', webhookSecret).update(payload, 'utf8').digest('hex');
      const signatureHeader = `sha256=${hash}`;

      const result = client.verifyWebhook(payload, signatureHeader);
      expect(result.isValid).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event.orderId).toBe('ORDER-1001');
      expect(result.event.utr).toBe('123456789012');
    });

    it('should reject tampered payload', () => {
      const originalPayload = JSON.stringify({ orderId: 'ORDER-1001', amount: '499.00' });
      const hash = crypto.createHmac('sha256', webhookSecret).update(originalPayload, 'utf8').digest('hex');
      const signatureHeader = `sha256=${hash}`;

      const tamperedPayload = JSON.stringify({ orderId: 'ORDER-1001', amount: '1.00' });
      const result = client.verifyWebhook(tamperedPayload, signatureHeader);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('mismatch');
    });

    it('should reject missing or malformed signature header', () => {
      const payload = JSON.stringify({ orderId: 'ORDER-1001' });
      const result = client.verifyWebhook(payload, undefined);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Missing');
    });
  });
});
