import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.router import api_router
from app.services.gee_service import gee_service
from app.services.attribution_service import attribution_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("satquery.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup diagnostics
    logger.info("==================================================")
    logger.info("🌍 SatQuery Earth Observation API Initialized")
    logger.info(f"🛰️  Earth Engine Active: {gee_service.ee_initialized}")
    logger.info(f"🧠  Gemini AI Active: {attribution_service.gemini_client is not None}")
    logger.info(f"🌐  Environment: {settings.ENVIRONMENT}")
    logger.info("==================================================")
    yield
    logger.info("Shutting down SatQuery API...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Production-ready, full-stack satellite change detection and 3D topographic "
        "analytics API with Google Earth Engine pipelines, Gemini AI attribution, "
        "and cryptographic audit verification."
    ),
    lifespan=lifespan
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "satquery-api",
        "version": settings.VERSION,
        "gee_connected": gee_service.ee_initialized,
        "gemini_active": attribution_service.gemini_client is not None
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "api_v1_prefix": settings.API_V1_STR
    }
