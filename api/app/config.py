import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
FIXTURES_DIR = BASE_DIR / "fixtures" / "recorded"

ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
FIXTURES_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    OFFLINE_REPLAY: bool = True
    LOG_LEVEL: str = "INFO"
    
    # LLM
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # Database
    DATABASE_URL: str = "postgresql://satquery:satquery_pass@localhost:5432/satquery_db"
    
    # Copernicus Data Space Ecosystem
    CDSE_CLIENT_ID: str = ""
    CDSE_CLIENT_SECRET: str = ""
    CDSE_TOKEN_URL: str = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    CDSE_STAC_URL: str = "https://catalogue.dataspace.copernicus.eu/stac"
    SENTINEL_HUB_PROCESS_URL: str = "https://sh.dataspace.copernicus.eu/api/v1/process"
    SENTINEL_HUB_STAT_URL: str = "https://sh.dataspace.copernicus.eu/api/v1/statistics"
    
    # Geocoding
    NOMINATIM_USER_AGENT: str = "SatQueryAI/1.0"
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
