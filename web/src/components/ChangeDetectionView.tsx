import { useState } from 'react';
import {
  GitCompare,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface ChangeDetectionViewProps {
  onRunChangeAnalysis: (query: string) => void;
}

export default function ChangeDetectionView({
  onRunChangeAnalysis
}: ChangeDetectionViewProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [selectedTarget, setSelectedTarget] = useState<'DELHI' | 'MUMBAI' | 'PUNJAB'>('DELHI');

  const targets = {
    DELHI: {
      name: 'Delhi NCR Agricultural Periphery',
      t1Date: '2025-03-15 (Post-Harvest Baseline)',
      t2Date: '2025-07-15 (Monsoon Canopy Growth)',
      t1Mean: 0.452,
      t2Mean: 0.684,
      changePercent: '+23.2%',
      trend: 'Vegetation Canopy Increase',
      t1Scene: 'S2B_MSIL2A_20250315T053639_T43REQ',
      t2Scene: 'S2A_MSIL2A_20250715T053641_T43REQ',
      areaChanged: '28.4 km²',
      query: 'What changed between 2025-03-15 and 2025-07-15 in Delhi'
    },
    MUMBAI: {
      name: 'Mumbai Coastal Mangrove & Estuary',
      t1Date: '2025-02-10 (Dry Pre-Monsoon)',
      t2Date: '2025-08-12 (Peak Inundation Extent)',
      t1Mean: -0.180,
      t2Mean: 0.245,
      changePercent: '+42.5%',
      trend: 'Surface Water Inundation Expansion',
      t1Scene: 'S2B_MSIL2A_20250210_T43KDA',
      t2Scene: 'S2A_MSIL2A_20250812_T43KDA',
      areaChanged: '41.2 km²',
      query: 'Detect flood NDWI change extent around Mumbai between February and August 2025'
    },
    PUNJAB: {
      name: 'Punjab Breadbasket Crop Rotation',
      t1Date: '2025-03-20 (Wheat Ripening Stage)',
      t2Date: '2025-06-25 (Paddy Transplanting Stage)',
      t1Mean: 0.580,
      t2Mean: 0.310,
      changePercent: '-27.0%',
      trend: 'Harvest Surface Transition',
      t1Scene: 'S2B_MSIL2A_20250320_T43RER',
      t2Scene: 'S2A_MSIL2A_20250625_T43RER',
      areaChanged: '86.5 km²',
      query: 'Analyze agricultural change detection in Punjab farmlands'
    }
  };

  const active = targets[selectedTarget];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <span>Bi-Temporal Satellite Change Detection Workspace</span>
          </h2>
          <p className="text-xs text-slate-400 pt-0.5">
            Compare baseline (T₁) and target (T₂) satellite passes to calculate deterministic land-cover and spectral difference rasters.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0a0f1d] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['DELHI', 'MUMBAI', 'PUNJAB'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTarget(key)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                selectedTarget === key
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Target Summary Banner */}
      <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>{active.name}</span>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
              Sentinel-2 MSI Bi-Temporal
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Detected Trend: <strong className="text-cyan-300">{active.trend}</strong> across {active.areaChanged}
          </p>
        </div>

        <button
          onClick={() => onRunChangeAnalysis(active.query)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-sans transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50 shrink-0"
        >
          <span>Run Change Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Panel Workspace: BEFORE vs AFTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* T1: Before */}
        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              T₁ Baseline Observation
            </span>
            <span className="text-[10px] font-mono bg-[#070b14] text-slate-300 px-2 py-0.5 rounded border border-slate-800">
              Sentinel-2B
            </span>
          </div>

          <div className="h-44 bg-[#070b14] rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />
            <Layers className="w-8 h-8 text-amber-400/80" />
            <div className="text-xs font-bold text-slate-200">{active.t1Date}</div>
            <div className="text-[11px] font-mono text-slate-400">Mean Index: {active.t1Mean}</div>
            <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{active.t1Scene}</div>
          </div>
        </div>

        {/* T2: After */}
        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              T₂ Target Observation
            </span>
            <span className="text-[10px] font-mono bg-[#070b14] text-slate-300 px-2 py-0.5 rounded border border-slate-800">
              Sentinel-2A
            </span>
          </div>

          <div className="h-44 bg-[#070b14] rounded-xl border border-slate-800 flex flex-col items-center justify-center p-4 text-center space-y-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            <Layers className="w-8 h-8 text-cyan-400/80" />
            <div className="text-xs font-bold text-slate-200">{active.t2Date}</div>
            <div className="text-[11px] font-mono text-slate-400">Mean Index: {active.t2Mean}</div>
            <div className="text-[10px] font-mono text-slate-500 truncate max-w-xs">{active.t2Scene}</div>
          </div>
        </div>
      </div>

      {/* Computed Difference Raster Bar */}
      <div className="p-5 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Computed Spectral Difference Matrix &bull; &Delta;(T₂ - T₁)</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% Deterministic Math
          </span>
        </div>

        {/* Dynamic Split Slider Demo */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300 font-sans">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Hard Wipe Split Comparator
            </span>
            <span className="text-cyan-300 font-bold">{sliderPos}% T₁ / {100 - sliderPos}% T₂</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>T₁: 100% Baseline</span>
            <span>Balanced 50/50</span>
            <span>T₂: 100% Target</span>
          </div>
        </div>

        {/* Change Stats Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-1 font-mono">
            <div className="text-[11px] text-slate-400">Net Spectral Shift</div>
            <div className="text-lg font-bold text-emerald-400 flex items-center gap-1">
              {active.changePercent.startsWith('+') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {active.changePercent}
            </div>
            <div className="text-[10px] text-slate-500">Delta Mean Reflectance</div>
          </div>

          <div className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-1 font-mono">
            <div className="text-[11px] text-slate-400">Significant Change Footprint</div>
            <div className="text-lg font-bold text-cyan-300">{active.areaChanged}</div>
            <div className="text-[10px] text-slate-500">Threshold: |&Delta;| &gt; 0.15</div>
          </div>

          <div className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-1 font-mono">
            <div className="text-[11px] text-slate-400">Data Confidence</div>
            <div className="text-lg font-bold text-cyan-400">97%</div>
            <div className="text-[10px] text-slate-500">Dual-Pass Coregistration</div>
          </div>
        </div>
      </div>
    </div>
  );
}
