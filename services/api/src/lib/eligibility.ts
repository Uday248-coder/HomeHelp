import { WorkerType } from '@prisma/client';

export type BookingMode = 'home_help' | 'driver';

export interface WorkerEligibilityFields {
  workerType: WorkerType;
  aadhaarVerified: boolean;
  licenseVerified: boolean;
  isActive: boolean;
  isAvailable?: boolean;
}

// Does the worker's type cover this booking mode?
export function modeMatchesType(mode: BookingMode, workerType: WorkerType): boolean {
  if (mode === 'driver') return workerType === 'driver' || workerType === 'both';
  return workerType === 'home_help' || workerType === 'both';
}

// Verification policy: Aadhaar required for all work; License additionally for driving.
export function hasRequiredVerification(
  mode: BookingMode,
  w: Pick<WorkerEligibilityFields, 'aadhaarVerified' | 'licenseVerified'>,
): boolean {
  if (!w.aadhaarVerified) return false;
  if (mode === 'driver' && !w.licenseVerified) return false;
  return true;
}

// Full eligibility for a specific booking mode.
export function isWorkerEligible(
  mode: BookingMode,
  w: WorkerEligibilityFields,
  opts?: { requireAvailable?: boolean },
): boolean {
  if (!w.isActive) return false;
  if (opts?.requireAvailable && w.isAvailable === false) return false;
  if (!modeMatchesType(mode, w.workerType)) return false;
  return hasRequiredVerification(mode, w);
}

// The booking modes this worker is currently eligible to take.
export function eligibleModes(w: WorkerEligibilityFields): BookingMode[] {
  const modes: BookingMode[] = [];
  if (isWorkerEligible('home_help', w)) modes.push('home_help');
  if (isWorkerEligible('driver', w)) modes.push('driver');
  return modes;
}

// Whether a worker may be activated at all (must be able to serve >= 1 mode).
export function canActivate(
  w: Pick<WorkerEligibilityFields, 'workerType' | 'aadhaarVerified' | 'licenseVerified'>,
): { ok: boolean; reason?: string } {
  if (!w.aadhaarVerified) {
    return { ok: false, reason: 'Aadhaar verification required before activation' };
  }
  if ((w.workerType === 'driver' || w.workerType === 'both') && !w.licenseVerified) {
    return { ok: false, reason: 'License verification required to activate a driver' };
  }
  return { ok: true };
}
