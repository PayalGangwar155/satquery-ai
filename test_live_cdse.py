import sys
from pathlib import Path
import httpx

sys.path.insert(0, str(Path(__file__).parent / "api"))

from app.config import settings
from app.ops.resolve_aoi import resolve_aoi_op

def test_live_cdse_catalog():
    settings.OFFLINE_REPLAY = False
    
    # 1. Resolve AOI for Delhi
    aoi_res = resolve_aoi_op({"place_name": "Delhi"})
    print(f"[1] Resolved AOI: {aoi_res.resolved_name}")
    print(f"    BBox: {aoi_res.bbox}")
    print(f"    Centroid: {aoi_res.centroid}")

    # 2. Live query Copernicus Data Space Ecosystem (CDSE) OData/STAC Catalogue API
    min_lon, min_lat, max_lon, max_lat = aoi_res.bbox
    
    # WKT Polygon for spatial intersection filter
    wkt_polygon = f"POLYGON(({min_lon} {min_lat}, {max_lon} {min_lat}, {max_lon} {max_lat}, {min_lon} {max_lat}, {min_lon} {min_lat}))"
    
    odata_url = "https://catalogue.dataspace.copernicus.eu/odata/v1/Products"
    filter_expr = (
        f"Collection/Name eq 'SENTINEL-2' and "
        f"OData.CSC.Intersects(area=geography'SRID=4326;{wkt_polygon}') and "
        f"ContentDate/Start ge 2025-07-01T00:00:00.000Z and "
        f"ContentDate/Start le 2025-08-24T23:59:59.000Z"
    )
    
    params = {
        "$filter": filter_expr,
        "$top": "10",
        "$orderby": "ContentDate/Start desc"
    }

    print("\n[2] Connecting to Live Copernicus Data Space Ecosystem API...")
    print(f"    URL: {odata_url}")
    print(f"    Filter: {filter_expr}")
    
    resp = httpx.get(odata_url, params=params, verify=False, timeout=20.0)
    print(f"\n[3] Upstream HTTP Response Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        items = data.get("value", [])
        print(f"    Total Sentinel-2 scenes returned: {len(items)}\n")
        
        scenes = []
        for i, item in enumerate(items, 1):
            scene_id = item.get("Name", item.get("Id"))
            start_date = item.get("ContentDate", {}).get("Start")
            prod_id = item.get("Id")
            
            # Extract cloud cover attribute if present
            attributes = item.get("Attributes", [])
            cloud_cover = 0.0
            for attr in attributes:
                if attr.get("Name") == "cloudCover":
                    cloud_cover = attr.get("Value", 0.0)
            
            scene_info = {
                "scene_id": scene_id,
                "acquisition_date": start_date,
                "cloud_cover": round(cloud_cover, 2),
                "product_id": prod_id,
                "download_url": f"https://zipper.dataspace.copernicus.eu/odata/v1/Products({prod_id})/$value"
            }
            scenes.append(scene_info)
            print(f"   Scene #{i}:")
            print(f"    - Scene ID: {scene_id}")
            print(f"    - Acquisition Date: {start_date}")
            print(f"    - Product UUID: {prod_id}")
            print(f"    - Cloud Cover: {cloud_cover}%")
            print(f"    - Download URL: {scene_info['download_url']}\n")
            
        return {"status": "success", "scenes": scenes}
    else:
        print(f"    API Error Details: {resp.text}")
        return {"status": "error", "error": resp.text}

if __name__ == "__main__":
    test_live_cdse_catalog()
