export interface DashboardStats {
  activeBookings: number;
  availableWorkers: number;
  todayRevenue: number;
  totalUsers: number;
  totalWorkers: number;
  totalBookings: number;
  recentBookings: Booking[];
}

export interface Booking {
  id: string;
  userId: string;
  workerId?: string;
  mode: 'home_help' | 'driver';
  serviceType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationHours?: number;
  hourlyRate?: number;
  totalAmount?: number;
  customerAddress?: string;
  ratingByUser?: number;
  reviewText?: string;
  createdAt: string;
  user?: { id: string; name?: string; phoneNumber: string };
  worker?: { id: string; name: string; phoneNumber: string; workerType: string };
  payment?: { id: string; amount: number; status: string };
}

export interface Worker {
  id: string;
  workerType: 'home_help' | 'driver' | 'both';
  name: string;
  phoneNumber: string;
  photoUrl?: string;
  aadhaarVerified: boolean;
  licenseVerified: boolean;
  averageRating: number;
  totalJobs: number;
  isAvailable: boolean;
  isActive: boolean;
}
