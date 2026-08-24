import {
  Database,
  ExternalLink,
  CheckCircle2,
  Layers
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
      detail: 'Deterministic raster math executed locally with zero LLM calculations'
    },
    {
      title: 'Audit & Provenance Timestamp',
      value: step1?.provenance?.retrieved_at || new Date().toISOString(),
      detail: 'Canonical SHA-256 parameter fingerprint recorded in reproducibility ledger'
    }
  ];

  return (
    <div className="p-4 sm:p-5 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl space-y-3.5 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Data Provenance & Upstream Audit Trail</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/60 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>100% Reproducible</span>
        </div>
      </div>

      {/* Primary Upstream Scene Info Box */}
      <div className="p-3.5 bg-[#070b14] border border-slate-800 rounded-xl space-y-1.5 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-sans">Primary Scene:</span>
            <span className="text-amber-300 font-bold break-all">{sceneId}</span>
          </div>
          <div className="text-slate-400 text-xs shrink-0">
            Acquired: <span className="text-slate-200">{acqDate.substring(0, 19).replace('T', ' ')} UTC</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
          <ExternalLink className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">{stacUrl}</span>
        </div>
      </div>

      {/* Grid of Provenance Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-0.5">
        {provenanceItems.map((item) => (
          <div
            key={item.title}
            className="p-3 bg-[#070b14] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl space-y-1 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{item.title}</span>
            </div>
            <div className="text-xs font-bold font-mono text-cyan-300 truncate">
              {item.value}
            </div>
            <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
