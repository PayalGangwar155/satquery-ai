from typing import List, Dict, Any, Optional, Literal
from uuid import uuid4
from pydantic import BaseModel, Field, ConfigDict

OperationType = Literal[
    "resolve_aoi",
    "search_scenes",
    "pick_scenes",
    "render_bands",
    "compute_index",
    "zonal_stats",
    "time_series",
    "change_detect",
    "semantic_search",
    "vlm_describe"
]

class DateRange(BaseModel):
    start: str = Field(..., description="Start date in YYYY-MM-DD format")
    end: str = Field(..., description="End date in YYYY-MM-DD format")

class GeoPlanStep(BaseModel):
    step_id: str = Field(..., description="Unique step identifier, e.g., step_1")
    op: OperationType = Field(..., description="Registered operation name")
    params: Dict[str, Any] = Field(default_factory=dict, description="Validated operation input arguments")
    depends_on: List[str] = Field(default_factory=list, description="Step IDs this step depends on")

    model_config = ConfigDict(extra="forbid")

class GeoPlan(BaseModel):
    query_id: str = Field(default_factory=lambda: str(uuid4()))
    question: str = Field(..., description="Original user natural language question")
    aoi_query: Optional[str] = Field(None, description="Location place name or AOI query text")
    target_date_range: Optional[DateRange] = None
    baseline_date_range: Optional[DateRange] = None
    steps: List[GeoPlanStep] = Field(..., min_length=1)

    model_config = ConfigDict(extra="forbid")

class Provenance(BaseModel):
    source_name: str
    source_url: str
    retrieved_at: str
    request_params: Dict[str, Any]
    scene_id: Optional[str] = None
    acquisition_date: Optional[str] = None

class OperationResult(BaseModel):
    step_id: str
    op: OperationType
    status: Literal["completed", "failed"]
    duration_ms: float
    output: Dict[str, Any]
    provenance: Optional[Provenance] = None
    error_message: Optional[str] = None
