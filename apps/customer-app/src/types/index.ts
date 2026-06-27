export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
}

export interface Booking {
  id: string;
  mode: 'home_help' | 'driver';
  serviceType: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  customerAddress?: string;
  durationHours?: number;
  hourlyRate?: number;
  totalAmount?: number;
  ratingByUser?: number;
  createdAt: string;
  worker?: { id: string; name: string; phoneNumber: string };
  payment?: { id: string; amount: number; status: string };
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  BookingDetail: { bookingId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Profile: undefined;
};
