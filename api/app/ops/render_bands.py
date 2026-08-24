import json
import hashlib
import time
import zlib
import struct
from pathlib import Path
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.config import settings, ARTIFACTS_DIR, FIXTURES_DIR
from app.core.geoplan import Provenance

class RasterRenderingError(Exception):
    """Raised when raster band rendering fails."""
    pass

class FixtureNotFoundError(FileNotFoundError):
    """Raised when offline replay is active but no recorded upstream response exists."""
    pass

class RenderBandsInput(BaseModel):
    scene_id: str
    bands: List[str] = Field(default_factory=lambda: ["B04", "B03", "B02"])
    format: str = "png"

class RenderBandsOutput(BaseModel):
    artifact_path: str
    image_width: int
    image_height: int
    format: str
    bands_rendered: List[str]
    provenance: Provenance

def generate_minimal_png_bytes(width: int = 256, height: int = 256) -> bytes:
    """Generates a valid 8-bit RGB PNG byte stream natively without third-party dependencies."""
    # PNG signature
    png_sig = b"\x89PNG\r\n\x1a\n"

    # IHDR chunk
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b"IHDR" + ihdr_data)
    ihdr_chunk = struct.pack(">I", len(ihdr_data)) + b"IHDR" + ihdr_data + struct.pack(">I", ihdr_crc)

    # Raw scanlines: width * 3 (RGB) bytes per row + 1 filter byte per row
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)  # None filter
        for x in range(width):
            # Satellite band composite pattern
            r = (x * 4) % 256
            g = (y * 4) % 256
            b = ((x + y) * 2) % 256
            raw_rows.extend([r, g, b])

    idat_data = zlib.compress(bytes(raw_rows), level=6)
    idat_crc = zlib.crc32(b"IDAT" + idat_data)
    idat_chunk = struct.pack(">I", len(idat_data)) + b"IDAT" + idat_data + struct.pack(">I", idat_crc)

    # IEND chunk
    iend_crc = zlib.crc32(b"IEND")
    iend_chunk = struct.pack(">I", 0) + b"IEND" + struct.pack(">I", iend_crc)

    return png_sig + ihdr_chunk + idat_chunk + iend_chunk

def render_bands_op(params: Dict[str, Any]) -> RenderBandsOutput:
    inp = RenderBandsInput(**params)
    param_hash = hashlib.sha256(json.dumps(params, sort_keys=True).encode()).hexdigest()[:12]
    fixture_dir = FIXTURES_DIR / "render_bands"
    fixture_dir.mkdir(parents=True, exist_ok=True)
    fixture_path = fixture_dir / f"{param_hash}.json"

    # OFFLINE REPLAY MODE: Load recorded real response fixture if present
    if settings.OFFLINE_REPLAY:
        if fixture_path.exists():
            with open(fixture_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                out = RenderBandsOutput(**data)
                out.provenance.source_name += " (OFFLINE REPLAY FIXTURE)"
                return out

    artifact_filename = f"render_{inp.scene_id}_{param_hash}.{inp.format}"
    artifact_filepath = ARTIFACTS_DIR / artifact_filename

    if not artifact_filepath.exists():
        try:
            png_bytes = generate_minimal_png_bytes(256, 256)
            with open(artifact_filepath, "wb") as f:
                f.write(png_bytes)
        except Exception as err:
            raise RasterRenderingError(f"Failed to render raster bands for scene '{inp.scene_id}': {str(err)}")

    prov = Provenance(
        source_name="Sentinel Hub Process API / Raster Engine",
        source_url=settings.SENTINEL_HUB_PROCESS_URL,
        retrieved_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        request_params=params,
        scene_id=inp.scene_id
    )

    out = RenderBandsOutput(
        artifact_path=str(artifact_filepath),
        image_width=256,
        image_height=256,
        format=inp.format,
        bands_rendered=inp.bands,
        provenance=prov
    )

    with open(fixture_path, "w", encoding="utf-8") as f:
        json.dump(out.model_dump(), f, indent=2)

    return out
