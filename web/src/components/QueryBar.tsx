import {
  Globe,
  RefreshCw,
  ArrowRight,
  Play,
  Sparkles,
  Search,
  X
} from 'lucide-react';
import { PresetQuery } from '../types';

export const PRESET_QUERIES: PresetQuery[] = [
  {
    id: 'ndvi-delhi',
    label: 'Vegetation Health (Delhi)',
    index: 'NDVI',
    query: 'Analyze NDVI vegetation in Delhi',
    badge: 'NDVI',
    description: 'Calculates Normalized Difference Vegetation Index from Sentinel-2 Near-Infrared (B08) and Red (B04) bands'
  },
  {
    id: 'ndwi-mumbai',
    label: 'Water & Flood Extent (Mumbai)',
    index: 'NDWI',
    query: 'Detect flood NDWI water extent around Mumbai',
    badge: 'NDWI',
    description: 'Calculates Normalized Difference Water Index from Sentinel-2 Green (B03) and Near-Infrared (B08) bands'
  },
  {
    id: 'ndbi-bengaluru',
    label: 'Urban Built-Up (Bengaluru)',
    index: 'NDBI',
    query: 'Detect built-up areas in Bengaluru',
    badge: 'NDBI',
    description: 'Calculates Normalized Difference Built-up Index from Sentinel-2 Shortwave Infrared (B11) and NIR (B08) bands'
  },
  {
    id: 'punjab-agri',
    label: 'Agricultural Crop Vigour (Punjab)',
    index: 'NDVI',
    query: 'Analyze agricultural crop health in Punjab',
    badge: 'NDVI',
    description: 'Monitors agricultural canopy vigour across major breadbasket farmlands'
  },
  {
    id: 'sundarbans-wetland',
    label: 'Mangrove Wetlands (Sundarbans)',
    index: 'NDWI',
    query: 'Analyze water bodies and mangrove delta in Sundarbans',
    badge: 'NDWI',
    description: 'Delineates tidal mangrove water channels and delta surface moisture'
  }
];

interface QueryBarProps {
  query: string;
  setQuery: (q: string) => void;
  onExecute: (customQuery?: string) => void;
  loading: boolean;
}

export default function QueryBar({
  query,
  setQuery,
  onExecute,
  loading
}: QueryBarProps) {
  return (
    <div className="p-4 sm:p-5 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl space-y-3.5">
      {/* Title & Guidance Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Ask SatQuery About Earth</span>
          </h2>
          <p className="text-xs text-slate-400 pt-0.5">
            Type any natural-language question or select a verified preset below to retrieve real Sentinel-2 satellite analysis.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-400 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>GeoPlan Planner Engine</span>
        </div>
      </div>

      {/* Query Command Input Box */}
      <div className="relative shadow-inner">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <Search className="w-4 h-4 text-cyan-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onExecute()}
          placeholder="e.g., Analyze vegetation health in Delhi, or detect water extent in Mumbai..."
          className="w-full bg-[#070b14] border-2 border-slate-800 focus:border-cyan-500 rounded-xl pl-11 pr-36 py-3 text-sm text-slate-100 placeholder-slate-500 transition-all font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-32 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
            title="Clear input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onExecute()}
          disabled={loading || !query.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 sm:px-5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg font-mono transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
            </>
          )}
        </button>
      </div>

      {/* Quick Verified Presets */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Suggested Demo Queries:</span>
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            100% Deterministic Real Data
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESET_QUERIES.map((preset) => {
            const isSelected = query.trim() === preset.query.trim();
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setQuery(preset.query);
                  onExecute(preset.query);
                }}
                title={preset.description}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 border cursor-pointer font-sans ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-semibold shadow-md shadow-cyan-950/30'
                    : 'bg-[#070b14] hover:bg-slate-800/80 border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300'
                }`}
              >
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  preset.index === 'NDVI'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : preset.index === 'NDWI'
                    ? 'bg-sky-950 text-sky-400 border border-sky-800/60'
                    : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                }`}>
                  {preset.badge}
                </span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
