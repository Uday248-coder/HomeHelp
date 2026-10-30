import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PricingEngine } from './PricingEngine';

describe('PricingEngine', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculatePrice', () => {
    // Use off-peak time to get 1.0 multiplier for deterministic base amount tests
    beforeEach(() => {
      vi.useFakeTimers();
      // 12 PM IST = 6:30 AM UTC (non-peak)
      vi.setSystemTime(new Date('2026-10-02T06:30:00Z'));
    });

    it('home_help mode: 2 hours at 199/hr = baseAmount 398', async () => {
      const result = await PricingEngine.calculatePrice({ mode: 'home_help', durationHours: 2 });
      expect(result.baseAmount).toBe(398);
      expect(result.hourlyRate).toBe(199);
      expect(result.surgeMultiplier).toBe(1.0);
      expect(result.totalAmount).toBe(398);
    });

    it('driver mode: 3 hours at 149/hr = baseAmount 447', async () => {
      const result = await PricingEngine.calculatePrice({ mode: 'driver', durationHours: 3 });
      expect(result.baseAmount).toBe(447);
      expect(result.hourlyRate).toBe(149);
    });

    it('driver_outstation: 5 hours at 129/hr + 100km * 12/km = 1845 base', async () => {
      const result = await PricingEngine.calculatePrice({ mode: 'driver_outstation', durationHours: 5, distanceKm: 100 });
      expect(result.baseAmount).toBe(1845);
      expect(result.hourlyRate).toBe(129);
    });

    it('driver_outstation: should throw error for duration < 4 hours', async () => {
      await expect(
        PricingEngine.calculatePrice({ mode: 'driver_outstation', durationHours: 3 })
      ).rejects.toThrow(/minimum/i);
    });

    it('home_help with null duration defaults to 1 hour = 199', async () => {
      const result = await PricingEngine.calculatePrice({ mode: 'home_help' });
      expect(result.baseAmount).toBe(199);
    });

    it('driver_outstation with null duration defaults to 4 hours', async () => {
      const result = await PricingEngine.calculatePrice({ mode: 'driver_outstation' });
      expect(result.baseAmount).toBe(516); // 4 * 129 = 516
    });

    it('Invalid mode throws error', async () => {
      await expect(
        PricingEngine.calculatePrice({ mode: 'invalid' as any })
      ).rejects.toThrow(/Invalid mode/);
    });

    it('outstation with no distance: 4hrs * 129 = 516 base', async () => {
      const result = await PricingEngine.calculatePrice({ mode: 'driver_outstation', durationHours: 4, distanceKm: null });
      expect(result.baseAmount).toBe(516);
    });
  });

  describe('calculateSurgeMultiplier', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('Returns 1.25 during 9 AM IST (peak)', async () => {
      // 9 AM IST = 3:30 AM UTC
      vi.setSystemTime(new Date('2026-10-02T03:30:00Z'));
      const surge = await PricingEngine.calculateSurgeMultiplier('home_help');
      expect(surge).toBe(1.25);
    });

    it('Returns 1.0 during 12 PM IST (non-peak)', async () => {
      // 12 PM IST = 6:30 AM UTC
      vi.setSystemTime(new Date('2026-10-02T06:30:00Z'));
      const surge = await PricingEngine.calculateSurgeMultiplier('home_help');
      expect(surge).toBe(1.0);
    });

    it('Returns 1.25 during 7 PM IST (evening peak)', async () => {
      // 7 PM IST = 13:30 UTC
      vi.setSystemTime(new Date('2026-10-02T13:30:00Z'));
      const surge = await PricingEngine.calculateSurgeMultiplier('driver');
      expect(surge).toBe(1.25);
    });

    it('Returns 1.0 during 3 AM IST (off-peak)', async () => {
      // 3 AM IST = 21:30 UTC (previous day)
      vi.setSystemTime(new Date('2026-10-01T21:30:00Z'));
      const surge = await PricingEngine.calculateSurgeMultiplier('driver');
      expect(surge).toBe(1.0);
    });
  });
});
