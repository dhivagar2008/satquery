from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class GeoJSONPolygon(BaseModel):
    type: str = Field(default="Polygon", description="GeoJSON geometry type")
    coordinates: List[List[List[float]]] = Field(
        ...,
        description="Polygon rings in [[ [lng, lat], ... ]] format"
    )

class AnalysisRequest(BaseModel):
    geometry: GeoJSONPolygon
    year_start: int = Field(default=2016, ge=1984, le=2026, description="Baseline year T1")
    year_end: int = Field(default=2026, ge=1984, le=2026, description="Target year T2")
    index_type: str = Field(default="NDVI", description="Spectral index: NDVI, NDBI, NDWI, or SAR")
    location_name: Optional[str] = Field(default=None, description="Optional human-readable label")

class MetricsResponse(BaseModel):
    total_area_km2: float = Field(..., description="Total bounding area analyzed in square kilometers")
    loss_area_km2: float = Field(..., description="Area of significant loss (delta < -0.2) in km2")
    gain_area_km2: float = Field(..., description="Area of significant gain (delta > 0.2) in km2")
    stable_area_km2: Optional[float] = Field(default=0.0, description="Area of stable land (-0.2 <= delta <= 0.2) in km2")
    net_change_pct: float = Field(..., description="Net shift percentage")
    mean_delta: Optional[float] = Field(default=0.0, description="Mean spectral index shift")

class AttributionResponse(BaseModel):
    headline: str = Field(..., description="Max 10 words summary headline")
    causal_summary: str = Field(..., description="Concise, factual explanation of likely cause")
    primary_driver: str = Field(..., description="Primary identified causal driver")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    key_indicators: List[str] = Field(..., description="3 empirical key indicators")
    firms_fire_count: Optional[int] = Field(default=0, description="NASA FIRMS thermal anomalies")
    osm_road_km_added: Optional[float] = Field(default=0.0, description="OSM linear road network expansion (km)")
    osm_building_count: Optional[int] = Field(default=0, description="OSM new building footprints")

class TrajectoryPoint(BaseModel):
    year: int
    projected_net_change_pct: float
    projected_loss_km2: float
    risk_level: str

class TrajectoryForecast(BaseModel):
    baseline_year: int
    current_year: int
    annual_rate_pct: float
    projections: List[TrajectoryPoint]
    risk_classification: str
    narrative: str

class AnalysisResponse(BaseModel):
    status: str = Field(default="success")
    tile_url: str = Field(..., description="Raster tile URL or dynamic tile endpoint")
    baseline_tile_url: Optional[str] = Field(default=None, description="Baseline imagery tile URL")
    target_tile_url: Optional[str] = Field(default=None, description="Target imagery tile URL")
    snapshot_id: Optional[str] = Field(default=None, description="Unique landscape snapshot batch ID")
    before_image_url: Optional[str] = Field(default=None, description="High-res Before (T1) landscape imagery URL")
    after_image_url: Optional[str] = Field(default=None, description="High-res After (T2) landscape imagery URL")
    diff_image_url: Optional[str] = Field(default=None, description="Spectral change differencing heatmap image URL")
    before_b64: Optional[str] = Field(default=None, description="Base64 encoded Before landscape image")
    after_b64: Optional[str] = Field(default=None, description="Base64 encoded After landscape image")
    diff_b64: Optional[str] = Field(default=None, description="Base64 encoded Spectral Diff image")
    metrics: MetricsResponse
    attribution: AttributionResponse
    trajectory: Optional[TrajectoryForecast] = None
    hash_signature: str = Field(..., description="Cryptographic SHA-256 tamper-proof hash signature")
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

class SearchResultItem(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    zoom: int
    default_index: str
    default_years: List[int]
    preview_delta: str
    category: Optional[str] = "Environmental Shift"
    description: Optional[str] = None
    bbox: Optional[List[float]] = None  # [min_lng, min_lat, max_lng, max_lat]
    country: Optional[str] = None
    source_type: Optional[str] = "curated"  # "curated" | "geocoded" | "coordinate"

class CategoryItem(BaseModel):
    id: str
    name: str
    count: int
    icon: Optional[str] = None
    description: Optional[str] = None

class SearchResponse(BaseModel):
    results: List[SearchResultItem]
    query: str
    total: int

class AuditVerificationRequest(BaseModel):
    geometry: GeoJSONPolygon
    year_start: int
    year_end: int
    index_type: str
    metrics: MetricsResponse
    hash_signature: str

class AuditVerificationResponse(BaseModel):
    valid: bool
    calculated_hash: str
    provided_hash: str
    verification_time: str
    authority: str
    status_message: str

class ReportQueryRequest(BaseModel):
    query: str = Field(..., description="User question or dynamic inquiry about the detected landscape changes")
    analysis_data: Dict[str, Any] = Field(..., description="Full context of the computed analysis and metrics")
    gemini_api_key: Optional[str] = Field(default=None, description="Optional client-provided Gemini API key")
    preferred_model: Optional[str] = Field(default=None, description="Preferred Gemini model, e.g. gemini-2.5-flash, gemini-2.0-flash")

class ReportQueryResponse(BaseModel):
    query: str
    report_title: str
    executive_summary: str
    key_findings: List[str]
    landscape_assessment: str
    corroborating_evidence: List[str]
    actionable_recommendations: List[str]
    confidence_score: float
    risk_level: str
    ai_engine_used: str
    timestamp: str

class GeminiKeyTestRequest(BaseModel):
    api_key: str = Field(..., description="Google Gemini API key to test")
    preferred_model: Optional[str] = Field(default=None, description="Optional preferred model to prioritize")

class GeminiKeyTestResponse(BaseModel):
    valid: bool
    model: str
    message: str
    supported_models: Optional[List[str]] = None
    error: Optional[str] = None

class GeminiKeySaveRequest(BaseModel):
    api_key: str = Field(..., description="Google Gemini API key to persist to backend .env")

class GeminiKeySaveResponse(BaseModel):
    success: bool
    message: str

