export interface ApiError {
  error: string;
}

export interface SendOtpResponse {
  message: string;
  otp?: string;
}

export interface VerifyOtpResponse {
  message: string;
  token: string;
  user: { id: string; phoneNumber: string; name?: string };
}

export interface WorkerResponse {
  worker: {
    id: string;
    workerType: string;
    name: string;
    phoneNumber: string;
  };
}

export interface WaitlistResponse {
  message: string;
}

export interface BookingResponse {
  booking: {
    id: string;
    mode: 'home_help' | 'driver';
    serviceType: string;
    status: string;
    scheduledAt?: string;
    customerAddress?: string;
    durationHours?: number;
    hourlyRate?: number;
    totalAmount?: number;
    createdAt: string;
    user?: { id: string; phoneNumber: string };
  };
}

export type BookingStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface WorkerInfo {
  id: string;
  name: string;
  workerType: string;
  averageRating: number;
  photoUrl?: string | null;
}

export interface Booking {
  id: string;
  mode: 'home_help' | 'driver';
  serviceType: string;
  status: BookingStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationHours?: number | null;
  hourlyRate?: number | null;
  customerAddress?: string | null;
  ratingByUser?: number | null;
  reviewText?: string | null;
  startOtp?: string | null;
  endOtp?: string | null;
  createdAt: string;
  worker?: WorkerInfo | null;
  payment?: { id: string; amount: number; status: string } | null;
}
