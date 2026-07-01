import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import { colors } from '../constants/theme';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

class LocationService {
  private socket: Socket | null = null;
  private locationSubscription: any = null;

  async init(userId: string, token: string) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
    });

    this.socket.emit('join', { userId, role: 'worker' });
  }

  async startTracking(bookingId: string, userId: string) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        this.socket?.emit('update_booking_location', {
          bookingId,
          location: { lat: latitude, lng: longitude },
        });
      }
    );
  }

  stopTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const locationService = new LocationService();
