'use client';

import { useState, useEffect } from 'react';
import { LatLng } from '@/lib/types';

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationState {
  position: LatLng | null;
  accuracy: number | null;
  heading: number | null;
  error: GeolocationError | null;
  loading: boolean;
  supported: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | null;
}

export function useGeolocation(options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 5000,
}) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    accuracy: null,
    heading: null,
    error: null,
    loading: true,
    supported: true,
    permissionState: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('geolocation' in navigator)) {
      setState(s => ({ ...s, supported: false, loading: false, error: { code: 0, message: 'Geolocation not supported' } }));
      return;
    }

    let isMounted = true;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((status) => {
        if (isMounted) {
          setState(s => ({ ...s, permissionState: status.state as any }));
        }
        status.onchange = () => {
          if (isMounted) {
            setState(s => ({ ...s, permissionState: status.state as any }));
          }
        };
      }).catch(() => {
        // Ignored
      });
    }

    const successHandler = (position: GeolocationPosition) => {
      if (!isMounted) return;
      setState(s => ({
        ...s,
        loading: false,
        error: null,
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
      }));
    };

    const errorHandler = (error: GeolocationPositionError) => {
      if (!isMounted) return;
      setState(s => ({
        ...s,
        loading: false,
        error: {
          code: error.code,
          message: error.message,
        },
      }));
    };

    const watchId = navigator.geolocation.watchPosition(
      successHandler,
      errorHandler,
      options
    );

    return () => {
      isMounted = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  return state;
}
