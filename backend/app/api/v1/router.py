from fastapi import APIRouter
from app.api.v1.endpoints import analyze, search, audit

api_router = APIRouter()

api_router.include_router(analyze.router, tags=["Satellite Analysis & Differencing"])
api_router.include_router(search.router, tags=["Reverse Semantic Search & Hotspots"])
api_router.include_router(audit.router, prefix="/audit", tags=["Cryptographic Audit & Dossier"])
