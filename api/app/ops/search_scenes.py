import json
import hashlib
import time
from typing import Dict, Any, List, Optional
import httpx
from pydantic import BaseModel, Field

from app.config import settings, FIXTURES_DIR
from app.core.geoplan import Provenance

class SceneNotFoundError(ValueError):
    """Raised when no scenes match the requested spatio-temporal parameters."""
    pass

class CopernicusAPIError(Exception):
    """Raised when the Copernicus Data Space Ecosystem STAC/OData endpoint fails."""
    pass

class FixtureNotFoundError(FileNotFoundError):
    """Raised when offline replay is active but no recorded upstream response exists."""
    pass

class SearchScenesInput(BaseModel):
    geojson_aoi: Dict[str, Any]
    datetime_range: str = Field(..., description="YYYY-MM-DD/YYYY-MM-DD or ISO-8601 range")
    collection: str = "SENTINEL-2"
    max_cloud_cover: float = 30.0

class SceneItem(BaseModel):
    scene_id: str
    acquisition_date: str
    cloud_cover: float  # Percentage (0-100), e.g., 4.2
    bbox: List[float]
    stac_url: str
    collection: str

class SearchScenesOutput(BaseModel):
    total_found: int
    scenes: List[SceneItem]
    provenance: Provenance

def search_scenes_op(params: Dict[str, Any]) -> SearchScenesOutput:
    inp = SearchScenesInput(**params)

    param_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
    fixture_dir = FIXTURES_DIR / "search_scenes"
    fixture_dir.mkdir(parents=True, exist_ok=True)
    fixture_path = fixture_dir / f"{param_hash}.json"

    # 1. OFFLINE REPLAY MODE: Strictly load recorded real STAC response fixtures
    if settings.OFFLINE_REPLAY:
        if fixture_path.exists():
            with open(fixture_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                out = SearchScenesOutput(**data)
                out.provenance.source_name += " (OFFLINE REPLAY FIXTURE)"
                return out
        else:
            raise FixtureNotFoundError(
                f"Offline replay mode active, but no recorded upstream fixture found for "
                f"search_scenes hash '{param_hash}'. Run live mode once to record upstream response."
            )

    # 2. LIVE MODE: Query Copernicus Data Space Ecosystem (CDSE) Catalogue API
    aoi_geom = inp.geojson_aoi.get("geometry", inp.geojson_aoi)
    coords = aoi_geom.get("coordinates", [])
    if coords and isinstance(coords[0], list):
        flat_coords = [pt for ring in coords for pt in (ring if isinstance(ring[0], list) else [ring])]
        lons = [p[0] for p in flat_coords if len(p) >= 2]
        lats = [p[1] for p in flat_coords if len(p) >= 2]
        bbox = [min(lons), min(lats), max(lons), max(lats)]
    else:
        bbox = [76.83, 28.40, 77.34, 28.88]

    # Format dates
    date_parts = inp.datetime_range.split("/")
    start_dt = date_parts[0] if "T" in date_parts[0] else f"{date_parts[0]}T00:00:00.000Z"
    end_dt = date_parts[1] if (len(date_parts) > 1 and "T" in date_parts[1]) else (f"{date_parts[1]}T23:59:59.000Z" if len(date_parts) > 1 else f"{date_parts[0]}T23:59:59.000Z")

    wkt_polygon = f"POLYGON(({bbox[0]} {bbox[1]}, {bbox[2]} {bbox[1]}, {bbox[2]} {bbox[3]}, {bbox[0]} {bbox[3]}, {bbox[0]} {bbox[1]}))"
    odata_url = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
    filter_expr = (
        f"Collection/Name eq 'SENTINEL-2' and "
        f"OData.CSC.Intersects(area=geography'SRID=4326;{wkt_polygon}') and "
        f"ContentDate/Start ge {start_dt} and "
        f"ContentDate/Start le {end_dt}"
    )

    query_params = {
        "$filter": filter_expr,
        "$top": "10",
        "$orderby": "ContentDate/Start desc"
    }

    try:
        resp = httpx.get(odata_url, params=query_params, verify=False, timeout=20.0)
        if resp.status_code != 200:
            raise CopernicusAPIError(
                f"Copernicus CDSE API query failed with HTTP status {resp.status_code}: {resp.text[:300]}"
            )
        data = resp.json()
    except httpx.HTTPError as err:
        raise CopernicusAPIError(f"Failed to connect to Copernicus CDSE API: {str(err)}")

    items = data.get("value", [])
    scenes: List[SceneItem] = []
    for item in items:
        prod_id = item.get("Id")
        scene_name = item.get("Name", prod_id)
        start_date = item.get("ContentDate", {}).get("Start", "")
        
        # Extract cloud cover attribute if present
        cloud = 0.0
        for attr in item.get("Attributes", []):
            if attr.get("Name") == "cloudCover":
                cloud = float(attr.get("Value", 0.0))

        if cloud <= inp.max_cloud_cover:
            scenes.append(
                SceneItem(
                    scene_id=scene_name,
                    acquisition_date=start_date,
                    cloud_cover=round(cloud, 2),
                    bbox=bbox,
                    stac_url=f"https://zipper.dataspace.copernicus.eu/odata/v1/Products({prod_id})/$value",
                    collection=inp.collection
                )
            )

    if not scenes:
        raise SceneNotFoundError(
            f"No satellite scenes found matching criteria: AOI bbox {bbox}, "
            f"date range '{inp.datetime_range}', max cloud cover <= {inp.max_cloud_cover}%."
        )

    prov = Provenance(
        source_name="Copernicus Data Space Ecosystem STAC/OData API",
        source_url=odata_url,
        retrieved_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        request_params=params
    )

    out = SearchScenesOutput(
        total_found=len(scenes),
        scenes=scenes,
        provenance=prov
    )

    # Record real STAC response fixture for offline replay
    with open(fixture_path, "w", encoding="utf-8") as f:
        json.dump(out.model_dump(), f, indent=2)

    return out
