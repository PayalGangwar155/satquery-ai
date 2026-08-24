import pytest
from app.ops.semantic_search import semantic_search_op
from app.ops.vlm_describe import vlm_describe_op

def test_semantic_search_op():
    res = semantic_search_op({"text_prompt": "dense forest canopy", "top_k": 2})
    assert res.text_prompt == "dense forest canopy"
    assert len(res.candidates) == 2
    assert res.candidates[0].similarity_score == 0.885

def test_vlm_describe_op():
    res = vlm_describe_op({
        "image_artifact_path": "artifacts/render_sample.png",
        "aoi_name": "New Delhi"
    })
    assert "New Delhi" in res.visual_description
    assert "Sentinel-2" in res.visual_description
