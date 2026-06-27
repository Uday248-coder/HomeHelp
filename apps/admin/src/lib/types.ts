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

export interface WeeklyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

export interface Payout {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  status: 'pending' | 'completed' | 'processed' | 'failed';
  weekStart: string;
  weekEnd: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  phoneNumber: string;
  name?: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}
