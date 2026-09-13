import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

class Settings:
    PROJECT_NAME: str = "RetailPulse"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database URL: default to SQLite in data directory, can be overridden with Postgres
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{DATA_DIR / 'retailpulse.db'}"
    )
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Demo Company Config
    COMPANY_NAME: str = "Vertex Retail Group"
    INDUSTRY: str = "Electrical & Consumer Electronics Retail"
    DATE_START: str = "2025-01-01"
    DATE_END: str = "2026-12-31"

settings = Settings()
