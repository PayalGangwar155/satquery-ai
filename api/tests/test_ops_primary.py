import pytest
from app.ops.resolve_aoi import resolve_aoi_op
from app.ops.search_scenes import (
    search_scenes_op,
    SceneNotFoundError,
    CopernicusAPIError,
    FixtureNotFoundError
)
from app.ops.pick_scenes import pick_scenes_op
from app.ops.render_bands import render_bands_op
from app.ops.compute_index import compute_index_op

def test_resolve_aoi_op():
    res = resolve_aoi_op({"place_name": "New Delhi"})
    assert res.resolved_name == "New Delhi"
    assert len(res.bbox) == 4
    assert res.geojson["type"] == "Feature"
    assert "OSM Nominatim" in res.provenance.source_name

def test_search_scenes_recorded_fixture():
    aoi_res = resolve_aoi_op({"place_name": "New Delhi"})
    search_res = search_scenes_op({
        "geojson_aoi": aoi_res.geojson,
        "datetime_range": "2025-01-01/2025-08-31",
        "collection": "SENTINEL-2",
        "max_cloud_cover": 20.0
    })
    assert search_res.total_found > 0
    assert len(search_res.scenes) > 0
    assert search_res.scenes[0].scene_id.startswith("S2")
    assert "OFFLINE REPLAY" in search_res.provenance.source_name

def test_search_scenes_missing_fixture_raises_typed_error():
    with pytest.raises(FixtureNotFoundError):
        search_scenes_op({
            "geojson_aoi": {"type": "Feature", "geometry": {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}},
            "datetime_range": "1990-01-01/1990-01-02",
            "collection": "UNKNOWN_COLLECTION",
            "max_cloud_cover": 0.0
        })

def test_pick_scenes_op():
    aoi_res = resolve_aoi_op({"place_name": "New Delhi"})
    search_res = search_scenes_op({
        "geojson_aoi": aoi_res.geojson,
        "datetime_range": "2025-01-01/2025-08-31",
        "collection": "SENTINEL-2",
        "max_cloud_cover": 20.0
    })
    scenes_dict = [s.model_dump() for s in search_res.scenes]
    pick_res = pick_scenes_op({"scenes": scenes_dict, "strategy": "lowest_cloud"})
    assert pick_res.selected_scene.cloud_cover <= 15.0

def test_render_bands_op():
    res = render_bands_op({"scene_id": "S2B_TEST_SCENE", "bands": ["B04", "B03", "B02"]})
    assert res.format == "png"
    assert res.image_width == 256
    assert "render_" in res.artifact_path

def test_compute_index_op():
    res = compute_index_op({"scene_id": "S2B_TEST_SCENE", "index_name": "NDVI"})
    assert res.index_name == "NDVI"
    assert res.statistics.mean == 0.452
    assert "index_NDVI_" in res.artifact_path
