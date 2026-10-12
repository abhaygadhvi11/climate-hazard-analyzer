import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Climate Hazard Trend Analyzer"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Database configuration
    # If MONGODB_URI is provided, uses MongoDB (Atlas or local).
    # Otherwise, seamlessly falls back to embedded TinyDB.
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "climate_hazard_db")
    TINYDB_PATH: str = str(BASE_DIR / "data" / "cache_store.json")

    # Climatological baseline (WMO standard 1991-2020)
    BASELINE_START_YEAR: int = 1991
    BASELINE_END_YEAR: int = 2020
    
    # Climate logic parameters
    PERCENTILE_THRESHOLD: float = 95.0
    CONSECUTIVE_DAYS_MIN: int = 3
    DOY_WINDOW_HALF_DAYS: int = 7  # ±7 days => 15-day window centered on day of year
    MAX_MISSING_DAYS_PERCENT: float = 10.0  # Max 10% missing days before flagging year
    
    # Open-Meteo resolution grid snap (0.25 degrees ~ 25km ERA5 reanalysis)
    GRID_STEP: float = 0.25

    # Rate limiting
    RATE_LIMIT: str = "60/minute"

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "allow"

settings = Settings()
