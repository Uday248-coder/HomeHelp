import { prisma } from '../../lib/prisma';
import { RATE_TABLE, OUTSTATION_MIN_HOURS, OUTSTATION_PER_KM_RATE } from '../../lib/constants';

export interface PricingInput {
  mode: 'home_help' | 'driver' | 'driver_outstation';
  durationHours?: number | null;
  distanceKm?: number | null;
}

export interface PricingResult {
  baseAmount: number;
  surgeMultiplier: number;
  totalAmount: number;
  hourlyRate: number;
}

export class PricingEngine {
  /**
   * Calculates the current surge multiplier based on supply and demand.
   * If there are many pending bookings and few active workers, surge increases.
   */
  static async calculateSurgeMultiplier(mode: 'home_help' | 'driver' | 'driver_outstation'): Promise<number> {
    // Use IST (Asia/Kolkata) regardless of server timezone (Render runs UTC)
    const now = new Date();
    const istTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    const hour = parseInt(istTimeStr.split(' ')[1].split(':')[0], 10);

    // Peak hours in IST: 8 AM to 10 AM, and 6 PM to 8 PM
    const isPeakHour = (hour >= 8 && hour < 10) || (hour >= 18 && hour < 20);

    // If it's a peak hour, apply a 1.25x surge.
    return isPeakHour ? 1.25 : 1.0;
  }

  static async calculatePrice(input: PricingInput): Promise<PricingResult> {
    const { mode, durationHours, distanceKm } = input;
    const hourlyRate = RATE_TABLE[mode];
    
    if (!hourlyRate) {
      throw new Error(`Invalid mode for pricing: ${mode}`);
    }

    let baseAmount = 0;
    
    if (mode === 'driver_outstation') {
      const duration = durationHours || OUTSTATION_MIN_HOURS;
      if (duration < OUTSTATION_MIN_HOURS) {
        throw new Error(`Outstation mode requires a minimum of ${OUTSTATION_MIN_HOURS} hours`);
      }
      baseAmount = duration * hourlyRate;
      
      // Add distance-based fee if applicable
      if (distanceKm) {
        baseAmount += (distanceKm * OUTSTATION_PER_KM_RATE);
      }
    } else {
      const duration = durationHours || 1;
      baseAmount = duration * hourlyRate;
    }

    const surgeMultiplier = await this.calculateSurgeMultiplier(mode);
    const totalAmount = Math.round(baseAmount * surgeMultiplier);

    return {
      baseAmount: Math.round(baseAmount),
      surgeMultiplier,
      totalAmount,
      hourlyRate
    };
  }
}
