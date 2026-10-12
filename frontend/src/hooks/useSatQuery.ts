"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IndexType,
  ViewMode,
  BasemapType,
  GeoJSONPolygon,
  AnalysisResponse,
  SearchResultItem,
  AuditVerificationResponse
} from "../lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Initial default AOI: Rondônia Fishbone Deforestation, Brazil
const DEFAULT_HOTSPOT: SearchResultItem = {
  id: "amazon-rondonia",
  name: "Rondônia Fishbone Deforestation, Brazil",
  lat: -10.8,
  lng: -62.5,
  zoom: 9,
  default_index: "NDVI",
  default_years: [2016, 2026],
  preview_delta: "-34.6% Forest Canopy",
  category: "Deforestation",
  description: "Systematic orthogonal road logging creating extensive fishbone clear-cuts for cattle ranching.",
  bbox: [-63.2, -11.5, -61.8, -10.1]
};

function bboxToPolygon(bbox: [number, number, number, number]): GeoJSONPolygon {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  return {
    type: "Polygon",
    coordinates: [[
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat]
    ]]
  };
}

export function useSatQuery() {
  const [currentHotspot, setCurrentHotspot] = useState<SearchResultItem>(DEFAULT_HOTSPOT);
  const [selectedGeometry, setSelectedGeometry] = useState<GeoJSONPolygon>(
    bboxToPolygon(DEFAULT_HOTSPOT.bbox || [-63.2, -11.5, -61.8, -10.1])
  );
  const [locationName, setLocationName] = useState<string>(DEFAULT_HOTSPOT.name);
  const [center, setCenter] = useState<[number, number]>([DEFAULT_HOTSPOT.lat, DEFAULT_HOTSPOT.lng]);
  const [zoom, setZoom] = useState<number>(DEFAULT_HOTSPOT.zoom);

  const [yearStart, setYearStart] = useState<number>(2016);
  const [yearEnd, setYearEnd] = useState<number>(2026);
  const [indexType, setIndexType] = useState<IndexType>("NDVI");

  const [viewMode, setViewMode] = useState<ViewMode>("2d");
  const [basemap, setBasemap] = useState<BasemapType>("osm");

  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Visualization parameters
  const [curtainSplit, setCurtainSplit] = useState<number>(50); // 0 to 100%
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);
  const [heightExaggeration, setHeightExaggeration] = useState<number>(2.5);
  const [sunAzimuth, setSunAzimuth] = useState<number>(135);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hotspotsList, setHotspotsList] = useState<SearchResultItem[]>([]);

  // Audit state
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Gemini AI Key management
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>("");
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("satquery_gemini_key") || "";
      if (savedKey) setGeminiApiKeyState(savedKey);
    }
  }, []);

  const setGeminiApiKey = useCallback((key: string) => {
    setGeminiApiKeyState(key);
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("satquery_gemini_key", key);
      } else {
        localStorage.removeItem("satquery_gemini_key");
      }
    }
  }, []);

  // Execute Analysis
  const executeAnalysis = useCallback(async (
    customGeom?: GeoJSONPolygon,
    customStart?: number,
    customEnd?: number,
    customIndex?: IndexType,
    customName?: string
  ) => {
    setIsLoading(true);
    setError(null);

    const geom = customGeom || selectedGeometry;
    const yStart = customStart ?? yearStart;
    const yEnd = customEnd ?? yearEnd;
    const idx = customIndex ?? indexType;
    const locName = customName ?? locationName;

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (geminiApiKey) {
        headers["X-Gemini-API-Key"] = geminiApiKey;
      }

      const resp = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          geometry: geom,
          year_start: yStart,
          year_end: yEnd,
          index_type: idx,
          location_name: locName
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Analysis failed (${resp.status}): ${errText}`);
      }

      const data: AnalysisResponse = await resp.json();
      setAnalysisData(data);
      setVerificationResult(null);
    } catch (err: any) {
      console.error("Execution error:", err);
      setError(err.message || "Failed to connect to backend analytics server.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGeometry, yearStart, yearEnd, indexType, locationName]);

  // Select predefined hotspot
  const selectHotspot = useCallback((spot: SearchResultItem) => {
    setCurrentHotspot(spot);
    setLocationName(spot.name);
    setCenter([spot.lat, spot.lng]);
    setZoom(spot.zoom);
    setIndexType(spot.default_index);
    setYearStart(spot.default_years[0]);
    setYearEnd(spot.default_years[1]);

    const geom = spot.bbox
      ? bboxToPolygon(spot.bbox)
      : {
          type: "Polygon" as const,
          coordinates: [[
            [spot.lng - 0.25, spot.lat - 0.25],
            [spot.lng + 0.25, spot.lat - 0.25],
            [spot.lng + 0.25, spot.lat + 0.25],
            [spot.lng - 0.25, spot.lat + 0.25],
            [spot.lng - 0.25, spot.lat - 0.25]
          ]]
        };

    setSelectedGeometry(geom);
    executeAnalysis(geom, spot.default_years[0], spot.default_years[1], spot.default_index, spot.name);
  }, [executeAnalysis]);

  // Search logic
  const performSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(hotspotsList.slice(0, 8));
      return;
    }

    setIsSearching(true);
    try {
      const resp = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (resp.ok) {
        const data = await resp.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.warn("Search fetch error:", err);
    } finally {
      setIsSearching(false);
    }
  }, [hotspotsList]);

  // Verify Audit Hash
  const verifyCurrentAnalysis = useCallback(async () => {
    if (!analysisData) return;
    setIsVerifying(true);
    try {
      const resp = await fetch(`${API_BASE}/audit/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geometry: selectedGeometry,
          year_start: yearStart,
          year_end: yearEnd,
          index_type: indexType,
          metrics: analysisData.metrics,
          hash_signature: analysisData.hash_signature
        })
      });
      if (resp.ok) {
        const ver = await resp.json();
        setVerificationResult(ver);
      }
    } catch (e) {
      console.error("Verification error:", e);
    } finally {
      setIsVerifying(false);
    }
  }, [analysisData, selectedGeometry, yearStart, yearEnd, indexType]);

  // Request device geolocation & reverse-geocode locality
  const requestCurrentLocation = useCallback((autoExecute: boolean = true) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = pos.coords.accuracy;

        setUserLocation({ lat, lng, accuracy: acc });
        setCenter([lat, lng]);
        setZoom(13);

        let name = "Current Device Location";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              const parts = data.display_name.split(",");
              name = parts.slice(0, 3).join(",").trim() || name;
            }
          }
        } catch (e) {
          console.warn("Reverse geocode failed:", e);
        }

        setLocationName(name);

        const deltaDeg = 0.035; // ~3.5km bounding box
        const userGeom: GeoJSONPolygon = {
          type: "Polygon",
          coordinates: [[
            [lng - deltaDeg, lat - deltaDeg],
            [lng + deltaDeg, lat - deltaDeg],
            [lng + deltaDeg, lat + deltaDeg],
            [lng - deltaDeg, lat + deltaDeg],
            [lng - deltaDeg, lat - deltaDeg]
          ]]
        };

        setSelectedGeometry(userGeom);
        setIsLocating(false);

        if (autoExecute) {
          executeAnalysis(userGeom, yearStart, yearEnd, indexType, name);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setIsLocating(false);
        let msg = "Could not access location.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access in your browser.";
        else if (err.code === 2) msg = "Position unavailable. Please check your network connection.";
        else if (err.code === 3) msg = "Location request timed out.";
        setLocationError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [yearStart, yearEnd, indexType, executeAnalysis]);

  // Initial Load: Fetch Hotspots, request user location if available, or execute default analysis
  useEffect(() => {
    let mounted = true;

    async function initCatalog() {
      try {
        const res = await fetch(`${API_BASE}/hotspots`);
        if (res.ok && mounted) {
          const list = await res.json();
          setHotspotsList(list);
          setSearchResults(list.slice(0, 8));
        }
      } catch (err) {
        console.warn("Initial hotspots fetch warning:", err);
      }
    }

    initCatalog();

    // Check geolocation and prompt immediately to represent current location
    if (typeof window !== "undefined" && navigator.geolocation) {
      requestCurrentLocation(true);
    } else {
      executeAnalysis();
    }

    return () => {
      mounted = false;
    };
  }, []);

  return {
    currentHotspot,
    selectedGeometry,
    setSelectedGeometry,
    locationName,
    setLocationName,
    center,
    setCenter,
    zoom,
    setZoom,
    userLocation,
    isLocating,
    locationError,
    requestCurrentLocation,
    yearStart,
    setYearStart,
    yearEnd,
    setYearEnd,
    indexType,
    setIndexType,
    viewMode,
    setViewMode,
    basemap,
    setBasemap,
    analysisData,
    isLoading,
    error,
    curtainSplit,
    setCurtainSplit,
    heatmapOpacity,
    setHeatmapOpacity,
    heightExaggeration,
    setHeightExaggeration,
    sunAzimuth,
    setSunAzimuth,
    showWireframe,
    setShowWireframe,
    searchQuery,
    searchResults,
    isSearching,
    hotspotsList,
    performSearch,
    selectHotspot,
    executeAnalysis,
    verifyCurrentAnalysis,
    verificationResult,
    isVerifying,
    geminiApiKey,
    setGeminiApiKey,
    isGeminiModalOpen,
    setIsGeminiModalOpen
  };
}
