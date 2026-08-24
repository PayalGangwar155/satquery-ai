import {
  MapPin,
  Bookmark,
  ArrowRight,
  Plus
} from 'lucide-react';
import { SavedArea } from '../types';

export const DEFAULT_SAVED_AREAS: SavedArea[] = [
  {
    id: 'delhi-ncr',
    name: 'Delhi NCR Metropolitan',
    state: 'National Capital Region',
    description: 'Urban vegetation canopy, Ridge forest cover, and agricultural periphery',
    bbox: [76.83, 28.40, 77.34, 28.88],
    centroid: [77.1025, 28.7041],
    defaultIndex: 'NDVI',
    defaultQuery: 'Analyze NDVI vegetation in Delhi',
    badge: 'Capital Megacity',
    type: 'Urban & Green Cover'
  },
  {
    id: 'mumbai-coastal',
    name: 'Mumbai Metropolitan & Coastline',
    state: 'Maharashtra',
    description: 'Tidal creeks, Sanjay Gandhi National Park, and coastal urban built-up',
    bbox: [72.77, 18.89, 73.01, 19.27],
    centroid: [72.8777, 19.0760],
    defaultIndex: 'NDWI',
    defaultQuery: 'Detect flood NDWI water extent around Mumbai',
    badge: 'Coastal Estuary',
    type: 'Water & Built-up'
  },
  {
    id: 'bengaluru-tech',
    name: 'Bengaluru Tech Corridor',
    state: 'Karnataka',
    description: 'Urban sprawl dynamics, lake systems (Bellandur/Varthur), and built infrastructure',
    bbox: [77.46, 12.83, 77.74, 13.14],
    centroid: [77.5946, 12.9716],
    defaultIndex: 'NDBI',
    defaultQuery: 'Detect built-up areas in Bengaluru',
    badge: 'Silicon Plateau',
    type: 'Impervious Surface'
  },
  {
    id: 'sundarbans-delta',
    name: 'Sundarbans Mangrove Biosphere',
    state: 'West Bengal',
    description: 'Tidal estuarine waterways, mangrove forest density, and wetland conservation',
    bbox: [88.50, 21.50, 89.20, 22.10],
    centroid: [88.85, 21.80],
    defaultIndex: 'NDWI',
    defaultQuery: 'Analyze water bodies and mangrove delta in Sundarbans',
    badge: 'UNESCO Heritage',
    type: 'Wetland Ecology'
  },
  {
    id: 'punjab-farmlands',
    name: 'Punjab Agricultural Breadbasket',
    state: 'Punjab (Ludhiana / Jalandhar)',
    description: 'Intensive wheat-paddy agricultural rotation, crop vigour, and canal irrigation',
    bbox: [75.60, 30.70, 76.20, 31.20],
    centroid: [75.85, 30.90],
    defaultIndex: 'NDVI',
    defaultQuery: 'Analyze agricultural crop health in Punjab',
    badge: 'Agri Heartlands',
    type: 'Crop Vigour'
  },
  {
    id: 'thar-solar',
    name: 'Bhadla Solar Park & Thar Basin',
    state: 'Rajasthan',
    description: 'World-scale photovoltaic solar park installations in arid desert terrain',
    bbox: [71.80, 27.40, 72.20, 27.70],
    centroid: [72.00, 27.55],
    defaultIndex: 'NDBI',
    defaultQuery: 'Detect built-up and solar infrastructure in Rajasthan',
    badge: 'Renewable Hub',
    type: 'Arid & Solar'
  }
];

interface SavedAreasProps {
  savedAreas: SavedArea[];
  onSelectArea: (area: SavedArea) => void;
  activeAoiName?: string;
  onSaveCurrentAoi?: () => void;
}

export default function SavedAreas({
  savedAreas,
  onSelectArea,
  activeAoiName,
  onSaveCurrentAoi
}: SavedAreasProps) {
  return (
    <div className="p-6 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e293b] pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            <span>Saved Observation Areas</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans pt-0.5">
            Pre-configured geographic zones of strategic environmental and urban interest.
          </p>
        </div>

        {activeAoiName && onSaveCurrentAoi && (
          <button
            onClick={onSaveCurrentAoi}
            className="px-3.5 py-1.5 bg-[#0e2a38] hover:bg-[#13384a] text-cyan-300 border border-cyan-500/50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Save Current AOI</span>
          </button>
        )}
      </div>

      {/* Grid of Saved Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedAreas.map((area) => {
          const isNDVI = area.defaultIndex === 'NDVI';
          const isNDWI = area.defaultIndex === 'NDWI';

          return (
            <div
              key={area.id}
              className="p-4 bg-[#070b14] border border-[#1e293b] hover:border-cyan-500/50 rounded-xl space-y-3 transition-all group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {area.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{area.state}</span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 bg-[#0f172a] border border-[#1e293b] rounded text-cyan-400 shrink-0">
                    {area.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                  {area.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    isNDVI
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                      : isNDWI
                      ? 'bg-sky-950/60 text-sky-300 border border-sky-800/80'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                  }`}>
                    {area.defaultIndex}
                  </span>
                  <span className="text-[10px] text-slate-400">{area.type}</span>
                </div>

                <button
                  onClick={() => onSelectArea(area)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1 cursor-pointer shadow-md shadow-cyan-950/50"
                >
                  <span>Analyze</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
