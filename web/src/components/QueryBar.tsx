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
    label: 'NDVI — Vegetation (Delhi)',
    index: 'NDVI',
    query: 'Analyze NDVI vegetation in Delhi',
    badge: 'Vegetation',
    description: 'Calculates Normalized Difference Vegetation Index from Sentinel-2 B08 (NIR) and B04 (Red)'
  },
  {
    id: 'ndwi-mumbai',
    label: 'NDWI — Water / Flood (Mumbai)',
    index: 'NDWI',
    query: 'Detect flood NDWI water extent around Mumbai',
    badge: 'Water / Flood',
    description: 'Calculates Normalized Difference Water Index from Sentinel-2 B03 (Green) and B08 (NIR)'
  },
  {
    id: 'ndbi-bengaluru',
    label: 'NDBI — Built-up (Bengaluru)',
    index: 'NDBI',
    query: 'Detect built-up areas in Bengaluru',
    badge: 'Urban Built-up',
    description: 'Calculates Normalized Difference Built-up Index from Sentinel-2 B11 (SWIR) and B08 (NIR)'
  },
  {
    id: 'punjab-agri',
    label: 'NDVI — Crops (Punjab)',
    index: 'NDVI',
    query: 'Analyze agricultural crop health in Punjab',
    badge: 'Agriculture',
    description: 'Monitors agricultural canopy vigour across major breadbasket farmland'
  },
  {
    id: 'sundarbans-wetland',
    label: 'NDWI — Wetlands (Sundarbans)',
    index: 'NDWI',
    query: 'Analyze water bodies and mangrove delta in Sundarbans',
    badge: 'Wetlands',
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
    <div className="p-5 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl space-y-4">
      {/* Title & Subtitle */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Ask SatQuery about Earth</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans pt-0.5">
            Analyze satellite observations using natural language.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#070b14] border border-[#1e293b] rounded-lg text-[10px] font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>GeoPlan Planner Engine</span>
        </div>
      </div>

      {/* Query Command Input Box */}
      <div className="relative shadow-2xl">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <Search className="w-4 h-4 text-cyan-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onExecute()}
          placeholder="e.g. Analyze vegetation health in Delhi"
          className="w-full bg-[#070b14] border-2 border-[#1e293b] focus:border-cyan-500 rounded-xl pl-11 pr-36 py-3.5 text-sm text-slate-100 placeholder-slate-500 font-mono transition-all shadow-inner focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        />

        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-32 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
            title="Clear query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => onExecute()}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg font-mono transition-all shadow-lg shadow-cyan-950/60 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>ANALYZING...</span>
            </>
          ) : (
            <>
              <span>ANALYZE</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
      </div>

      {/* Quick Preset Buttons */}
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Play className="w-3 h-3 text-cyan-400" /> Quick Presets:
          </span>
          <span className="text-[10px] text-slate-400">Deterministic GeoPlan DAGs</span>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#0e2a38] border-cyan-500 text-cyan-200 font-bold shadow-md shadow-cyan-950/50'
                    : 'bg-[#070b14] hover:bg-[#131b2e] border-[#1e293b] hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  preset.index === 'NDVI'
                    ? 'bg-emerald-400'
                    : preset.index === 'NDWI'
                    ? 'bg-cyan-400'
                    : 'bg-amber-400'
                }`} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
