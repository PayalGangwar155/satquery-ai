# TASKS.md — SatQuery AI (SIH26167) Task Tracking Board

This document tracks implementation tickets for SatQuery AI.
Rule: Select and complete **exactly one ticket at a time**. Run the designated smoke command before marking a ticket complete.

---

## Ticket 1: Repository Scaffolding & Core Architecture Setup
- **Status**: [COMPLETED]
- **Dependencies**: None
- **Description**: Setup project structure, Python FastAPI backend, Pydantic configuration, Docker Compose with PostgreSQL 16 + PostGIS 3.4 + pgvector, React 18 + TypeScript + Vite + Tailwind CSS frontend shell, and the recorded fixture replay engine.
- **Smoke Command**: `python -m pytest api/tests/test_health.py`

---

## Ticket 2: Natural Language Planner & GeoPlan Validation Engine
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 1
- **Description**: Implement `api/app/core/geoplan.py` Pydantic models for the 10 operations, and `api/app/core/planner.py` to translate NL queries into validated `GeoPlan` DAGs using Gemini/Ollama.
- **Smoke Command**: `python -m pytest api/tests/test_planner.py`

---

## Ticket 3: Primary Operations Registry (Ops 1–5)
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 2
- **Description**: Implement core deterministic satellite operations in `api/app/ops/`:
  1. `resolve_aoi.py` (OSM Nominatim / BBox geocoding)
  2. `search_scenes.py` (CDSE STAC catalog search for Sentinel-2 / Sentinel-1)
  3. `pick_scenes.py` (Deterministic cloud & coverage selection)
  4. `render_bands.py` (True color / False color GeoTIFF & PNG rendering via rio-tiler / rasterio)
  5. `compute_index.py` (NDVI, NDWI, NDBI index raster calculations with numpy)
- **Smoke Command**: `python -m pytest api/tests/test_ops_primary.py`

---

## Ticket 4: Analytical Operations Registry (Ops 6–8)
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 3
- **Description**: Implement analytical operations in `api/app/ops/`:
  6. `zonal_stats.py` (Mean, std, min, max over AOI polygons using rasterio/geopandas)
  7. `time_series.py` (Multi-temporal index aggregations over date ranges)
  8. `change_detect.py` (Delta index raster generation, area changed calculation, before/after compare artifacts)
- **Smoke Command**: `python -m pytest api/tests/test_ops_analytics.py`

---

## Ticket 5: Semantic Search & VLM Verification (Ops 9–10)
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 4
- **Description**: Implement semantic image retrieval and grounded visual description in `api/app/ops/`:
  9. `semantic_search.py` (SigLIP `google/siglip-so400m-patch14-384` text embedding + pgvector retrieval over indexed satellite tiles)
  10. `vlm_describe.py` (Grounded description of rendered satellite imagery)
- **Smoke Command**: `python -m pytest api/tests/test_ops_semantic.py`

---

## Ticket 6: Data Confidence Calculator & Grounded Composer with Numeric Guard
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 5
- **Description**: Implement `api/app/core/confidence.py` (deterministic confidence scoring algorithm) and `api/app/core/numeric_guard.py` (strict numeric grounding validator for LLM response composition).
- **Smoke Command**: `python -m pytest api/tests/test_numeric_guard.py`

---

## Ticket 7: Ground-Station Console UI Development
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 6
- **Description**: Build the ground-station interface using React 18, TypeScript, MapLibre GL JS, TanStack Query, and Zustand:
  - Natural language query bar with prompt suggestions
  - MapLibre GL JS interactive map with GeoJSON vector layers & raster overlays
  - Signature Plan Tape displaying live step execution, timing, parameters, and expandable evidence/provenance
  - Before/After hard-wipe temporal comparison slider for `change_detect`
  - Grounded answer card with confidence breakdown badge & metric citations
- **Smoke Command**: `npx vite build` in `web/`

---

## Ticket 8: End-to-End Integration, Offline Demo Mode & Evaluation Suite
- **Status**: [COMPLETED]
- **Dependencies**: Ticket 7
- **Description**: Wire end-to-end flow from NL query to UI display, complete fixture recordings for offline demo mode, write `api/app/eval/run_eval.py` evaluation harness, and run project no-dummy checks.
- **Smoke Command**: `python -m pytest api/tests/test_e2e.py`
