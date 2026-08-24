import os
import json
import hashlib
import time
from typing import Dict, Any, Optional, List
import httpx
from pydantic import BaseModel, Field

from app.config import settings, FIXTURES_DIR, ARTIFACTS_DIR
from app.core.geoplan import Provenance

class GeocodingError(ValueError):
    """Raised when OSM Nominatim cannot resolve a location."""
    pass

class FixtureNotFoundError(FileNotFoundError):
    """Raised when offline replay is active but no recorded upstream response exists."""
    pass

class ResolveAOIInput(BaseModel):
    place_name: Optional[str] = None
    bbox: Optional[List[float]] = Field(None, description="[min_lon, min_lat, max_lon, max_lat]")

class ResolveAOIOutput(BaseModel):
    resolved_name: str
    geojson: Dict[str, Any]
    bbox: List[float]
    centroid: List[float]
    geojson_artifact_path: str
    provenance: Provenance

def resolve_aoi_op(params: Dict[str, Any]) -> ResolveAOIOutput:
    inp = ResolveAOIInput(**params)
    param_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
    fixture_dir = FIXTURES_DIR / "resolve_aoi"
    fixture_dir.mkdir(parents=True, exist_ok=True)
    fixture_path = fixture_dir / f"{param_hash}.json"

    # OFFLINE REPLAY MODE: Load recorded real response fixture
    if settings.OFFLINE_REPLAY:
        if fixture_path.exists():
            with open(fixture_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                out = ResolveAOIOutput(**data)
                out.provenance.source_name += " (OFFLINE REPLAY FIXTURE)"
                return out
        else:
            raise FixtureNotFoundError(
                f"Offline replay mode active, but no recorded fixture found for resolve_aoi hash '{param_hash}'."
            )

    # LIVE GEOCODING MODE
    if inp.bbox:
        min_lon, min_lat, max_lon, max_lat = inp.bbox
        geometry = {
            "type": "Polygon",
            "coordinates": [[
                [min_lon, min_lat],
                [max_lon, min_lat],
                [max_lon, max_lat],
                [min_lon, max_lat],
                [min_lon, min_lat]
            ]]
        }
        resolved_name = inp.place_name or f"BBox [{min_lon}, {min_lat}, {max_lon}, {max_lat}]"
        src_url = "custom_bbox"
    elif inp.place_name:
        resolved_name = inp.place_name
        headers = {"User-Agent": settings.NOMINATIM_USER_AGENT}
        url = f"https://nominatim.openstreetmap.org/search?q={inp.place_name}&format=geojson&polygon_geojson=1&limit=1"
        src_url = url

        try:
            resp = httpx.get(url, headers=headers, timeout=10.0, verify=False)
            if resp.status_code != 200:
                raise GeocodingError(f"Nominatim API query failed with status {resp.status_code}.")
            data = resp.json()
        except httpx.HTTPError as err:
            raise GeocodingError(f"Failed to connect to OSM Nominatim API: {str(err)}")

        if not data.get("features"):
            raise GeocodingError(f"Location '{inp.place_name}' could not be resolved by Nominatim.")

        feature = data["features"][0]
        geometry = feature["geometry"]
        bbox_raw = feature.get("bbox")
        if bbox_raw and len(bbox_raw) >= 4:
            min_lon, min_lat, max_lon, max_lat = bbox_raw[0], bbox_raw[1], bbox_raw[2], bbox_raw[3]
        else:
            flat_coords = [pt for ring in geometry.get("coordinates", []) for pt in (ring if isinstance(ring[0], list) else [ring])]
            lons = [p[0] for p in flat_coords if len(p) >= 2]
            lats = [p[1] for p in flat_coords if len(p) >= 2]
            min_lon, min_lat, max_lon, max_lat = min(lons), min(lats), max(lons), max(lats)
    else:
        raise GeocodingError("Either 'place_name' or 'bbox' must be provided to resolve_aoi.")

    centroid = [(min_lon + max_lon) / 2.0, (min_lat + max_lat) / 2.0]
    geojson_feat = {
        "type": "Feature",
        "properties": {"name": resolved_name},
        "geometry": geometry
    }

    art_file = ARTIFACTS_DIR / f"aoi_{param_hash}.geojson"
    with open(art_file, "w", encoding="utf-8") as f:
        json.dump(geojson_feat, f, indent=2)

    prov = Provenance(
        source_name="OSM Nominatim",
        source_url=src_url,
        retrieved_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        request_params=params
    )

    out = ResolveAOIOutput(
        resolved_name=resolved_name,
        geojson=geojson_feat,
        bbox=[min_lon, min_lat, max_lon, max_lat],
        centroid=centroid,
        geojson_artifact_path=str(art_file),
        provenance=prov
    )

    # Save recorded fixture
    with open(fixture_path, "w", encoding="utf-8") as f:
        json.dump(out.model_dump(), f, indent=2)

    return out
