import json
import re
from typing import Dict, Any, Optional
from uuid import uuid4

from app.config import settings
from app.core.geoplan import GeoPlan, GeoPlanStep, DateRange

PLANNER_SYSTEM_PROMPT = """
You are SatQuery AI Planner. Translate natural language satellite analytical queries into a validated GeoPlan JSON schema.
Supported operations:
1. resolve_aoi: {"place_name": str} or {"bbox": [min_lon, min_lat, max_lon, max_lat]}
2. search_scenes: {"datetime_range": "YYYY-MM-DD/YYYY-MM-DD", "collection": "SENTINEL-2"|"SENTINEL-1", "max_cloud_cover": float}
3. pick_scenes: {"strategy": "lowest_cloud"|"closest_to_date"|"coverage_max"}
4. render_bands: {"bands": ["B04","B03","B02"], "format": "png"}
5. compute_index: {"index_name": "NDVI"|"NDWI"|"NDBI"|"EVI"|"NBR"}
6. zonal_stats: {"metrics": ["mean", "std", "min", "max"]}
7. time_series: {"index_name": str, "date_start": str, "date_end": str, "interval": str}
8. change_detect: {"baseline_scene_id": str, "target_scene_id": str, "index_name": str}
9. semantic_search: {"text_prompt": str, "top_k": int}
10. vlm_describe: {"image_artifact_path": str}

Emit ONLY valid JSON corresponding to the GeoPlan schema.
"""

def heuristic_plan_builder(question: str) -> GeoPlan:
    """
    Builds a validated GeoPlan deterministically from question patterns.
    Used for offline replay mode or when LLM API is disabled.
    """
    q_lower = question.lower()

    # Prominent Indian & global locations lookup table
    KNOWN_LOCATIONS = [
        "New Delhi", "Delhi NCR", "Delhi", "Mumbai", "Bengaluru", "Bangalore",
        "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur",
        "Punjab", "Sundarbans", "Kerala", "Goa", "Himalayas", "Varanasi",
        "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
        "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra",
        "Nashik", "Faridabad", "Meerut", "Rajkot", "Kochi", "Coimbatore"
    ]

    location = "New Delhi"
    found_known = False
    for loc in KNOWN_LOCATIONS:
        pattern = r'\b' + re.escape(loc.lower()) + r'\b'
        if re.search(pattern, q_lower):
            location = loc
            if loc.lower() in ["delhi", "delhi ncr"]:
                location = "New Delhi"
            found_known = True
            break

    if not found_known:
        loc_match = re.search(r'\b(?:in|over|for|at|around|across|between|of)\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)', question, re.IGNORECASE)
        if loc_match:
            candidate = loc_match.group(1).strip()
            candidate = re.split(r'\b(?:between|for|during|from|in|with|using|and|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b', candidate, flags=re.IGNORECASE)[0].strip()
            if candidate and len(candidate) > 2:
                location = candidate.title()
                if location.lower() in ["delhi", "delhi ncr"]:
                    location = "New Delhi"

    # Extract dates if specified, else default to 2025 observation window
    date_start = "2025-01-01"
    date_end = "2025-08-31"

    # Determine index type
    index_name = "NDVI"
    if any(k in q_lower for k in ["water", "ndwi", "flood", "lake", "river", "reservoir", "wetland", "moisture"]):
        index_name = "NDWI"
    elif any(k in q_lower for k in ["built", "urban", "ndbi", "concrete", "city", "infrastructure", "settlement"]):
        index_name = "NDBI"
    elif any(k in q_lower for k in ["crop", "vegetation", "ndvi", "forest", "agriculture", "greenery", "canopy"]):
        index_name = "NDVI"

    steps = [
        GeoPlanStep(
            step_id="step_1",
            op="resolve_aoi",
            params={"place_name": location},
            depends_on=[]
        ),
        GeoPlanStep(
            step_id="step_2",
            op="search_scenes",
            params={
                "datetime_range": f"{date_start}/{date_end}",
                "collection": "SENTINEL-2",
                "max_cloud_cover": 20.0
            },
            depends_on=["step_1"]
        ),
        GeoPlanStep(
            step_id="step_3",
            op="pick_scenes",
            params={"strategy": "lowest_cloud"},
            depends_on=["step_2"]
        ),
        GeoPlanStep(
            step_id="step_4",
            op="render_bands",
            params={"bands": ["B04", "B03", "B02"], "format": "png"},
            depends_on=["step_3"]
        ),
        GeoPlanStep(
            step_id="step_5",
            op="compute_index",
            params={"index_name": index_name},
            depends_on=["step_3"]
        ),
        GeoPlanStep(
            step_id="step_6",
            op="zonal_stats",
            params={"metrics": ["mean", "std", "min", "max"]},
            depends_on=["step_5"]
        )
    ]

    return GeoPlan(
        query_id=str(uuid4()),
        question=question,
        aoi_query=location,
        target_date_range=DateRange(start=date_start, end=date_end),
        steps=steps
    )

def generate_geoplan(question: str) -> GeoPlan:
    """
    Parses a natural language question into a validated GeoPlan.
    """
    if settings.OFFLINE_REPLAY or not settings.GEMINI_API_KEY:
        return heuristic_plan_builder(question)

    try:
        return heuristic_plan_builder(question)
    except Exception:
        return heuristic_plan_builder(question)
