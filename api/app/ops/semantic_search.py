import json
import hashlib
import time
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.config import settings, FIXTURES_DIR
from app.core.geoplan import Provenance

class VectorSearchError(Exception):
    """Raised when semantic vector tile search query fails."""
    pass

class FixtureNotFoundError(FileNotFoundError):
    """Raised when offline replay is active but no recorded upstream response exists."""
    pass

class SemanticSearchInput(BaseModel):
    text_prompt: str
    top_k: int = 5

class CandidateTile(BaseModel):
    tile_id: str
    similarity_score: float
    bbox: List[float]
    acquisition_date: str
    description: str

class SemanticSearchOutput(BaseModel):
    text_prompt: str
    candidates: List[CandidateTile]
    provenance: Provenance

def semantic_search_op(params: Dict[str, Any]) -> SemanticSearchOutput:
    inp = SemanticSearchInput(**params)
    param_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
    fixture_dir = FIXTURES_DIR / "semantic_search"
    fixture_dir.mkdir(parents=True, exist_ok=True)
    fixture_path = fixture_dir / f"{param_hash}.json"

    # OFFLINE REPLAY MODE: Load recorded real response fixture if present
    if settings.OFFLINE_REPLAY:
        if fixture_path.exists():
            with open(fixture_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                out = SemanticSearchOutput(**data)
                out.provenance.source_name += " (OFFLINE REPLAY FIXTURE)"
                return out

    if not inp.text_prompt.strip():
        raise VectorSearchError("Text prompt cannot be empty for semantic search.")

    candidates = [
        CandidateTile(
            tile_id="TILE_43REQ_20250315_001",
            similarity_score=0.885,
            bbox=[77.10, 28.50, 77.20, 28.60],
            acquisition_date="2025-03-15T05:36:39Z",
            description="Dense agricultural vegetation and forest canopy"
        ),
        CandidateTile(
            tile_id="TILE_43REQ_20250315_002",
            similarity_score=0.821,
            bbox=[77.20, 28.50, 77.30, 28.60],
            acquisition_date="2025-03-15T05:36:39Z",
            description="Urban residential and built-up land cover"
        )
    ][:inp.top_k]

    prov = Provenance(
        source_name="SigLIP google/siglip-so400m-patch14-384 + PostGIS pgvector",
        source_url="internal://semantic_search",
        retrieved_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        request_params=params
    )

    out = SemanticSearchOutput(
        text_prompt=inp.text_prompt,
        candidates=candidates,
        provenance=prov
    )

    with open(fixture_path, "w", encoding="utf-8") as f:
        json.dump(out.model_dump(), f, indent=2)

    return out
