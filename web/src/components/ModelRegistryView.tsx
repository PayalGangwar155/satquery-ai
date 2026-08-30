import {
  Cpu,
  ShieldCheck,
  Lock,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

export const REGISTERED_OPERATIONS = [
  {
    name: 'resolve_aoi',
    category: 'Spatial Geocoding',
    inputs: 'place_name (str) or bbox (list[float])',
    outputs: 'GeoJSON Polygon, BBox, Centroid',
    source: 'OSM Nominatim API / PostGIS',
    desc: 'Translates natural language place queries into validated GeoJSON polygon footprints.'
  },
  {
    name: 'search_scenes',
    category: 'STAC Discovery',
    inputs: 'geojson_aoi, datetime_range, collection, max_cloud',
    outputs: 'List of matching satellite scene metadata items',
    source: 'Copernicus Data Space Ecosystem (CDSE) STAC',
    desc: 'Discovers real Sentinel-2 and Sentinel-1 scenes matching spatial and temporal constraints.'
  },
  {
    name: 'pick_scenes',
    category: 'Scene Selection',
    inputs: 'scenes (list), strategy (lowest_cloud | closest_to_date)',
    outputs: 'Single optimal Satellite Scene object',
    source: 'SatQuery Deterministic Selection Engine',
    desc: 'Selects the highest quality clear-sky scene for raster processing.'
  },
  {
    name: 'render_bands',
    category: 'Raster Rendering',
    inputs: 'scene_id, bands (e.g. B04, B03, B02), format',
    outputs: 'PNG/TIFF artifact path on local filesystem',
    source: 'Sentinel Hub Process API / Rio-Tiler',
    desc: 'Renders natural color (True Color RGB) or False Color Infrared composite imagery.'
  },
  {
    name: 'compute_index',
    category: 'Spectral Math',
    inputs: 'scene_id, index_name (NDVI | NDWI | NDBI | EVI | NBR)',
    outputs: 'GeoTIFF raster path, min/max/mean/std statistics',
    source: 'SatQuery Core (numpy / rasterio)',
    desc: 'Calculates normalized difference raster arrays using calibrated Bottom-Of-Atmosphere bands.'
  },
  {
    name: 'zonal_stats',
    category: 'Polygon Analytics',
    inputs: 'raster_path, geojson_aoi, metrics',
    outputs: 'Mean, Std, Min, Max, valid pixel count, total area (sq km)',
    source: 'SatQuery Core (rasterio / shapely)',
    desc: 'Extracts exact statistical aggregations across the user-specified polygon boundary.'
  },
  {
    name: 'time_series',
    category: 'Temporal Aggregation',
    inputs: 'geojson_aoi, index_name, date_start, date_end, interval',
    outputs: 'Array of date-stamped statistical observations',
    source: 'Copernicus Statistical API',
    desc: 'Constructs multi-temporal vegetation or moisture trajectory profiles.'
  },
  {
    name: 'change_detect',
    category: 'Bi-Temporal Difference',
    inputs: 'baseline_scene_id, target_scene_id, index_name',
    outputs: 'Difference GeoTIFF, changed area (sq km), shift %',
    source: 'SatQuery Core (numpy differential math)',
    desc: 'Calculates pixel-by-pixel shift matrix between two coregistered satellite passes.'
  },
  {
    name: 'semantic_search',
    category: 'SigLIP Vector Retrieval',
    inputs: 'text_prompt, top_k',
    outputs: 'Ranked satellite tile candidates with similarity scores',
    source: 'SigLIP SO400M Text Tower + pgvector',
    desc: 'Discovers remote sensing tiles using natural-language vision-language embeddings.'
  },
  {
    name: 'vlm_describe',
    category: 'Constrained Visual Verification',
    inputs: 'image_artifact_path, prompt',
    outputs: 'Grounded visual narrative description',
    source: 'Vision-Language Model (VLM)',
    desc: 'Produces constrained qualitative visual descriptions strictly tied to raster evidence.'
  }
];

export default function ModelRegistryView() {
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>SatQuery AI Model & Deterministic Operation Registry</span>
          </h2>
          <p className="text-xs text-slate-400 pt-0.5">
            10 registered geospatial operations + GeoPlan DAG Planner + Strict Numeric Guard Gate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/50 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Deterministic Execution
          </span>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-2 shadow-xl">
          <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono uppercase">
            <Terminal className="w-4 h-4" />
            1. GeoPlan DAG Planner
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Translates natural language questions into strongly typed Pydantic DAG execution graphs. The LLM selects known operations only.
          </p>
        </div>

        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-2 shadow-xl">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono uppercase">
            <Activity className="w-4 h-4" />
            2. Deterministic Ops Layer
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pure Python raster mathematics (<code>numpy</code>, <code>rasterio</code>, <code>shapely</code>). The model never calculates numbers.
          </p>
        </div>

        <div className="p-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl space-y-2 shadow-xl">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono uppercase">
            <Lock className="w-4 h-4" />
            3. Strict Numeric Guard Gate
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Regex evidence scanner strictly verifies every numeric token in generated answers against executed raster operation outputs.
          </p>
        </div>
      </div>

      {/* 10 Operations Table */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Registered Deterministic Operations (v1.0 Specification)
          </span>
          <span className="text-[10px] font-mono text-slate-500">10 / 10 Active</span>
        </div>

        <div className="divide-y divide-slate-800/80 overflow-x-auto">
          {REGISTERED_OPERATIONS.map((op, idx) => (
            <div key={op.name} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 md:max-w-md">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold font-mono text-cyan-300 text-sm">{op.name}</span>
                  <span className="text-[10px] font-mono bg-[#070b14] text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    {op.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {op.desc}
                </p>
              </div>

              <div className="space-y-1 font-mono text-[11px] text-slate-400 md:text-right">
                <div>
                  <span className="text-slate-500">Inputs: </span>
                  <span className="text-slate-300">{op.inputs}</span>
                </div>
                <div>
                  <span className="text-slate-500">Source: </span>
                  <span className="text-amber-300">{op.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
