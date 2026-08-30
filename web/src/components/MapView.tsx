import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  Layers,
  AlertCircle,
  Eye,
  RotateCcw,
  Crosshair,
  Sliders
} from 'lucide-react';
import MapLegend from './MapLegend';

interface MapViewProps {
  bbox?: number[];
  geojson?: any;
  aoiName?: string;
  indexName?: string;
  meanValue?: number;
  satelliteMetadata?: {
    collection?: string;
    resolution?: string;
    sceneId?: string;
    acqDate?: string;
  };
}

const BASEMAP_STYLES = {
  dark: {
    name: 'Dark Matter',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  },
  voyager: {
    name: 'Terrain',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  },
  positron: {
    name: 'Light',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  }
};

export default function MapView({
  bbox,
  geojson,
  aoiName,
  indexName = 'NDVI',
  meanValue,
  satelliteMetadata
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lon: string; lat: string } | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(4.5);
  const [activeStyleKey, setActiveStyleKey] = useState<keyof typeof BASEMAP_STYLES>('dark');
  const [showLegend, setShowLegend] = useState(true);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.4);
  const [activeLayerFilter, setActiveLayerFilter] = useState<'ALL' | 'OPTICAL' | 'AOI' | 'CHANGE'>('ALL');

  // Initialize MapLibre GL map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: BASEMAP_STYLES[activeStyleKey].url,
        center: [78.9629, 20.5937], // Centered over India
        zoom: 4.5,
        preserveDrawingBuffer: true,
        attributionControl: false
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
      map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

      map.on('load', () => {
        setMapLoaded(true);
        map.resize();
      });

      map.on('mousemove', (e) => {
        setCursorCoords({
          lon: e.lngLat.lng.toFixed(4),
          lat: e.lngLat.lat.toFixed(4)
        });
      });

      map.on('zoom', () => {
        setCurrentZoom(parseFloat(map.getZoom().toFixed(1)));
      });

      map.on('error', (e) => {
        console.warn('MapLibre GL tile notification:', e);
      });

      mapRef.current = map;

      const handleResize = () => {
        if (mapRef.current) mapRef.current.resize();
      };

      window.addEventListener('resize', handleResize);

      const resizeTimer = setTimeout(() => {
        if (mapRef.current) mapRef.current.resize();
      }, 300);

      return () => {
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        if (markerRef.current) markerRef.current.remove();
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    } catch (err: any) {
      console.error('Failed to initialize MapLibre GL:', err);
      setMapError(err.message || 'WebGL context initialization failed');
    }
  }, []);

  // Update Style when toggled
  const handleStyleChange = (key: keyof typeof BASEMAP_STYLES) => {
    if (!mapRef.current || key === activeStyleKey) return;
    setActiveStyleKey(key);
    mapRef.current.setStyle(BASEMAP_STYLES[key].url);
  };

  // Helper to re-add vector layers on style re-load or AOI change
  const applyGeoJsonLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;

    try {
      if (map.getSource('aoi-source')) {
        (map.getSource('aoi-source') as maplibregl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource('aoi-source', {
          type: 'geojson',
          data: geojson
        });

        // Theme colors based on index
        const idx = indexName.toUpperCase();
        let fillColor = '#06b6d4';
        let strokeColor = '#38bdf8';

        if (idx === 'NDWI') {
          fillColor = '#0284c7';
          strokeColor = '#60a5fa';
        } else if (idx === 'NDBI') {
          fillColor = '#d97706';
          strokeColor = '#f59e0b';
        } else if (idx === 'NDVI') {
          fillColor = '#10b981';
          strokeColor = '#34d399';
        }

        // Semi-transparent polygon fill
        map.addLayer({
          id: 'aoi-fill',
          type: 'fill',
          source: 'aoi-source',
          paint: {
            'fill-color': fillColor,
            'fill-opacity': layerOpacity
          }
        });

        // Glowing boundary line with dash pattern
        map.addLayer({
          id: 'aoi-stroke',
          type: 'line',
          source: 'aoi-source',
          paint: {
            'line-color': strokeColor,
            'line-width': 2.5,
            'line-dasharray': [2, 1]
          }
        });
      }
    } catch (err) {
      console.error('Error applying GeoJSON vector layer:', err);
    }
  }, [geojson, indexName, layerOpacity]);

  // Update fill opacity dynamically when slider moves
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    try {
      if (map.getLayer('aoi-fill')) {
        map.setPaintProperty('aoi-fill', 'fill-opacity', layerOpacity);
      }
    } catch (e) {
      console.warn('Could not update layer opacity', e);
    }
  }, [layerOpacity, mapLoaded]);

  // Update bounds, centroid marker, and vector layers when AOI changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (bbox && bbox.length === 4) {
      try {
        map.fitBounds(
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]]
          ],
          { padding: 80, duration: 1500, maxZoom: 13 }
        );

        const centerLon = (bbox[0] + bbox[2]) / 2.0;
        const centerLat = (bbox[1] + bbox[3]) / 2.0;

        if (markerRef.current) {
          markerRef.current.setLngLat([centerLon, centerLat]);
        } else {
          const el = document.createElement('div');
          el.className = 'relative flex items-center justify-center';
          el.innerHTML = `
            <div class="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></div>
            <div class="w-5 h-5 rounded-full bg-cyan-500/90 border-2 border-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <div class="w-2 h-2 rounded-full bg-slate-950"></div>
            </div>
          `;
          markerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat([centerLon, centerLat])
            .addTo(map);
        }
      } catch (err) {
        console.error('Error updating map bounds or marker:', err);
      }
    }

    applyGeoJsonLayers();
  }, [bbox, geojson, mapLoaded, applyGeoJsonLayers]);

  // Re-apply layers if style reloads
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onStyleData = () => {
      applyGeoJsonLayers();
    };
    map.on('styledata', onStyleData);
    return () => {
      map.off('styledata', onStyleData);
    };
  }, [applyGeoJsonLayers]);

  // Reset view to India default or active AOI
  const handleResetView = () => {
    if (!mapRef.current) return;
    if (bbox && bbox.length === 4) {
      mapRef.current.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]]
        ],
        { padding: 80, duration: 1200 }
      );
    } else {
      mapRef.current.flyTo({ center: [78.9629, 20.5937], zoom: 4.5, duration: 1200 });
    }
  };

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] bg-[#070b14] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 group">
      {/* Top Left Spatial Telemetry Badge with Explicit Gap */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none bg-[#0a0f1d]/95 border border-slate-800 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs text-slate-300 shadow-2xl flex items-center gap-3">
        <div className="p-1.5 bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 rounded-lg shrink-0">
          <Eye className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
            <span>Spatial Observation Map</span>
            <span className="text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/40 font-mono font-semibold">
              {satelliteMetadata?.collection || 'Sentinel-2 L2A'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-0.5">
            Resolution: {satelliteMetadata?.resolution || '10m'} &bull; Zoom: {currentZoom}x
          </div>
        </div>
      </div>

      {/* Top Right Floating Controls Bar */}
      <div className="absolute top-3 right-14 z-20 flex items-center gap-2">
        {/* Layer Filter Chips */}
        <div className="hidden md:flex bg-[#0a0f1d]/95 border border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-xl items-center gap-1 text-[11px] font-mono">
          {(['ALL', 'OPTICAL', 'AOI', 'CHANGE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveLayerFilter(filter)}
              className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                activeLayerFilter === filter
                  ? 'bg-cyan-900/60 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Basemap Style Selector */}
        <div className="bg-[#0a0f1d]/95 border border-slate-800 backdrop-blur-md p-1 rounded-xl shadow-xl flex items-center gap-1 text-xs">
          {(['dark', 'voyager', 'positron'] as Array<keyof typeof BASEMAP_STYLES>).map((key) => (
            <button
              key={key}
              onClick={() => handleStyleChange(key)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
                activeStyleKey === key
                  ? 'bg-cyan-900/70 text-cyan-300 font-bold border border-cyan-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {BASEMAP_STYLES[key].name}
            </button>
          ))}
        </div>

        {/* Reset Camera Button */}
        <button
          onClick={handleResetView}
          title="Reset Camera View to AOI"
          className="p-2 bg-[#0a0f1d]/95 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 rounded-xl shadow-xl transition-colors text-xs flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Legend Button */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          title="Toggle Spectral Scale Legend"
          className={`p-2 border rounded-xl shadow-xl transition-colors text-xs flex items-center gap-1 cursor-pointer ${
            showLegend
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
              : 'bg-[#0a0f1d]/95 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Container Ref */}
      <div ref={mapContainer} className="w-full h-full flex-1" style={{ width: '100%', height: '100%' }} />

      {/* Bottom Right Floating Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-4 right-4 z-20 w-64 max-w-[calc(100%-2rem)] space-y-2">
          {/* Opacity Control Slider */}
          <div className="p-2.5 bg-[#0a0f1d]/95 border border-slate-800 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Sliders className="w-3 h-3 text-cyan-400" /> Layer Opacity
              </span>
              <span className="text-cyan-300 font-bold">{Math.round(layerOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.9"
              step="0.05"
              value={layerOpacity}
              onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <MapLegend indexName={indexName} meanValue={meanValue} />
        </div>
      )}

      {/* Error state alert if WebGL fails */}
      {mapError && (
        <div className="absolute inset-0 bg-[#070b14]/95 flex flex-col items-center justify-center p-6 text-center z-30 font-sans">
          <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-100">Map Rendering Issue</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{mapError}</p>
        </div>
      )}

      {/* Bottom Floating Status Bar with explicit padding & gaps */}
      <div className="absolute bottom-3.5 left-3.5 z-20 pointer-events-none flex items-center gap-2 flex-wrap">
        {aoiName && (
          <div className="bg-cyan-950/90 border border-cyan-500/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-cyan-200 flex items-center gap-2 shadow-xl font-semibold">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
            <span className="truncate max-w-xs">AOI: {aoiName}</span>
          </div>
        )}

        {cursorCoords && (
          <div className="hidden sm:flex bg-[#0a0f1d]/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-400 items-center gap-2 shadow-xl">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>Lat: {cursorCoords.lat}&deg; &bull; Lon: {cursorCoords.lon}&deg;</span>
          </div>
        )}
      </div>
    </div>
  );
}
