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
  phoneNumber: string | null;
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

export interface Customer {
  id: string;
  phoneNumber: string;
  name?: string | null;
  email?: string | null;
  isAdmin: boolean;
  bookingCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface AnalyticsData {
  dailyRevenue: { date: string; revenue: number }[];
  bookingFunnel: { status: string; count: number }[];
  totalRevenueThisPeriod: number;
  topWorkers: {
    id: string;
    name: string;
    workerType: string;
    totalJobs: number;
    completedJobs: number;
    averageRating: number;
    isAvailable: boolean;
  }[];
  modeBreakdown: { homeHelp: number; driver: number };
  workerStats: { total: number; available: number };
}

export interface CustomerBooking {
  id: string;
  mode: string;
  serviceType: string;
  status: string;
  totalAmount?: number | null;
  createdAt: string;
  completedAt?: string | null;
  worker?: { name: string } | null;
  payment?: { amount: number; status: string } | null;
}
