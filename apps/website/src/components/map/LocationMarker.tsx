'use client';
import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { LatLng } from '@/lib/types';

interface LocationMarkerProps {
  map: maplibregl.Map | null;
  position: LatLng | null;
  color?: string;
  label?: string;
  pulse?: boolean;  // pulsing animation for live user
}

export function LocationMarker({ map, position, color = '#10b981', label, pulse }: LocationMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const prevPositionRef = useRef<LatLng | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !position) return;

    if (!elementRef.current) {
      const el = document.createElement('div');
      el.className = `w-4 h-4 rounded-full border-2 border-white shadow-md relative ${pulse ? 'animate-pulse' : ''}`;
      el.style.backgroundColor = color;
      
      if (pulse) {
        const ring = document.createElement('div');
        ring.className = 'absolute -inset-2 rounded-full border-2 animate-ping opacity-75 pointer-events-none';
        ring.style.borderColor = color;
        el.appendChild(ring);
      }

      if (label) {
        const tooltip = document.createElement('div');
        tooltip.className = 'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-surface text-foreground text-xs rounded shadow-sm whitespace-nowrap font-medium';
        tooltip.innerText = label;
        el.appendChild(tooltip);
      }
      
      elementRef.current = el;

      markerRef.current = new maplibregl.Marker({ 
        element: el,
        subpixelPositioning: true 
      })
        .setLngLat([position.lng, position.lat])
        .addTo(map);
        
      prevPositionRef.current = position;
    } else {
      // Interpolate from prev to current
      const prev = prevPositionRef.current || position;
      const startLng = prev.lng;
      const startLat = prev.lat;
      const endLng = position.lng;
      const endLat = position.lat;
      
      const startTime = performance.now();
      const duration = 1000;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentLng = startLng + (endLng - startLng) * progress;
        const currentLat = startLat + (endLat - startLat) * progress;
        
        if (markerRef.current) {
          markerRef.current.setLngLat([currentLng, currentLat]);
        }

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          prevPositionRef.current = position;
        }
      };
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      // Don't unmount marker here as it will be destroyed on component unmount
      // We only clean up when component actually unmounts or map changes
    };
  }, [map, position, color, label, pulse]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, []);

  return null;
}
