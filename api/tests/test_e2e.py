from fastapi.testclient import TestClient
from app.main import app
from app.core.numeric_guard import validate_response_numerics

client = TestClient(app)

def test_end_to_end_query_execution():
    payload = {
        "question": "Analyze NDVI vegetation index over New Delhi between Jan 2025 and Aug 2025"
    }
    response = client.post("/api/query", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "completed"
    assert data["question"] == payload["question"]
    assert len(data["step_results"]) == 6

    # Verify every step completed
    for step in data["step_results"]:
        assert step["status"] == "completed"
        assert step["duration_ms"] >= 0.0

    # Verify confidence calculation
    conf = data["confidence"]
    assert 0.0 <= conf["overall_confidence"] <= 1.0
    assert "components" in conf
    assert conf["components"]["cloud_score"] > 0.0

    # Verify Strict Numeric Grounding (0% hallucinated numbers)
    grounded_answer = data["grounded_answer"]
    evidence = data["evidence"]
    is_valid, violations = validate_response_numerics(grounded_answer, evidence)
    assert is_valid is True, f"Numeric grounding violations found in E2E query: {violations}"

def test_empty_query_rejection():
    response = client.post("/api/query", json={"question": "   "})
    assert response.status_code == 400
