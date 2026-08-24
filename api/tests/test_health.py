from fastapi.testclient import TestClient
from app.main import app
from app.core.geoplan import GeoPlan, GeoPlanStep
from app.core.confidence import calculate_confidence
from app.core.numeric_guard import validate_response_numerics

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "offline_replay" in data
    assert "version" in data

def test_geoplan_validation_success():
    payload = {
        "question": "What is the vegetation index of New Delhi?",
        "aoi_query": "New Delhi",
        "steps": [
            {
                "step_id": "step_1",
                "op": "resolve_aoi",
                "params": {"place_name": "New Delhi"},
                "depends_on": []
            }
        ]
    }
    response = client.post("/api/plan/validate", json=payload)
    assert response.status_code == 200
    plan_data = response.json()
    assert plan_data["question"] == "What is the vegetation index of New Delhi?"

def test_geoplan_validation_unknown_op():
    payload = {
        "question": "Execute unknown function",
        "steps": [
            {
                "step_id": "step_1",
                "op": "invalid_operation_name",
                "params": {}
            }
        ]
    }
    response = client.post("/api/plan/validate", json=payload)
    assert response.status_code == 422  # Unprocessable Entity (Pydantic validation error)

def test_deterministic_confidence_calculator():
    res = calculate_confidence(cloud_fraction=0.05, spatial_resolution_m=10.0, days_from_target=2)
    assert 0.0 <= res.overall_confidence <= 1.0
    assert res.components.cloud_score == 0.95
    assert res.components.resolution_score == 1.0

def test_numeric_guard_passes_supported_numerics():
    evidence = {
        "ndvi_mean": 0.45,
        "area_sq_km": 12.5,
        "date": "2026-08-23"
    }
    response_text = "The mean NDVI for the region on 2026-08-23 was 0.45 over 12.5 sq km."
    is_valid, violations = validate_response_numerics(response_text, evidence)
    assert is_valid is True
    assert len(violations) == 0

def test_numeric_guard_catches_hallucinations():
    evidence = {
        "ndvi_mean": 0.45,
        "area_sq_km": 12.5
    }
    response_text = "The mean NDVI was 0.89 over 99.9 sq km."
    is_valid, violations = validate_response_numerics(response_text, evidence)
    assert is_valid is False
    assert "0.89" in violations
    assert "99.9" in violations
