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
  mode: 'home_help' | 'driver';
  serviceType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  customerAddress?: string;
  customerLat?: number;
  customerLng?: number;
  durationHours?: number;
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
  weekStart: string;
  weekEnd: string;
  paidAt?: string;
  createdAt: string;
}
