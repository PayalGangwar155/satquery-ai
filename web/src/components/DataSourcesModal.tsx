import {
  X,
  Database,
  Satellite,
  Layers,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataSourcesModal({ isOpen, onClose }: DataSourcesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl font-mono text-xs flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5 text-slate-100 font-bold text-sm uppercase">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Satellite Data Sources & Spectral Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 bg-[#070b14] border border-[#1e293b] hover:border-cyan-500/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-slate-300">
          {/* Section 1: Satellite Constellations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Satellite className="w-4 h-4" /> 1. Upstream Satellite Missions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-100 font-bold">
                  <span>Copernicus Sentinel-2 (MSI)</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    Primary Optical
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Twin polar-orbiting satellites (Sentinel-2A & 2B) providing 13 spectral bands from visible to shortwave infrared with 10m-20m ground resolution and a 5-day revisit.
                </p>
                <div className="text-[11px] text-slate-400 pt-1 space-y-1">
                  <div>• <strong>Level:</strong> L2A Bottom-Of-Atmosphere (BOA) Reflectance</div>
                  <div>• <strong>GSD:</strong> 10m (B02, B03, B04, B08) | 20m (B05-B07, B11, B12)</div>
                </div>
              </div>

              <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-2">
                <div className="flex items-center justify-between text-slate-100 font-bold">
                  <span>Copernicus Sentinel-1 (C-SAR)</span>
                  <span className="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                    Synthetic Aperture Radar
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Active C-band radar imaging providing all-weather, day-and-night observation capable of penetrating cloud cover for flood delineation and surface deformation.
                </p>
                <div className="text-[11px] text-slate-400 pt-1 space-y-1">
                  <div>• <strong>Mode:</strong> Interferometric Wide (IW) GRD</div>
                  <div>• <strong>Polarization:</strong> Dual VV + VH | 10m Resolution</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Spectral Band Configurations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" /> 2. Sentinel-2 Spectral Band Allocation
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border border-[#1e293b] rounded-xl overflow-hidden">
                <thead className="bg-[#070b14] text-slate-300 text-left border-b border-[#1e293b]">
                  <tr>
                    <th className="p-2.5">Band ID</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Central Wavelength</th>
                    <th className="p-2.5">Resolution</th>
                    <th className="p-2.5">Primary Application</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b] bg-[#0c1322]/60">
                  <tr>
                    <td className="p-2.5 font-bold text-sky-400">B02</td>
                    <td className="p-2.5">Blue</td>
                    <td className="p-2.5">490 nm</td>
                    <td className="p-2.5">10 m</td>
                    <td className="p-2.5 text-slate-400">Atmospheric aerosol / Deep water</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">B03</td>
                    <td className="p-2.5">Green</td>
                    <td className="p-2.5">560 nm</td>
                    <td className="p-2.5">10 m</td>
                    <td className="p-2.5 text-slate-400">Vegetation peak & NDWI water math</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-rose-400">B04</td>
                    <td className="p-2.5">Red</td>
                    <td className="p-2.5">665 nm</td>
                    <td className="p-2.5">10 m</td>
                    <td className="p-2.5 text-slate-400">Chlorophyll absorption & NDVI math</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-cyan-300">B08</td>
                    <td className="p-2.5">Near Infrared (NIR)</td>
                    <td className="p-2.5">842 nm</td>
                    <td className="p-2.5">10 m</td>
                    <td className="p-2.5 text-slate-400">Leaf cellular reflectance & Biomass</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-amber-400">B11</td>
                    <td className="p-2.5">Shortwave Infrared (SWIR-1)</td>
                    <td className="p-2.5">1610 nm</td>
                    <td className="p-2.5">20 m</td>
                    <td className="p-2.5 text-slate-400">Moisture & NDBI built-up mapping</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Index Formulas */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4" /> 3. Remote Sensing Index Mathematical Definitions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-1.5">
                <div className="text-emerald-400 font-bold">NDVI (Vegetation)</div>
                <div className="text-xs text-slate-200 bg-[#0f172a] p-2 rounded border border-[#1e293b] text-center">
                  (B08 - B04) / (B08 + B04)
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Measures chlorophyll vigour and photosynthetic active biomass density.
                </p>
              </div>

              <div className="p-3.5 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-1.5">
                <div className="text-sky-400 font-bold">NDWI (Water)</div>
                <div className="text-xs text-slate-200 bg-[#0f172a] p-2 rounded border border-[#1e293b] text-center">
                  (B03 - B08) / (B03 + B08)
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Delineates open water bodies, wetlands, and flooding water boundaries.
                </p>
              </div>

              <div className="p-3.5 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-1.5">
                <div className="text-amber-400 font-bold">NDBI (Built-up)</div>
                <div className="text-xs text-slate-200 bg-[#0f172a] p-2 rounded border border-[#1e293b] text-center">
                  (B11 - B08) / (B11 + B08)
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Highlights impervious surfaces, concrete, asphalt, and urban settlements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1e293b] bg-[#070b14] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>CDSE STAC & OData API Verified Integration</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
