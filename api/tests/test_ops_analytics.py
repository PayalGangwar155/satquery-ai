import pytest
from app.ops.zonal_stats import zonal_stats_op
from app.ops.time_series import time_series_op
from app.ops.change_detect import change_detect_op

def test_zonal_stats_op():
    res = zonal_stats_op({"metrics": ["mean", "std", "min", "max"]})
    assert res.metrics["mean"] == 0.452
    assert res.total_area_sq_km == 125.0
    assert res.pixel_area_m2 == 100.0

def test_time_series_op():
    res = time_series_op({"index_name": "NDVI", "date_start": "2025-01-01", "date_end": "2025-08-31"})
    assert res.index_name == "NDVI"
    assert len(res.points) == 8
    assert res.points[0].date == "2025-01-15"

def test_change_detect_op():
    res = change_detect_op({
        "baseline_scene_id": "S2B_BASE_SCENE",
        "target_scene_id": "S2A_TARGET_SCENE",
        "index_name": "NDVI"
    })
    assert res.change_percentage == 11.6
    assert res.net_area_changed_m2 == 1450000.0
    assert "diff_NDVI_" in res.delta_artifact_path
