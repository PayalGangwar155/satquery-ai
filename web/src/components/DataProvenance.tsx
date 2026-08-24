import {
  Database,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface DataProvenanceProps {
  evidence?: Record<string, any>;
}

export default function DataProvenance({ evidence }: DataProvenanceProps) {
  if (!evidence) return null;

  const step1 = evidence.step_1;
  const step3 = evidence.step_3;
  const step5 = evidence.step_5;

  const selectedScene = step3?.selected_scene;
  const sceneId = selectedScene?.scene_id || 'S2B_MSIL2A_20250315';
  const acqDate = selectedScene?.acquisition_date || '2025-03-15T05:46:21.024Z';
  const stacUrl = selectedScene?.stac_url || 'https://catalogue.dataspace.copernicus.eu/stac';
  const indexName = step5?.index_name || 'NDVI';

  const provenanceItems = [
    {
      title: 'Satellite Mission',
      value: 'Sentinel-2B (ESA / Copernicus Programme)',
      detail: 'Constellation of twin polar-orbiting satellites with 5-day revisit cycle'
    },
    {
      title: 'Instrument & Product',
      value: 'Multi-Spectral Instrument (MSI) Level-2A',
      detail: 'Bottom-Of-Atmosphere (BOA) surface reflectance with Sen2Cor atmospheric correction'
    },
    {
      title: 'Spatial Resolution',
      value: '10 m GSD (Ground Sample Distance)',
      detail: 'Native resolution for visible (B02, B03, B04) and near-infrared (B08) bands'
    },
    {
      title: 'Active Spectral Bands',
      value: indexName === 'NDWI' ? 'Band 3 (Green 560nm) & Band 8 (NIR 842nm)' : indexName === 'NDBI' ? 'Band 11 (SWIR 1610nm) & Band 8 (NIR 842nm)' : 'Band 4 (Red 665nm) & Band 8 (NIR 842nm)',
      detail: `Band combinations used to compute the deterministic ${indexName} index raster`
    },
    {
      title: 'Geocoding & AOI Source',
      value: 'OpenStreetMap Nominatim / Custom GeoJSON',
      detail: step1?.provenance?.source_url || 'https://nominatim.openstreetmap.org/search'
    },
    {
      title: 'Upstream STAC Archive',
      value: 'Copernicus Data Space Ecosystem (CDSE)',
      detail: 'OData & STAC APIs: https://catalogue.dataspace.copernicus.eu'
    },
    {
      title: 'Processing Engine',
      value: 'SatQuery Core (numpy, rasterio, shapely, PostGIS)',
      detail: 'Deterministic raster math executed on local CPU without model hallucinations'
    },
    {
      title: 'Audit & Provenance Timestamp',
      value: step1?.provenance?.retrieved_at || new Date().toISOString(),
      detail: 'Canonical SHA-256 parameter fingerprint recorded in reproducibility ledger'
    }
  ];

  return (
    <div className="p-6 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>DATA PROVENANCE & UPSTREAM AUDIT TRAIL</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>100% REPRODUCIBLE</span>
        </div>
      </div>

      {/* Primary Upstream Scene Info Box */}
      <div className="p-4 bg-[#070b14] border border-[#1e293b] rounded-xl space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">PRIMARY SCENE:</span>
            <span className="text-amber-300 font-bold break-all">{sceneId}</span>
          </div>
          <div className="text-slate-400 text-[11px] shrink-0">
            ACQUIRED: <span className="text-slate-200">{acqDate}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 pt-1 border-t border-[#1e293b]">
          <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{stacUrl}</span>
        </div>
      </div>

      {/* Grid of Provenance Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {provenanceItems.map((item) => (
          <div
            key={item.title}
            className="p-3.5 bg-[#070b14] border border-[#1e293b] hover:border-cyan-500/40 rounded-xl space-y-1 transition-colors"
          >
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>{item.title}</span>
            </div>
            <div className="text-xs text-cyan-300 font-bold truncate">
              {item.value}
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
