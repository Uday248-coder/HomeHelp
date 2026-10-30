'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAPTILER_STYLE_URL, DEFAULT_CENTER, DEFAULT_ZOOM, MARKER_COLORS } from '@/lib/map-config';
import type { LatLng } from '@/lib/types';
import { LocationMarker } from './LocationMarker';
import { RouteOverlay } from './RouteOverlay';

interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  userLocation?: LatLng | null;
  otherLocation?: LatLng | null;
  route?: GeoJSON.LineString | null;
  routeDistance?: number | null;
  routeDuration?: number | null;
  showRecenterButton?: boolean;
  className?: string;
  userLabel?: string;
  otherLabel?: string;
}

export default function LiveMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  userLocation,
  otherLocation,
  route,
  routeDistance,
  routeDuration,
  showRecenterButton = false,
  className = 'h-[300px]',
  userLabel = 'You',
  otherLabel = 'Worker'
}: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!MAPTILER_STYLE_URL || map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAPTILER_STYLE_URL,
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom]);

  const handleRecenter = () => {
    if (map.current && userLocation) {
      map.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 15 });
    }
  };

  if (!MAPTILER_STYLE_URL) {
    return (
      <div className={`w-full rounded-2xl flex items-center justify-center bg-surface border border-border text-foreground ${className}`}>
        <p className="text-sm">Map unavailable — NEXT_PUBLIC_MAPTILER_API_KEY not set</p>
      </div>
    );
  }

  const formatDistance = (meters: number) => (meters / 1000).toFixed(1) + ' km';
  const formatDuration = (seconds: number) => Math.ceil(seconds / 60) + ' min';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border bg-surface ${className}`}>
      {!mapLoaded && (
        <div className="absolute inset-0 bg-surface/50 animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0" />
      
      {map.current && (
        <>
          <LocationMarker 
            map={map.current} 
            position={userLocation || null} 
            color={MARKER_COLORS.user} 
            label={userLabel} 
            pulse={true} 
          />
          <LocationMarker 
            map={map.current} 
            position={otherLocation || null} 
            color={MARKER_COLORS.worker} 
            label={otherLabel} 
          />
          <RouteOverlay 
            map={map.current} 
            route={route || null} 
          />
        </>
      )}

      {routeDistance != null && routeDuration != null && (
        <div className="absolute top-4 right-14 z-10 bg-surface text-foreground px-3 py-2 rounded-lg shadow-md border border-border text-sm font-medium">
          <div className="flex gap-2 items-center">
            <span className="text-emerald-500">{formatDuration(routeDuration)}</span>
            <span className="text-foreground/50 text-xs px-1">•</span>
            <span className="text-foreground/80">{formatDistance(routeDistance)}</span>
          </div>
        </div>
      )}

      {showRecenterButton && userLocation && (
        <button 
          onClick={handleRecenter}
          className="absolute bottom-4 right-4 z-10 p-2 bg-surface hover:bg-surface/90 text-foreground rounded-full shadow-md border border-border transition-colors"
          aria-label="Recenter map"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
            <circle cx="12" cy="12" r="10"/>
            <line x1="22" y1="12" x2="18" y2="12"/>
            <line x1="6" y1="12" x2="2" y2="12"/>
            <line x1="12" y1="6" x2="12" y2="2"/>
            <line x1="12" y1="22" x2="12" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
