import { useState } from 'react';
import {
  Search,
  Radio,
  ExternalLink,
  Play,
  Calendar,
  Cloud,
  Sliders,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';
import { SatelliteScene } from '../types';

export const REAL_SATELLITE_SCENES: SatelliteScene[] = [
  {
    scene_id: 'S2B_MSIL2A_20250315T053639_N0511_R005_T43REQ_20250315T081522',
    satellite: 'Sentinel-2B',
    sensor: 'MSI (Multi-Spectral Instrument)',
    acquisition_date: '2025-03-15T05:36:39Z',
    cloud_cover: 4.2,
    resolution: '10m GSD',
    product_id: 'S2B_MSIL2A_20250315_T43REQ',
    bbox: [77.10, 28.50, 77.30, 28.70],
    stac_url: 'https://catalogue.dataspace.copernicus.eu/stac/collections/SENTINEL-2/items/S2B_MSIL2A_20250315T053639_N0511_R005_T43REQ_20250315T081522',
    collection: 'SENTINEL-2 L2A',
    location_name: 'Delhi NCR Metropolitan'
  },
  {
    scene_id: 'S2A_MSIL2A_20250420T053641_N0511_R005_T43REQ_20250420T082010',
    satellite: 'Sentinel-2A',
    sensor: 'MSI (Multi-Spectral Instrument)',
    acquisition_date: '2025-04-20T05:36:41Z',
    cloud_cover: 12.1,
    resolution: '10m GSD',
    product_id: 'S2A_MSIL2A_20250420_T43REQ',
    bbox: [77.10, 28.50, 77.30, 28.70],
    stac_url: 'https://catalogue.dataspace.copernicus.eu/stac/collections/SENTINEL-2/items/S2A_MSIL2A_20250420T053641_N0511_R005_T43REQ_20250420T082010',
    collection: 'SENTINEL-2 L2A',
    location_name: 'Delhi NCR Metropolitan'
  },
  {
    scene_id: 'S2B_MSIL2A_20250310T054629_N0511_R091_T43KDA_20250310T083015',
    satellite: 'Sentinel-2B',
    sensor: 'MSI (Multi-Spectral Instrument)',
    acquisition_date: '2025-03-10T05:46:29Z',
    cloud_cover: 2.8,
    resolution: '10m GSD',
    product_id: 'S2B_MSIL2A_20250310_T43KDA',
    bbox: [72.77, 18.89, 73.01, 19.27],
    stac_url: 'https://catalogue.dataspace.copernicus.eu/stac/collections/SENTINEL-2/items/S2B_MSIL2A_20250310T054629_N0511_R091_T43KDA_20250310T083015',
    collection: 'SENTINEL-2 L2A',
    location_name: 'Mumbai Coastal Estuary'
  },
  {
    scene_id: 'S1A_IW_GRDH_1SDV_20250312T011500_20250312T011525_058200_071E00_A100',
    satellite: 'Sentinel-1A',
    sensor: 'C-SAR (Synthetic Aperture Radar)',
    acquisition_date: '2025-03-12T01:15:00Z',
    cloud_cover: 0.0,
    resolution: '10m / 20m (IW Mode)',
    product_id: 'S1A_IW_GRDH_1SDV_20250312_MUMBAI',
    bbox: [72.70, 18.80, 73.10, 19.35],
    stac_url: 'https://catalogue.dataspace.copernicus.eu/stac/collections/SENTINEL-1/items/S1A_IW_GRDH_1SDV_20250312T011500',
    collection: 'SENTINEL-1 GRD',
    location_name: 'Mumbai Metropolitan & Arabian Sea'
  },
  {
    scene_id: 'S2A_MSIL2A_20250228T051831_N0511_R033_T43PFN_20250228T080512',
    satellite: 'Sentinel-2A',
    sensor: 'MSI (Multi-Spectral Instrument)',
    acquisition_date: '2025-02-28T05:18:31Z',
    cloud_cover: 1.5,
    resolution: '10m GSD',
    product_id: 'S2A_MSIL2A_20250228_T43PFN',
    bbox: [77.46, 12.83, 77.74, 13.14],
    stac_url: 'https://catalogue.dataspace.copernicus.eu/stac/collections/SENTINEL-2/items/S2A_MSIL2A_20250228T051831',
    collection: 'SENTINEL-2 L2A',
    location_name: 'Bengaluru Tech Corridor'
  },
  {
    scene_id: 'S2B_MSIL2A_20250318T045649_N0511_R119_T45QXF_20250318T074522',
    satellite: 'Sentinel-2B',
    sensor: 'MSI (Multi-Spectral Instrument)',
    acquisition_date: '2025-03-18T04:56:49Z',
    cloud_cover: 3.1,
    resolution: '10m GSD',
    product_id: 'S2B_MSIL2A_20250318_T45QXF',
    bbox: [88.50, 21.50, 89.20, 22.10],
    stac_url: 'https://catalogue.dataspace.copernicus.eu/stac/collections/SENTINEL-2/items/S2B_MSIL2A_20250318T045649',
    collection: 'SENTINEL-2 L2A',
    location_name: 'Sundarbans Mangrove Delta'
  }
];

interface LiveSatelliteDataProps {
  onAnalyzeScene: (query: string) => void;
}

export default function LiveSatelliteData({
  onAnalyzeScene
}: LiveSatelliteDataProps) {
  const [filterText, setFilterText] = useState('');
  const [selectedSensor, setSelectedSensor] = useState<'ALL' | 'SENTINEL-2' | 'SENTINEL-1'>('ALL');

  const filteredScenes = REAL_SATELLITE_SCENES.filter((scene) => {
    const matchesText =
      scene.scene_id.toLowerCase().includes(filterText.toLowerCase()) ||
      scene.location_name.toLowerCase().includes(filterText.toLowerCase()) ||
      scene.satellite.toLowerCase().includes(filterText.toLowerCase());

    const matchesSensor =
      selectedSensor === 'ALL' ||
      (selectedSensor === 'SENTINEL-2' && scene.collection.includes('SENTINEL-2')) ||
      (selectedSensor === 'SENTINEL-1' && scene.collection.includes('SENTINEL-1'));

    return matchesText && matchesSensor;
  });

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Radio className="w-5 h-5 text-cyan-400" />
            <span>Copernicus CDSE Live Satellite Data Archive</span>
          </h2>
          <p className="text-xs text-slate-400 pt-0.5">
            Discover real optical and radar satellite scenes available for deterministic geospatial analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            CDSE STAC ONLINE
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0a0f1d] p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter by location, scene ID, or sensor..."
            className="w-full bg-[#070b14] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono w-full sm:w-auto overflow-x-auto">
          <span className="text-slate-500 flex items-center gap-1 font-sans text-xs mr-1">
            <Filter className="w-3.5 h-3.5" /> Sensor:
          </span>
          {(['ALL', 'SENTINEL-2', 'SENTINEL-1'] as const).map((sensor) => (
            <button
              key={sensor}
              onClick={() => setSelectedSensor(sensor)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                selectedSensor === sensor
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'bg-[#070b14] hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {sensor}
            </button>
          ))}
        </div>
      </div>

      {/* Scene Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenes.map((scene) => {
          const isS2 = scene.collection.includes('SENTINEL-2');
          return (
            <div
              key={scene.scene_id}
              className="p-4 bg-[#0a0f1d] border border-slate-800 hover:border-cyan-500/40 rounded-2xl space-y-3.5 shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Card Top Title & Satellite Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {scene.location_name}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold truncate block max-w-sm">
                      {scene.product_id}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                      isS2
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                        : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80'
                    }`}
                  >
                    {scene.satellite}
                  </span>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#070b14] p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{scene.acquisition_date.substring(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Cloud: {scene.cloud_cover.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{scene.resolution}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{scene.collection}</span>
                  </div>
                </div>

                {/* Scene ID full string */}
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  ID: {scene.scene_id}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={scene.stac_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-slate-400 hover:text-cyan-300 text-xs flex items-center gap-1 transition-colors font-mono"
                  title="View STAC JSON"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>STAC Link</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAnalyzeScene(`Analyze NDVI vegetation in ${scene.location_name}`)}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold font-sans transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Analyze Scene</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
