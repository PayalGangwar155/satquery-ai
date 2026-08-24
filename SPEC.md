# SPEC.md — SatQuery AI (SIH26167) Master Technical Specification

SatQuery AI is a vision-language and geospatial analysis assistant for remote sensing / satellite data. It processes natural language queries about Earth observation data by constructing a validated execution plan (`GeoPlan`), executing real deterministic geospatial operations against satellite data providers (Copernicus Data Space Ecosystem, Sentinel STAC, Sentinel Hub, Nominatim), computing data confidence deterministically, enforcing strict numeric grounding, and presenting the findings in a professional ground-station visual interface.

---

## 1. Core System Architecture

```
User Query (NL)
       │
       ▼
Natural Language Planner (LLM: Gemini / Ollama)
       │
       ▼
GeoPlan Validator (Pydantic Schema Enforcement)
       │
       ▼
Deterministic Operation Registry (api/app/ops/*)
 ├── resolve_aoi        ├── render_bands       ├── time_series
 ├── search_scenes      ├── compute_index      ├── change_detect
 ├── pick_scenes        ├── zonal_stats        ├── semantic_search / vlm_describe
       │
       ▼
Geospatial Data Engine (rasterio, numpy, shapely, geopandas, PostGIS 16 + pgvector)
       │
       ▼
Evidence & Artifact Store (GeoJSON, GeoTIFF, PNG, JSON evidence + Provenance)
       │
       ▼
Deterministic Confidence Calculator (api/app/core/confidence.py)
       │
       ▼
Grounded Composer + Numeric Guard (api/app/core/numeric_guard.py)
       │
       ▼
Ground-Station Console UI (React 18, TypeScript, MapLibre GL JS, Plan Tape)
```

---

## 2. Hard Correctness Guarantees & Zero Fabrication Policy

1. **Zero Synthetic / Mock Data Rule**:
   - No `faker`, `Math.random()`, `numpy.random`, or fabricated numbers, coordinates, dates, indices (NDVI/NDWI/NDBI), areas, or percentages anywhere in the codebase.
   - UI components render ONLY from executed `GeoPlan` operation results.
   - If an API or imagery is unavailable, raise a typed error with an actionable user-facing message. Never silently substitute mock data.

2. **Model Boundary**:
   - The LLM constructs `GeoPlan` JSON and synthesizes natural text using ONLY completed operation outputs.
   - The LLM NEVER calculates areas, NDVI, percentages, confidence, or scene dates directly.

3. **Numeric Grounding Gate (`api/app/core/numeric_guard.py`)**:
   - Scans final text output for all numeric tokens (integers, floats, percentages, dates, coordinates).
   - Validates that every numeric token is deterministically traceable to evidence returned by operations.
   - Disallowed numeric tokens trigger one re-composition attempt. If it fails again, the offending sentence is dropped.

4. **Deterministic Data Confidence (`api/app/core/confidence.py`)**:
   - Confidence score \(C \in [0.0, 1.0]\) is calculated purely via deterministic code:
     $$C = w_{\text{cloud}} \cdot (1 - \text{cloud\_fraction}) + w_{\text{resolution}} \cdot \text{res\_score} + w_{\text{temporal}} \cdot \text{time\_score} + w_{\text{coverage}} \cdot \text{aoi\_coverage}$$
   - Confidence is NEVER emitted by an LLM.

---

## 3. Technology Stack

| Domain | Selected Technology |
| :--- | :--- |
| **API Framework** | Python 3.11, FastAPI, Pydantic v2, uvicorn, httpx |
| **Geospatial Processing** | rasterio, numpy, shapely, pyproj, geopandas, rio-tiler |
| **Database & Vector Index** | PostgreSQL 16 + PostGIS 3.4 + pgvector |
| **Job Queue** | PostgreSQL job table (`jobs`) + Python `asyncio` background task worker |
| **Frontend Framework** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Map Engine** | MapLibre GL JS |
| **Client State** | TanStack Query v5 + Zustand |
| **LLM Provider** | Swappable Provider (Google Gemini API / Ollama local) |
| **Embeddings** | Text-to-Tile Search: SigLIP (`google/siglip-so400m-patch14-384`)<br>Knowledge Base: `BAAI/bge-small-en-v1.5` |
| **Upstream Data APIs** | Copernicus Data Space Ecosystem (CDSE STAC, Sentinel-2 L2A, Sentinel-1 GRD, Sentinel Hub Process API, Sentinel Hub Statistical API), OSM Nominatim |
| **Containerization** | Docker Compose (`docker-compose.yml`) |

---

## 4. GeoPlan Schema & Operations Registry

A `GeoPlan` is a structured execution graph containing steps.

### 4.1 GeoPlan Schema (JSON / Pydantic)
```json
{
  "query_id": "string (UUID)",
  "question": "string",
  "aoi_query": "string or BoundingBox",
  "target_date_range": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "baseline_date_range": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "steps": [
    {
      "step_id": "step_1",
      "op": "operation_name",
      "params": {},
      "depends_on": []
    }
  ]
}
```

### 4.2 The 10 Validated Operations

1. **`resolve_aoi`**:
   - *Inputs*: `place_name` (str) OR `bbox` `[min_lon, min_lat, max_lon, max_lat]`.
   - *Output*: GeoJSON Feature (Polygon/MultiPolygon), bounding box, centroid, resolved location name, Nominatim OSM metadata provenance.

2. **`search_scenes`**:
   - *Inputs*: `geojson_aoi` (dict), `datetime_range` (str "YYYY-MM-DD/YYYY-MM-DD"), `collection` (default "SENTINEL-2"), `max_cloud_cover` (float 0-100).
   - *Output*: List of STAC item metadata (scene IDs, acquisition timestamps, cloud cover percentages, footprint geometries, download/tile URLs, provider provenance).

3. **`pick_scenes`**:
   - *Inputs*: `scene_list` (from `search_scenes`), `strategy` ("lowest_cloud" | "closest_to_date" | "coverage_max"), `target_date` (optional str).
   - *Output*: Selected primary scene ID(s), metadata, cloud fraction, tile path/URL.

4. **`render_bands`**:
   - *Inputs*: `scene_id` (str), `bands` (list of str e.g. `["B04", "B03", "B02"]` for RGB or `["B08", "B04", "B03"]` for NIR False Color), `aoi` (GeoJSON), `format` ("png" | "geotiff").
   - *Output*: Rendered image artifact relative filepath (`artifacts/render_<hash>.<ext>`), resolution, extent bounding box, byte size.

5. **`compute_index`**:
   - *Inputs*: `scene_id` (str), `index_name` ("NDVI" | "NDWI" | "NDBI" | "EVI" | "NBR"), `aoi` (GeoJSON).
   - *Output*: Calculated index raster artifact path (`artifacts/index_<hash>.tif`), index statistics (`min`, `max`, `mean`, `std`, `median`), mask metrics.

6. **`zonal_stats`**:
   - *Inputs*: `raster_path` (str), `geojson_geometry` (dict), `metrics` (list e.g. `["mean", "std", "min", "max", "p10", "p90"]`).
   - *Output*: Dictionary of computed numeric statistics, pixel count, valid data pixel fraction, pixel area in m².

7. **`time_series`**:
   - *Inputs*: `geojson_aoi` (dict), `index_name` (str), `date_start` (str), `date_end` (str), `interval` ("monthly" | "biweekly" | "weekly").
   - *Output*: Array of timestamped measurements `[{ "date": "YYYY-MM-DD", "mean": float, "std": float, "valid_pixel_ratio": float, "scene_id": str }]`.

8. **`change_detect`**:
   - *Inputs*: `baseline_scene_id` (str), `target_scene_id` (str), `index_name` (str), `aoi` (GeoJSON), `threshold` (float).
   - *Output*: Delta raster artifact path (`artifacts/diff_<hash>.tif`), net area changed (m²), change percentage, mean change magnitude, before/after timestamp comparison metadata.

9. **`semantic_search`**:
   - *Inputs*: `text_prompt` (str), `aoi` (GeoJSON), `top_k` (int, default 5).
   - *Output*: Ranked list of satellite tiles matching prompt embeddings via SigLIP text tower + pgvector cosine distance, similarity scores, bounding boxes, scene metadata.

10. **`vlm_describe`**:
    - *Inputs*: `image_artifact_path` (str), `aoi_name` (str), `context_op_results` (dict).
    - *Output*: Grounded visual feature narrative constrained purely to visible patterns and verified stats in the rendered artifact.

---

## 5. Offline Demo & Recorded Fixture System

When running in offline mode (`OFFLINE_REPLAY=true`):
- Operations match input requests against `fixtures/recorded/<op>/<sha256_hash>.json`.
- Metadata is recorded in `fixtures/recorded/manifest.json`:
  ```json
  {
    "fixtures": [
      {
        "op": "resolve_aoi",
        "hash": "a1b2c3...",
        "source_url": "https://nominatim.openstreetmap.org/search?...",
        "request_sha256": "...",
        "timestamp": "2026-08-23T23:30:00Z",
        "http_status": 200,
        "file_path": "fixtures/recorded/resolve_aoi/a1b2c3.json"
      }
    ]
  }
  ```
- If a fixture is missing during offline mode, the system raises a clear `FixtureNotFoundError`. It NEVER generates synthetic data.
- The UI displays an "OFFLINE REPLAY" banner whenever replayed fixtures are active.

---

## 6. Ground-Station Console UI / UX Specification

### 6.1 Layout Structure
- **Header**: System Title ("SATQUERY AI // GROUND-STATION CONSOLE"), Connection / Upstream Status, Mode Badge (LIVE / OFFLINE REPLAY), Active AOI Display.
- **Left Panel (Main View)**:
  - Natural Language Input Box & Prompt Presets.
  - Interactive **MapLibre GL JS** map displaying AOI bounding box, vector geometries, raster overlays (True Color, False Color, NDVI, Change Mask).
  - Before/After Temporal Hard-Wipe slider for `change_detect` analysis.
  - Grounded Answer Card with numeric evidence citations.
  - Data Confidence Breakdown Widget (Cloud cover score, spatial resolution, temporal proximity, AOI coverage).
- **Right Panel (Plan Tape)**:
  - Visible ground-station log stream showing every step of the `GeoPlan`.
  - Expandable steps showing: Step ID, operation name, status badge (Pending, Running, Completed, Failed), duration (ms), validated Pydantic parameters, exact upstream URLs / STAC query params, raw response evidence snippet.

### 6.2 Visual Styling Rules
- Toposheet / Paper-inspired background with crisp ink hairline borders.
- Monospace font (`JetBrains Mono` or `Fira Code`) for metrics, coordinates (`lat/lon`), dates, scene IDs, durations, and pixel statistics.
- Semantic data colors: Green (high vegetation / high confidence), Amber (moderate), Red/Orange (change detection / degradation / warning), Cyan/Blue (water/NDWI).

---

## 7. Quality Assurance & Evaluation Framework

1. **Acceptance Criteria**:
   - 100% of numerical tokens in final composer output match deterministic operation evidence.
   - All 10 operations have unit/integration tests with recorded fixtures.
   - GeoPlan JSON strictly satisfies `api/app/core/geoplan.py` Pydantic models.
   - MapLibre UI renders actual raster GeoTIFF / PNG outputs produced by raster operations.
2. **Evaluation Metrics (`api/app/eval/run_eval.py`)**:
   - `plan_validity_rate`: % of NL queries producing valid GeoPlans.
   - `numeric_guard_pass_rate`: % of generated responses passing numeric grounding without violations.
   - `operation_success_rate`: % of executed steps succeeding.
   - `end_to_end_latency_ms`: Total execution time.
