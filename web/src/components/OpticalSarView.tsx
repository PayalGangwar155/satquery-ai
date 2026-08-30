import { useState } from 'react';
import {
  Layers,
  Sun,
  CloudRain,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface OpticalSarViewProps {
  onRunOpticalSarQuery: (query: string) => void;
}

export default function OpticalSarView({
  onRunOpticalSarQuery
}: OpticalSarViewProps) {
  const [selectedPreset, setSelectedPreset] = useState<'MUMBAI' | 'SUNDARBANS' | 'DELHI'>('MUMBAI');

  const presets = {
    MUMBAI: {
      location: 'Mumbai Coastal Estuary & Port',
      opticalMission: 'Sentinel-2B MSI (Level-2A BOA)',
      sarMission: 'Sentinel-1A C-SAR (GRD VV+VH)',
      opticalDetails: 'B04 (Red), B03 (Green), B08 (NIR) at 10m GSD',
      sarDetails: 'C-Band 5.405 GHz radar, cloud-penetrating backscatter σ°',
      fusionInsight: 'All-weather tidal creek delineation & flood hazard mapping',
      query: 'Compare optical and SAR imagery around Mumbai coastline'
    },
    SUNDARBANS: {
      location: 'Sundarbans Mangrove Biosphere Delta',
      opticalMission: 'Sentinel-2A MSI (Level-2A BOA)',
      sarMission: 'Sentinel-1A C-SAR (GRD VV+VH)',
      opticalDetails: 'B08 (NIR) and B04 (Red) canopy reflectance at 10m GSD',
      sarDetails: 'Dual-pol radar backscatter distinguishing mangrove canopy from water channels',
      fusionInsight: 'Cloud-resilient mangrove biomass monitoring and tidal channel mapping',
      query: 'Compare optical Sentinel-2 and SAR Sentinel-1 imagery for Sundarbans'
    },
    DELHI: {
      location: 'Delhi NCR Urban & River Yamuna',
      opticalMission: 'Sentinel-2B MSI (Level-2A BOA)',
      sarMission: 'Sentinel-1B C-SAR (GRD VV+VH)',
      opticalDetails: 'Visible + NIR + SWIR multispectral bands at 10m GSD',
      sarDetails: 'Double-bounce radar urban signature and river boundary detection',
      fusionInsight: 'Urban structure volume vs vegetation canopy discrimination',
      query: 'Analyze optical and radar backscatter for Delhi NCR'
    }
  };

  const active = presets[selectedPreset];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Multi-Sensor Optical (Sentinel-2) + SAR (Sentinel-1) Fusion</span>
          </h2>
          <p className="text-xs text-slate-400 pt-0.5">
            Complement multispectral surface reflectance with cloud-penetrating synthetic aperture radar backscatter.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0a0f1d] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['MUMBAI', 'SUNDARBANS', 'DELHI'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                selectedPreset === key
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Target Info Banner */}
      <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span>{active.location}</span>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded">
              Co-Registered Multi-Sensor
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Analytical Application: <strong className="text-cyan-300">{active.fusionInsight}</strong>
          </p>
        </div>

        <button
          onClick={() => onRunOpticalSarQuery(active.query)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-sans transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50 shrink-0"
        >
          <span>Execute Multi-Sensor Query</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3-Panel Layout: Optical | SAR | Fused */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1: Optical */}
        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                1. Optical (Sentinel-2)
              </span>
              <span className="text-[10px] font-mono bg-[#070b14] text-emerald-400 px-2 py-0.5 rounded border border-slate-800">
                10m MSI
              </span>
            </div>

            <div className="h-40 bg-[#070b14] rounded-xl border border-slate-800 p-3 space-y-2 flex flex-col justify-center">
              <div className="text-xs font-semibold text-slate-200 font-mono">{active.opticalMission}</div>
              <div className="text-[11px] text-slate-400">{active.opticalDetails}</div>
              <div className="text-[10px] text-slate-500 font-mono">Spectrum: 400nm - 2200nm</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Strengths: Direct spectral vegetation & water indices (NDVI, NDWI).
          </div>
        </div>

        {/* Panel 2: SAR */}
        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4" />
                2. SAR (Sentinel-1)
              </span>
              <span className="text-[10px] font-mono bg-[#070b14] text-cyan-400 px-2 py-0.5 rounded border border-slate-800">
                C-SAR Radar
              </span>
            </div>

            <div className="h-40 bg-[#070b14] rounded-xl border border-slate-800 p-3 space-y-2 flex flex-col justify-center">
              <div className="text-xs font-semibold text-slate-200 font-mono">{active.sarMission}</div>
              <div className="text-[11px] text-slate-400">{active.sarDetails}</div>
              <div className="text-[10px] text-slate-500 font-mono">Polarization: VV + VH</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Strengths: 100% all-weather, day/night cloud penetration, roughness & moisture sensitivity.
          </div>
        </div>

        {/* Panel 3: Fused Analysis */}
        <div className="p-4 bg-[#0a0f1d] border border-cyan-500/40 rounded-2xl space-y-3 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                3. Fused Synergistic Analysis
              </span>
              <span className="text-[10px] font-mono bg-[#070b14] text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                Coregistered
              </span>
            </div>

            <div className="h-40 bg-[#070b14] rounded-xl border border-slate-800 p-3 space-y-2 flex flex-col justify-center">
              <div className="text-xs font-semibold text-emerald-300">Multi-Modal Decision Layer</div>
              <div className="text-[11px] text-slate-300 leading-relaxed">{active.fusionInsight}</div>
              <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified CDSE Data Streams
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Confidence: 97%</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Grounded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
