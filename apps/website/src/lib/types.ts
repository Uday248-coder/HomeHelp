export interface ApiError {
  error: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapLocation extends LatLng {
  accuracy?: number;
  heading?: number;
  timestamp?: number;
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
    mode: 'home_help' | 'driver' | 'driver_outstation';
    serviceType: string;
    status: string;
    scheduledAt?: string;
    customerAddress?: string;
    durationHours?: number;
    distanceKm?: number;
    baseAmount?: number;
    surgeMultiplier?: number;
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
  currentLat?: number | null;
  currentLng?: number | null;
}

export interface Booking {
  id: string;
  mode: 'home_help' | 'driver' | 'driver_outstation';
  serviceType: string;
  status: BookingStatus;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  durationHours?: number | null;
  distanceKm?: number | null;
  baseAmount?: number | null;
  surgeMultiplier?: number | null;
  hourlyRate?: number | null;
  customerAddress?: string | null;
  customerLat?: number | null;
  customerLng?: number | null;
  ratingByUser?: number | null;
  reviewText?: string | null;
  startOtp?: string | null;
  endOtp?: string | null;
  createdAt: string;
  worker?: WorkerInfo | null;
  payment?: { id: string; amount: number; status: string } | null;
}

