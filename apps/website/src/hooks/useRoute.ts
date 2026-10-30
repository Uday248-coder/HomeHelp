'use client';

import { useState, useEffect, useRef } from 'react';
import { LatLng } from '@/lib/types';
import { OSRM_URL } from '@/lib/map-config';

export function useRoute(from: LatLng | null, to: LatLng | null) {
  const [route, setRoute] = useState<GeoJSON.LineString | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lastCoordsRef = useRef<{ from: LatLng; to: LatLng } | null>(null);

  useEffect(() => {
    if (!from || !to) {
      setRoute(null);
      setDistance(null);
      setDuration(null);
      setLoading(false);
      setError(null);
      return;
    }

    if (lastCoordsRef.current) {
      const { from: lastFrom, to: lastTo } = lastCoordsRef.current;
      const dFromLat = Math.abs(lastFrom.lat - from.lat);
      const dFromLng = Math.abs(lastFrom.lng - from.lng);
      const dToLat = Math.abs(lastTo.lat - to.lat);
      const dToLng = Math.abs(lastTo.lng - to.lng);
      
      const threshold = 0.0001;
      
      if (dFromLat < threshold && dFromLng < threshold && dToLat < threshold && dToLng < threshold) {
        return;
      }
    }

    const abortController = new AbortController();
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const url = `${OSRM_URL || 'https://router.project-osrm.org'}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url, { signal: abortController.signal });
        
        if (!response.ok) {
          throw new Error(`OSRM Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error('No route found');
        }

        const firstRoute = data.routes[0];
        setRoute(firstRoute.geometry as GeoJSON.LineString);
        setDistance(firstRoute.distance);
        setDuration(firstRoute.duration);
        setError(null);
        
        lastCoordsRef.current = { from, to };
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unknown error');
          setRoute(null);
          setDistance(null);
          setDuration(null);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);

  return { route, distance, duration, loading, error };
}
