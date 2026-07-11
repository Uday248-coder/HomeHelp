import { describe, it, expect } from 'vitest';
import {
  modeMatchesType,
  hasRequiredVerification,
  isWorkerEligible,
  eligibleModes,
  canActivate,
} from './eligibility';

describe('modeMatchesType', () => {
  it('matches home_help for home_help and both', () => {
    expect(modeMatchesType('home_help', 'home_help')).toBe(true);
    expect(modeMatchesType('home_help', 'both')).toBe(true);
    expect(modeMatchesType('home_help', 'driver')).toBe(false);
  });
  it('matches driver for driver and both', () => {
    expect(modeMatchesType('driver', 'driver')).toBe(true);
    expect(modeMatchesType('driver', 'both')).toBe(true);
    expect(modeMatchesType('driver', 'home_help')).toBe(false);
  });
});

describe('hasRequiredVerification', () => {
  it('requires Aadhaar for home_help', () => {
    expect(hasRequiredVerification('home_help', { aadhaarVerified: false, licenseVerified: false })).toBe(false);
    expect(hasRequiredVerification('home_help', { aadhaarVerified: true, licenseVerified: false })).toBe(true);
  });
  it('requires Aadhaar and License for driver', () => {
    expect(hasRequiredVerification('driver', { aadhaarVerified: true, licenseVerified: false })).toBe(false);
    expect(hasRequiredVerification('driver', { aadhaarVerified: true, licenseVerified: true })).toBe(true);
  });
});

describe('isWorkerEligible', () => {
  const base = { workerType: 'both' as const, aadhaarVerified: true, licenseVerified: true, isActive: true, isAvailable: true };

  it('rejects inactive workers', () => {
    expect(isWorkerEligible('home_help', { ...base, isActive: false })).toBe(false);
  });
  it('rejects unavailable workers only when availability is required', () => {
    expect(isWorkerEligible('home_help', { ...base, isAvailable: false })).toBe(true);
    expect(isWorkerEligible('home_help', { ...base, isAvailable: false }, { requireAvailable: true })).toBe(false);
  });
  it('rejects mode/type mismatch', () => {
    expect(isWorkerEligible('driver', { ...base, workerType: 'home_help' })).toBe(false);
  });
  it('rejects driver without license', () => {
    expect(isWorkerEligible('driver', { ...base, licenseVerified: false })).toBe(false);
  });
  it('allows a both-worker without license to do home_help', () => {
    expect(isWorkerEligible('home_help', { ...base, licenseVerified: false })).toBe(true);
  });
});

describe('eligibleModes', () => {
  it('returns both modes for a fully verified both-worker', () => {
    expect(eligibleModes({ workerType: 'both', aadhaarVerified: true, licenseVerified: true, isActive: true })).toEqual(['home_help', 'driver']);
  });
  it('returns only home_help for a both-worker missing license', () => {
    expect(eligibleModes({ workerType: 'both', aadhaarVerified: true, licenseVerified: false, isActive: true })).toEqual(['home_help']);
  });
  it('returns nothing for an unverified worker', () => {
    expect(eligibleModes({ workerType: 'both', aadhaarVerified: false, licenseVerified: false, isActive: true })).toEqual([]);
  });
});

describe('canActivate', () => {
  it('blocks activation without Aadhaar', () => {
    expect(canActivate({ workerType: 'home_help', aadhaarVerified: false, licenseVerified: false }).ok).toBe(false);
  });
  it('blocks driver-only activation without license', () => {
    expect(canActivate({ workerType: 'driver', aadhaarVerified: true, licenseVerified: false }).ok).toBe(false);
  });
  it('allows activation of a both-worker with only Aadhaar', () => {
    expect(canActivate({ workerType: 'both', aadhaarVerified: true, licenseVerified: false }).ok).toBe(true);
  });
});
