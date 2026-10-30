'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { LatLng } from '@/lib/types';

import { API_URL } from '@/lib/config';

export function useWorkerLocation(bookingId: string | null, token: string | null) {
  const [workerLocation, setWorkerLocation] = useState<LatLng | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectDelayRef = useRef(1000);

  useEffect(() => {
    if (!bookingId || !token) {
      setWorkerLocation(null);
      setConnected(false);
      setError(null);
      return;
    }

    let isMounted = true;
    const url = API_URL;

    const connect = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      const socket = io(url, {
        auth: { token },
        reconnection: false, // We'll handle our own backoff
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
        if (!isMounted) return;
        setConnected(true);
        setError(null);
        reconnectDelayRef.current = 1000;
        socket.emit('join_booking', bookingId);
      });

      socket.on('worker_location', (payload: { location: { lat: number; lng: number }; ts: number }) => {
        if (!isMounted) return;
        setWorkerLocation({
          lat: payload.location.lat,
          lng: payload.location.lng,
        });
      });

      socket.on('disconnect', () => {
        if (!isMounted) return;
        setConnected(false);
        scheduleReconnect();
      });

      socket.on('connect_error', (err: Error) => {
        if (!isMounted) return;
        setError(err.message);
        setConnected(false);
        scheduleReconnect();
      });
    };

    const scheduleReconnect = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMounted) {
          reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, 30000);
          connect();
        }
      }, reconnectDelayRef.current);
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [bookingId, token]);

  return { workerLocation, connected, error };
}
