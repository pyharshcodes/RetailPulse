"""
RetailPulse FastAPI Application Entry Point.
Configures CORS, middleware, global error handlers, and REST API routing.
"""

import time
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.core.config import settings
from backend.app.api.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Retail Business Analytics & Performance Intelligence Command Center for Vertex Retail Group.",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Process timing and enterprise security headers middleware
@app.middleware("http")
async def security_and_timing_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Process timing header
    response.headers["X-Process-Time-Sec"] = f"{process_time:.4f}"
    
    # Enterprise Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    
    return response

# Global Exception Handler (Safe: Never expose raw stack traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Processing Error",
            "message": "An error occurred while processing analytics query. Please verify filter parameters.",
            "detail": "Internal processing exception occurred. Contact system administrator."
        }
    )

# Startup event: ensure SaaS tables, default demo tenant, and indexes exist
@app.on_event("startup")
def startup_event():
    from backend.app.core.setup_saas_db import setup_saas_database
    try:
        setup_saas_database()
    except Exception as e:
        print(f"Warning during setup_saas_database: {e}")

# Mount central API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }

# Check if production frontend build exists (Docker / Production deployment)
DIST_DIR = PROJECT_ROOT / "frontend" / "dist"

if DIST_DIR.exists() and (DIST_DIR / "index.html").exists():
    assets_dir = DIST_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(DIST_DIR / "index.html"))
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "product": settings.PROJECT_NAME,
            "tagline": "One command center for every store, product, customer and rupee.",
            "docs": "/docs",
            "health": "/health",
            "api": f"{settings.API_V1_STR}/overview"
        }

