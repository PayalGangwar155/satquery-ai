from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List

from app.config import settings
from app.core.geoplan import GeoPlan
from app.core.planner import generate_geoplan
from app.core.executor import execute_geoplan, GeoPlanExecutionReport

app = FastAPI(
    title="SatQuery AI API",
    description="Vision-Language Assistant for Remote Sensing & Satellite Data (SIH26167)",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    version: str
    mode: str
    llm_provider: str
    offline_replay: bool

class QueryRequest(BaseModel):
    question: str

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        version="0.1.0",
        mode="offline_replay" if settings.OFFLINE_REPLAY else "live",
        llm_provider=settings.LLM_PROVIDER,
        offline_replay=settings.OFFLINE_REPLAY
    )

@app.post("/api/plan/validate", response_model=GeoPlan)
async def validate_geoplan(plan: GeoPlan):
    return plan

@app.post("/api/query", response_model=GeoPlanExecutionReport)
async def execute_query(req: QueryRequest):
    """
    End-to-end natural language satellite analysis pipeline:
    NL Query -> GeoPlan -> Operation Registry -> Deterministic Evidence -> Confidence -> Grounded Response
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Query question cannot be empty.")
    
    plan = generate_geoplan(req.question)
    report = execute_geoplan(plan)
    return report
