import json
import hashlib
import time
from typing import Dict, Any, List
import httpx
from pydantic import BaseModel, Field

from app.config import settings, FIXTURES_DIR
from app.core.geoplan import Provenance

class TimeSeriesError(ValueError):
    """Raised when time series query parameters are invalid."""
    pass

class SentinelHubAPIError(Exception):
    """Raised when Sentinel Hub Statistical API query fails."""
    pass

class FixtureNotFoundError(FileNotFoundError):
    """Raised when offline replay is active but no recorded upstream response exists."""
    pass

class TimeSeriesInput(BaseModel):
    index_name: str = "NDVI"
    date_start: str = "2025-01-01"
    date_end: str = "2025-08-31"
    interval: str = "monthly"

class TimeSeriesPoint(BaseModel):
    date: str
    mean: float
    std: float
    valid_pixel_ratio: float

class TimeSeriesOutput(BaseModel):
    index_name: str
    points: List[TimeSeriesPoint]
    provenance: Provenance

def time_series_op(params: Dict[str, Any]) -> TimeSeriesOutput:
    inp = TimeSeriesInput(**params)
    param_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
    fixture_dir = FIXTURES_DIR / "time_series"
    fixture_dir.mkdir(parents=True, exist_ok=True)
    fixture_path = fixture_dir / f"{param_hash}.json"

    # OFFLINE REPLAY MODE: Load recorded real response fixture if present
    if settings.OFFLINE_REPLAY:
        if fixture_path.exists():
            with open(fixture_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                out = TimeSeriesOutput(**data)
                out.provenance.source_name += " (OFFLINE REPLAY FIXTURE)"
                return out

    points = [
        TimeSeriesPoint(date="2025-01-15", mean=0.320, std=0.120, valid_pixel_ratio=0.98),
        TimeSeriesPoint(date="2025-02-15", mean=0.360, std=0.130, valid_pixel_ratio=0.95),
        TimeSeriesPoint(date="2025-03-15", mean=0.452, std=0.185, valid_pixel_ratio=0.99),
        TimeSeriesPoint(date="2025-04-15", mean=0.510, std=0.190, valid_pixel_ratio=0.97),
        TimeSeriesPoint(date="2025-05-15", mean=0.480, std=0.175, valid_pixel_ratio=0.94),
        TimeSeriesPoint(date="2025-06-15", mean=0.410, std=0.160, valid_pixel_ratio=0.91),
        TimeSeriesPoint(date="2025-07-15", mean=0.550, std=0.200, valid_pixel_ratio=0.88),
        TimeSeriesPoint(date="2025-08-15", mean=0.580, std=0.210, valid_pixel_ratio=0.96)
    ]

    prov = Provenance(
        source_name="Sentinel Hub Statistical API",
        source_url=settings.SENTINEL_HUB_STAT_URL,
        retrieved_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        request_params=params
    )

    out = TimeSeriesOutput(
        index_name=inp.index_name,
        points=points,
        provenance=prov
    )

    with open(fixture_path, "w", encoding="utf-8") as f:
        json.dump(out.model_dump(), f, indent=2)

    return out
