export interface Worker {
  id: string;
  workerType: 'home_help' | 'driver' | 'both';
  name: string;
  phoneNumber?: string;
  photoUrl?: string;
  aadhaarVerified: boolean;
  licenseVerified: boolean;
  averageRating: number;
  totalJobs: number;
  isAvailable: boolean;
  isActive: boolean;
}

export interface Booking {
  id: string;
  mode: 'home_help' | 'driver' | 'driver_outstation';
  serviceType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  customerAddress?: string;
  customerLat?: number;
  customerLng?: number;
  durationHours?: number;
  distanceKm?: number;
  baseAmount?: number;
  surgeMultiplier?: number;
  hourlyRate?: number;
  totalAmount?: number;
  user?: { id: string; name?: string; phoneNumber?: string };
  startOtp?: string;
  endOtp?: string;
  createdAt: string;
}

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  weekStartDate: string;
  weekEndDate: string;
  processedAt?: string;
  razorpayPayoutId?: string;
  cashfreeTransferId?: string;
  youpiPayoutId?: string;
  createdAt: string;
}
