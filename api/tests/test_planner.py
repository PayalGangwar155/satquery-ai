import pytest
from app.core.planner import generate_geoplan, heuristic_plan_builder
from app.core.geoplan import GeoPlan

def test_heuristic_plan_generation():
    question = "Analyze vegetation index over New Delhi between Jan 2025 and Aug 2025"
    plan = generate_geoplan(question)
    
    assert isinstance(plan, GeoPlan)
    assert plan.question == question
    assert plan.aoi_query == "New Delhi"
    assert len(plan.steps) == 6
    assert plan.steps[0].op == "resolve_aoi"
    assert plan.steps[1].op == "search_scenes"
    assert plan.steps[2].op == "pick_scenes"
    assert plan.steps[3].op == "render_bands"
    assert plan.steps[4].op == "compute_index"
    assert plan.steps[5].op == "zonal_stats"

def test_water_index_selection():
    question = "Detect flood water levels in Mumbai"
    plan = generate_geoplan(question)
    
    assert plan.steps[4].params["index_name"] == "NDWI"

def test_urban_index_selection():
    question = "Map urban built up growth around Bengaluru"
    plan = generate_geoplan(question)
    
    assert plan.steps[4].params["index_name"] == "NDBI"
