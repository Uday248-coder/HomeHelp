'use client';
import { useEffect, useRef } from 'react';
import type { Map as MaplibreMap } from 'maplibre-gl';
import { MARKER_COLORS } from '@/lib/map-config';
import * as maplibregl from 'maplibre-gl';

interface RouteOverlayProps {
  map: MaplibreMap | null;
  route: GeoJSON.LineString | null;
  distance?: number | null;
  duration?: number | null;
}

export function RouteOverlay({ map, route }: RouteOverlayProps) {
  const sourceIdRef = useRef(`route-source-${Math.random().toString(36).substr(2, 9)}`);
  const layerIdRef = useRef(`route-layer-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!map || !route) return;

    const sourceId = sourceIdRef.current;
    const layerId = layerIdRef.current;

    // Check if map is loaded before adding source
    const updateRoute = () => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route,
          }
        });
      } else {
        const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: route,
        });
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MARKER_COLORS.worker,
            'line-width': 4,
            'line-dasharray': [2, 1],
            'line-opacity': 0.8,
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateRoute();
    } else {
      map.once('load', updateRoute);
    }

    return () => {
      // Clean up layer and source on route unmount / change is handled in a separate useEffect for full unmount
    };
  }, [map, route]);

  useEffect(() => {
    return () => {
      if (map) {
        try {
          if (map.getStyle()) {
            if (map.getLayer(layerIdRef.current)) {
              map.removeLayer(layerIdRef.current);
            }
            if (map.getSource(sourceIdRef.current)) {
              map.removeSource(sourceIdRef.current);
            }
          }
        } catch (e) {
          // Map might be already destroyed
        }
      }
    };
  }, [map]);

  return null;
}
