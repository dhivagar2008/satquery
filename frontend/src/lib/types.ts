export type IndexType = "NDVI" | "NDBI" | "NDWI" | "SAR";

export type ViewMode = "2d" | "curtain" | "3d";

export type BasemapType = "satellite" | "dark" | "terrain" | "osm";

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][]; // [[ [lng, lat], ... ]]
}

export interface MetricsResponse {
  total_area_km2: number;
  loss_area_km2: number;
  gain_area_km2: number;
  stable_area_km2: number;
  net_change_pct: number;
  mean_delta?: number;
}

export interface AttributionResponse {
  headline: string;
  causal_summary: string;
  primary_driver: string;
  confidence_score: number;
  key_indicators: string[];
  firms_fire_count?: number;
  osm_road_km_added?: number;
  osm_building_count?: number;
}

export interface TrajectoryPoint {
  year: number;
  projected_net_change_pct: number;
  projected_loss_km2: number;
  risk_level: string;
}

export interface TrajectoryForecast {
  baseline_year: number;
  current_year: number;
  annual_rate_pct: number;
  projections: TrajectoryPoint[];
  risk_classification: string;
  narrative: string;
}

export interface AnalysisResponse {
  status: string;
  tile_url: string;
  baseline_tile_url?: string;
  target_tile_url?: string;
  snapshot_id?: string;
  before_image_url?: string;
  after_image_url?: string;
  diff_image_url?: string;
  before_b64?: string;
  after_b64?: string;
  diff_b64?: string;
  metrics: MetricsResponse;
  attribution: AttributionResponse;
  trajectory?: TrajectoryForecast;
  hash_signature: string;
  timestamp: string;
  metadata?: {
    engine?: string;
    ai_engine?: string;
    index_analyzed?: string;
    location_name?: string;
  };
}

export interface ReportQueryResponse {
  query: string;
  report_title: string;
  executive_summary: string;
  key_findings: string[];
  landscape_assessment: string;
  corroborating_evidence: string[];
  actionable_recommendations: string[];
  confidence_score: number;
  risk_level: string;
  ai_engine_used: string;
  timestamp: string;
}

export interface GeminiKeyTestResponse {
  valid: boolean;
  model: string;
  message: string;
  supported_models?: string[];
  error?: string;
}

export interface GeminiKeySaveResponse {
  success: boolean;
  message: string;
}

export interface SearchResultItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  default_index: IndexType;
  default_years: [number, number];
  preview_delta: string;
  category?: string;
  description?: string;
  bbox?: [number, number, number, number]; // [min_lng, min_lat, max_lng, max_lat]
}

export interface AuditVerificationResponse {
  valid: boolean;
  calculated_hash: string;
  provided_hash: string;
  verification_time: string;
  authority: string;
  status_message: string;
}
