"use client";

import React, { useEffect, useRef, useState } from "react";
import { GeoJSONPolygon, BasemapType, AnalysisResponse } from "@/lib/types";
import {
  Maximize2,
  MousePointer,
  Square,
  Layers,
  Compass,
  Sparkles,
  Navigation,
  LocateFixed,
  Scan,
  Crosshair,
  Map as MapIcon,
  Satellite,
  Mountain,
  Moon,
  Loader2,
  X
} from "lucide-react";

interface MapViewportProps {
  center: [number, number];
  zoom: number;
  geometry: GeoJSONPolygon;
  onGeometryChange: (geom: GeoJSONPolygon) => void;
  basemap: BasemapType;
  onBasemapChange?: (basemap: BasemapType) => void;
  analysisData: AnalysisResponse | null;
  heatmapOpacity: number;
  locationName?: string;
  userLocation?: { lat: number; lng: number; accuracy?: number } | null;
  isLocating?: boolean;
  onRequestLocation?: () => void;
}

interface BasemapConfig {
  url: string;
  attribution: string;
  subdomains?: string;
  maxZoom?: number;
  fallbackUrl?: string;
}

const BASEMAP_TILES: Record<BasemapType, BasemapConfig> = {
  osm: {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 19
  },
  terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Sources: Esri, USGS, NOAA, DeLorme, Intermap",
    maxZoom: 18
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    subdomains: "abcd",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
    maxZoom: 20,
    fallbackUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
  }
};

export function MapViewport({
  center,
  zoom,
  geometry,
  onGeometryChange,
  basemap,
  onBasemapChange,
  analysisData,
  heatmapOpacity,
  locationName,
  userLocation,
  isLocating,
  onRequestLocation
}: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const baseLayersRef = useRef<{ [key in BasemapType]?: any }>({});
  const polygonLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const userLocationGroupRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const layersControlRef = useRef<any>(null);

  const [isDrawingBBox, setIsDrawingBBox] = useState(false);
  const [liveDragArea, setLiveDragArea] = useState<string | null>(null);
  const [coordsDisplay, setCoordsDisplay] = useState<string>("");

  useEffect(() => {
    const container = containerRef.current;
    if (typeof window === "undefined" || !container) return;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      // Fix default Leaflet icon paths in Next.js/Webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current) {
        const map = L.map(container, {
          center: center,
          zoom: zoom,
          zoomControl: false,
        });

        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

        // Add Leaflet Layers Control (allows 1-click toggling between Leaflet OSM, Satellite, Dark & Terrain)
        const osmLayer = L.tileLayer(BASEMAP_TILES.osm.url, {
          attribution: BASEMAP_TILES.osm.attribution,
          maxZoom: BASEMAP_TILES.osm.maxZoom || 19
        });
        const satLayer = L.tileLayer(BASEMAP_TILES.satellite.url, {
          attribution: BASEMAP_TILES.satellite.attribution,
          maxZoom: BASEMAP_TILES.satellite.maxZoom || 19
        });
        const darkLayer = L.tileLayer(BASEMAP_TILES.dark.url, {
          subdomains: BASEMAP_TILES.dark.subdomains || "abcd",
          attribution: BASEMAP_TILES.dark.attribution,
          maxZoom: BASEMAP_TILES.dark.maxZoom || 20
        });
        const terrainLayer = L.tileLayer(BASEMAP_TILES.terrain.url, {
          attribution: BASEMAP_TILES.terrain.attribution,
          maxZoom: BASEMAP_TILES.terrain.maxZoom || 18
        });

        // Error fallback for dark tiles: if Carto is blocked, seamlessly route to Esri Dark Canvas
        darkLayer.on("tileerror", function (error: any) {
          if (BASEMAP_TILES.dark.fallbackUrl && error.tile) {
            const z = error.coords.z;
            const x = error.coords.x;
            const y = error.coords.y;
            error.tile.src = `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/${z}/${y}/${x}`;
          }
        });

        baseLayersRef.current = {
          osm: osmLayer,
          satellite: satLayer,
          terrain: terrainLayer,
          dark: darkLayer
        };

        const baseMaps = {
          "🗺️ OpenStreetMap": osmLayer,
          "🛰️ Satellite Imagery": satLayer,
          "⛰️ Topographic Terrain": terrainLayer,
          "🌙 Dark Matter (Night)": darkLayer
        };

        layersControlRef.current = L.control.layers(baseMaps, undefined, {
          position: "topright"
        }).addTo(map);

        map.on("baselayerchange", (e: any) => {
          if (e.name.includes("Satellite")) {
            onBasemapChange?.("satellite");
          } else if (e.name.includes("OpenStreetMap") || e.name.includes("OSM")) {
            onBasemapChange?.("osm");
          } else if (e.name.includes("Dark")) {
            onBasemapChange?.("dark");
          } else if (e.name.includes("Topographic") || e.name.includes("Terrain")) {
            onBasemapChange?.("terrain");
          }
        });

        // Track cursor coordinates
        map.on("mousemove", (e: any) => {
          setCoordsDisplay(
            `${e.latlng.lat.toFixed(4)}°N, ${e.latlng.lng.toFixed(4)}°E`
          );
        });

        mapRef.current = map;
      }

      const map = mapRef.current;

      // Update active base layer cleanly
      const targetLayer = baseLayersRef.current[basemap] || baseLayersRef.current.osm;
      if (targetLayer) {
        Object.values(baseLayersRef.current).forEach((l: any) => {
          if (l && l !== targetLayer && map.hasLayer(l)) {
            map.removeLayer(l);
          }
        });
        if (!map.hasLayer(targetLayer)) {
          targetLayer.addTo(map);
          targetLayer.bringToBack();
        }
      }

      // Pan & Zoom when center changes
      map.setView(center, zoom, { animate: true });

      // Render AOI Center Target Marker with Popup
      if (markerLayerRef.current) {
        map.removeLayer(markerLayerRef.current);
      }

      const activeLayerBadge =
        basemap === "satellite"
          ? "🛰️ Leaflet Satellite Imagery"
          : basemap === "terrain"
          ? "⛰️ Leaflet Topographic Terrain"
          : basemap === "dark"
          ? "🌙 Leaflet Dark Canvas"
          : "🗺️ Leaflet OpenStreetMap";
      const marker = L.marker(center).addTo(map);
      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; min-width: 170px; padding: 2px;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
            📍 ${locationName || "Target Region"}
          </div>
          <div style="font-size: 11px; color: #475569; font-family: monospace;">
            ${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E
          </div>
          <div style="margin-top: 4px; font-size: 10px; color: #0284c7; font-weight: 600;">
            ${activeLayerBadge}
          </div>
        </div>
      `);
      markerLayerRef.current = marker;

      // Render Current User GPS Location (Marker + Accuracy Circle)
      if (userLocationGroupRef.current) {
        map.removeLayer(userLocationGroupRef.current);
        userLocationGroupRef.current = null;
      }

      if (userLocation) {
        const userGroup = L.layerGroup();

        // Accuracy radius circle
        L.circle([userLocation.lat, userLocation.lng], {
          radius: Math.max(userLocation.accuracy || 25, 20),
          color: "#3b82f6",
          fillColor: "#60a5fa",
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: "3, 3"
        }).addTo(userGroup);

        // Custom pulsing blue GPS beacon pin
        const gpsIcon = L.divIcon({
          className: "gps-user-beacon",
          html: `
            <div style="position: relative; width: 22px; height: 22px;">
              <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(59, 130, 246, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; inset: 2px; border-radius: 9999px; background: #2563eb; border: 2.5px solid #ffffff; box-shadow: 0 0 10px rgba(37, 99, 235, 0.8);"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const gpsMarker = L.marker([userLocation.lat, userLocation.lng], { icon: gpsIcon }).addTo(userGroup);
        gpsMarker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 170px; padding: 2px;">
            <div style="font-weight: 700; font-size: 13px; color: #1d4ed8; margin-bottom: 2px;">
              🔵 Your Current Location
            </div>
            <div style="font-size: 11px; color: #0f172a; font-weight: 600;">
              ${locationName || "Detected Location"}
            </div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 2px;">
              ${userLocation.lat.toFixed(5)}°N, ${userLocation.lng.toFixed(5)}°E
            </div>
            <div style="margin-top: 4px; font-size: 9px; color: #10b981; font-weight: 600;">
              Accuracy: ±${Math.round(userLocation.accuracy || 15)}m
            </div>
          </div>
        `);

        userGroup.addTo(map);
        userLocationGroupRef.current = userGroup;
      }

      // Render AOI Polygon Boundary
      if (polygonLayerRef.current) {
        map.removeLayer(polygonLayerRef.current);
      }

      if (geometry && geometry.coordinates && geometry.coordinates[0]) {
        const latLngs = geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);
        polygonLayerRef.current = L.polygon(latLngs as any, {
          color: "#06b6d4",
          weight: 2.5,
          opacity: 0.95,
          fillColor: "#06b6d4",
          fillOpacity: 0.08,
          dashArray: "5, 5"
        }).addTo(map);
      }

      // Render Heatmap Tile Layer
      if (heatmapLayerRef.current) {
        map.removeLayer(heatmapLayerRef.current);
        heatmapLayerRef.current = null;
      }

      if (analysisData && analysisData.tile_url) {
        let fullTileUrl = analysisData.tile_url;
        if (fullTileUrl.startsWith("/")) {
          const apiHost = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
            : "http://localhost:8000";
          fullTileUrl = `${apiHost}${fullTileUrl}`;
        }

        heatmapLayerRef.current = L.tileLayer(fullTileUrl, {
          opacity: heatmapOpacity,
          maxZoom: 19,
          zIndex: 100
        }).addTo(map);
      }
    });

    return () => {
      // Cleanup on unmount
    };
  }, [center, zoom, basemap, analysisData, heatmapOpacity, locationName, userLocation]);

  // Handle Box Drawing
  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      let startLatLng: any = null;
      let tempBox: any = null;

      function onMouseDown(e: any) {
        if (!isDrawingBBox) return;
        map.dragging.disable();
        startLatLng = e.latlng;
      }

      function onMouseMove(e: any) {
        if (!isDrawingBBox || !startLatLng) return;
        const currentLatLng = e.latlng;
        const bounds = L.latLngBounds(startLatLng, currentLatLng);

        // Approximate live area in km²
        const latSpanKm = Math.abs(currentLatLng.lat - startLatLng.lat) * 111.0;
        const lngSpanKm =
          Math.abs(currentLatLng.lng - startLatLng.lng) *
          111.0 *
          Math.cos((startLatLng.lat * Math.PI) / 180);
        const liveKm2 = Math.max(latSpanKm * lngSpanKm, 0.1).toFixed(1);
        setLiveDragArea(`${liveKm2} km²`);

        if (tempBox) {
          tempBox.setBounds(bounds);
        } else {
          tempBox = L.rectangle(bounds, {
            color: "#10b981",
            weight: 2.5,
            fillColor: "#10b981",
            fillOpacity: 0.2,
            dashArray: "3, 5"
          }).addTo(map);
        }
      }

      function onMouseUp(e: any) {
        if (!isDrawingBBox || !startLatLng) return;
        const bounds = L.latLngBounds(startLatLng, e.latlng);
        map.dragging.enable();

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const newGeom: GeoJSONPolygon = {
          type: "Polygon",
          coordinates: [[
            [sw.lng, sw.lat],
            [ne.lng, sw.lat],
            [ne.lng, ne.lat],
            [sw.lng, ne.lat],
            [sw.lng, sw.lat]
          ]]
        };

        if (tempBox) {
          map.removeLayer(tempBox);
          tempBox = null;
        }

        setIsDrawingBBox(false);
        setLiveDragArea(null);
        onGeometryChange(newGeom);
      }

      map.on("mousedown", onMouseDown);
      map.on("mousemove", onMouseMove);
      map.on("mouseup", onMouseUp);

      return () => {
        map.off("mousedown", onMouseDown);
        map.off("mousemove", onMouseMove);
        map.off("mouseup", onMouseUp);
        if (tempBox) map.removeLayer(tempBox);
      };
    });
  }, [isDrawingBBox, onGeometryChange]);

  // Escape key cancels box drawing
  useEffect(() => {
    if (!isDrawingBBox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDrawingBBox(false);
        setLiveDragArea(null);
        if (mapRef.current) mapRef.current.dragging.enable();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawingBBox]);

  const fitToActiveAOI = () => {
    if (!mapRef.current || !geometry?.coordinates?.[0]) return;
    import("leaflet").then((L) => {
      const latLngs = geometry.coordinates[0].map((coord) => [coord[1], coord[0]]);
      const bounds = L.latLngBounds(latLngs as any);
      mapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    });
  };

  return (
    <div
      className={`relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden ${
        isDrawingBBox ? "cursor-crosshair select-none" : ""
      }`}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Professional Top Floating Geospatial Command Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] max-w-[96%] flex items-center gap-1.5 sm:gap-2 p-1.5 bg-slate-950/90 border border-slate-700/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all">
        {/* GROUP 1: Region Selection & View Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsDrawingBBox(!isDrawingBBox)}
            title={isDrawingBBox ? "Cancel Area Selection (Esc)" : "Select custom Area of Interest on map"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isDrawingBBox
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-emerald-500/20"
                : "bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700"
            }`}
          >
            {isDrawingBBox ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold tracking-tight">Box Select Active</span>
              </>
            ) : (
              <>
                <Scan className="w-3.5 h-3.5 text-accent-cyan" />
                <span className="hidden sm:inline">Drag & Select Area</span>
                <span className="sm:hidden">Select Area</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={fitToActiveAOI}
            title="Re-Center Camera to Active Area of Interest"
            className="p-1.5 rounded-xl bg-slate-900/90 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-800 mx-0.5" />

        {/* GROUP 2: GPS Geolocation */}
        <button
          type="button"
          onClick={() => onRequestLocation?.()}
          disabled={isLocating}
          title={
            userLocation
              ? `GPS Position Acquired: ${userLocation.lat.toFixed(3)}°, ${userLocation.lng.toFixed(3)}°`
              : "Detect device GPS coordinates and fly to current location"
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            isLocating
              ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 animate-pulse"
              : userLocation
              ? "bg-slate-900/90 text-emerald-300 border border-emerald-500/40 hover:bg-slate-800"
              : "bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700"
          }`}
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Locating GPS...</span>
            </>
          ) : userLocation ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Current Location</span>
              <span className="sm:hidden">My GPS</span>
            </>
          ) : (
            <>
              <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
              <span>Locate Me</span>
            </>
          )}
        </button>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-800 mx-0.5" />

        {/* GROUP 3: Professional Segmented Basemap Switcher */}
        <div className="flex items-center p-0.5 bg-slate-900/90 border border-slate-800 rounded-xl gap-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => onBasemapChange?.("osm")}
            title="Switch to OpenStreetMap Standard Street Layer"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === "osm"
                ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Street</span>
          </button>

          <button
            type="button"
            onClick={() => onBasemapChange?.("satellite")}
            title="Switch to Esri High-Resolution World Imagery Satellite"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === "satellite"
                ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Satellite</span>
          </button>

          <button
            type="button"
            onClick={() => onBasemapChange?.("terrain")}
            title="Switch to Esri Topographic Relief Terrain Map"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === "terrain"
                ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Terrain</span>
          </button>

          <button
            type="button"
            onClick={() => onBasemapChange?.("dark")}
            title="Switch to CartoDB Dark Matter / Midnight Canvas (Night Mode)"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              basemap === "dark"
                ? "bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold shadow-md shadow-cyan-500/25 ring-1 ring-cyan-300"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${basemap === "dark" ? "text-slate-950 fill-slate-950" : "text-amber-300"}`} />
            <span className="text-[11px] font-bold">Dark</span>
          </button>
        </div>
      </div>

      {/* Floating HUD Instruction Banner when Box Selecting */}
      {isDrawingBBox && (
        <div className="absolute top-[72px] left-1/2 -translate-x-1/2 z-[400] px-4 py-2 rounded-xl bg-slate-950/95 border border-emerald-500/60 text-xs font-medium text-emerald-200 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
            <span>
              {liveDragArea
                ? `Active Selection: ~${liveDragArea} • Release mouse to compute changes`
                : "Click and drag across the map to define custom Area of Interest (AOI)"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsDrawingBBox(false);
              setLiveDragArea(null);
              if (mapRef.current) mapRef.current.dragging.enable();
            }}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono border border-slate-600 transition-colors cursor-pointer"
          >
            Esc / Cancel
          </button>
        </div>
      )}

      {/* Spectral Difference Legend */}
      <div className="absolute bottom-6 left-4 z-[400] p-3 bg-surface/90 border border-border/80 rounded-xl shadow-2xl backdrop-blur-md flex flex-col gap-1.5 max-w-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Spectral Differencing (Δ Index)
        </span>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-rose-500 shadow-sm" />
            <span className="text-[11px] text-slate-200">Loss (&lt; -0.2)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-600/50 border border-slate-500" />
            <span className="text-[11px] text-slate-400">Stable</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm" />
            <span className="text-[11px] text-slate-200">Gain (&gt; +0.2)</span>
          </div>
        </div>
      </div>

      {/* Bottom Coordinates Readout */}
      {coordsDisplay && (
        <div className="absolute bottom-2 right-14 z-[400] px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-slate-400 backdrop-blur-sm pointer-events-none">
          {coordsDisplay}
        </div>
      )}
    </div>
  );
}
