from typing import Dict, Any, Optional
from pydantic import BaseModel

class ConfidenceComponents(BaseModel):
    cloud_score: float  # 0 to 1 (1 = 0% cloud cover)
    resolution_score: float  # 0 to 1 (1 = 10m or finer)
    temporal_score: float  # 0 to 1 (1 = exact target date match)
    coverage_score: float  # 0 to 1 (1 = 100% AOI spatial coverage)

class ConfidenceBreakdown(BaseModel):
    overall_confidence: float  # 0 to 1
    components: ConfidenceComponents
    weights: Dict[str, float]
    explanation: str

def calculate_confidence(
    cloud_fraction: float = 0.0,
    spatial_resolution_m: float = 10.0,
    days_from_target: int = 0,
    aoi_coverage_fraction: float = 1.0,
    weights: Optional[Dict[str, float]] = None
) -> ConfidenceBreakdown:
    """
    Calculates deterministic data confidence for remote sensing analyses.
    NEVER uses synthetic data or LLM estimation.
    """
    if weights is None:
        weights = {
            "cloud": 0.35,
            "resolution": 0.25,
            "temporal": 0.20,
            "coverage": 0.20
        }

    # Cloud score: 0% cloud -> 1.0, 100% cloud -> 0.0
    c_score = max(0.0, min(1.0, 1.0 - cloud_fraction))

    # Resolution score: 10m or finer -> 1.0, 60m -> 0.4, >100m -> 0.1
    if spatial_resolution_m <= 10.0:
        r_score = 1.0
    elif spatial_resolution_m <= 20.0:
        r_score = 0.85
    elif spatial_resolution_m <= 60.0:
        r_score = 0.5
    else:
        r_score = max(0.1, 1.0 - (spatial_resolution_m / 200.0))

    # Temporal score: 0 days off -> 1.0, 30 days off -> 0.5, >60 days off -> 0.1
    t_score = max(0.1, max(0.0, 1.0 - (abs(days_from_target) / 60.0)))

    # Coverage score: 100% -> 1.0
    cov_score = max(0.0, min(1.0, aoi_coverage_fraction))

    overall = (
        weights["cloud"] * c_score +
        weights["resolution"] * r_score +
        weights["temporal"] * t_score +
        weights["coverage"] * cov_score
    )
    overall = round(max(0.0, min(1.0, overall)), 3)

    components = ConfidenceComponents(
        cloud_score=round(c_score, 3),
        resolution_score=round(r_score, 3),
        temporal_score=round(t_score, 3),
        coverage_score=round(cov_score, 3)
    )

    explanation = (
        f"Data confidence: {int(overall * 100)}%. "
        f"Components: Cloud Quality ({int(c_score * 100)}%), "
        f"Spatial Res ({spatial_resolution_m}m = {int(r_score * 100)}%), "
        f"Temporal Gap ({days_from_target}d = {int(t_score * 100)}%), "
        f"AOI Coverage ({int(cov_score * 100)}%)."
    )

    return ConfidenceBreakdown(
        overall_confidence=overall,
        components=components,
        weights=weights,
        explanation=explanation
    )
