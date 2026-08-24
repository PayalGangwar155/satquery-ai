import json
import hashlib
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.config import settings, FIXTURES_DIR
from app.core.geoplan import Provenance
from app.ops.search_scenes import SceneItem, FixtureNotFoundError

class SceneSelectionError(ValueError):
    """Raised when scene selection logic fails due to empty input candidate scenes."""
    pass

class PickScenesInput(BaseModel):
    scenes: List[Dict[str, Any]]
    strategy: str = "lowest_cloud" # "lowest_cloud" | "closest_to_date"

class PickScenesOutput(BaseModel):
    selected_scene: SceneItem
    cloud_fraction: float
    strategy_used: str
    provenance: Provenance

def pick_scenes_op(params: Dict[str, Any]) -> PickScenesOutput:
    inp = PickScenesInput(**params)
    param_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
    fixture_dir = FIXTURES_DIR / "pick_scenes"
    fixture_dir.mkdir(parents=True, exist_ok=True)
    fixture_path = fixture_dir / f"{param_hash}.json"

    # OFFLINE REPLAY MODE: Load recorded real response fixture if present
    if settings.OFFLINE_REPLAY and fixture_path.exists():
        with open(fixture_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            out = PickScenesOutput(**data)
            out.provenance.source_name += " (OFFLINE REPLAY FIXTURE)"
            return out

    if not inp.scenes:
        raise SceneSelectionError("No candidate satellite scenes provided for scene selection.")

    parsed_scenes = [SceneItem(**s) for s in inp.scenes]

    if inp.strategy == "lowest_cloud":
        selected = min(parsed_scenes, key=lambda s: s.cloud_cover)
    else:
        selected = parsed_scenes[0]

    prov = Provenance(
        source_name="SatQuery Deterministic Scene Selection Engine",
        source_url="internal://pick_scenes",
        retrieved_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        request_params=params,
        scene_id=selected.scene_id,
        acquisition_date=selected.acquisition_date
    )

    out = PickScenesOutput(
        selected_scene=selected,
        cloud_fraction=round(selected.cloud_cover / 100.0, 4),
        strategy_used=inp.strategy,
        provenance=prov
    )

    # Save recorded fixture for replay
    with open(fixture_path, "w", encoding="utf-8") as f:
        json.dump(out.model_dump(), f, indent=2)

    return out
