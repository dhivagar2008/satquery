"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MoveHorizontal, Eye, Play, Pause, RotateCcw } from "lucide-react";
import { AnalysisResponse, BasemapType } from "@/lib/types";

interface SplitCurtainProps {
  center: [number, number];
  zoom: number;
  yearStart: number;
  yearEnd: number;
  analysisData: AnalysisResponse | null;
  heatmapOpacity: number;
  basemap?: BasemapType;
}

export function SplitCurtain({
  center,
  zoom,
  yearStart,
  yearEnd,
  analysisData,
  heatmapOpacity,
  basemap = "satellite",
}: SplitCurtainProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftMapRef = useRef<any>(null);
  const rightMapRef = useRef<any>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);

  const [splitPos, setSplitPos] = useState<number>(50); // percentage (0 - 100)
  const [isAutoSweeping, setIsAutoSweeping] = useState<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const sweepDirectionRef = useRef<number>(1);
  const animFrameRef = useRef<number | null>(null);

  const leftBaseLayerRef = useRef<any>(null);
  const rightBaseLayerRef = useRef<any>(null);

  const getBasemapConfig = (bm?: BasemapType) => {
    if (bm === "dark") {
      return {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: "abcd",
        maxZoom: 20
      };
    }
    if (bm === "terrain") {
      return {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 18
      };
    }
    if (bm === "osm") {
      return {
        url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 19
      };
    }
    return {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19
    };
  };

  // Initialize both synced Leaflet maps
  useEffect(() => {
    const leftEl = leftContainerRef.current;
    const rightEl = rightContainerRef.current;
    if (typeof window === "undefined" || !leftEl || !rightEl) return;

    import("leaflet").then((L) => {
      // 1. Initialize Left Map (T1 Baseline)
      if (!leftMapRef.current) {
        const leftMap = L.map(leftEl, {
          center: center,
          zoom: zoom,
          zoomControl: false,
          attributionControl: false
        });
        leftMapRef.current = leftMap;
      }

      // 2. Initialize Right Map (T2 Target with Heatmap)
      if (!rightMapRef.current) {
        const rightMap = L.map(rightEl, {
          center: center,
          zoom: zoom,
          zoomControl: false,
          attributionControl: false
        });
        rightMapRef.current = rightMap;
      }

      const leftMap = leftMapRef.current;
      const rightMap = rightMapRef.current;

      // Update base layers on both maps
      const bmCfg = getBasemapConfig(basemap);
      if (leftBaseLayerRef.current) leftMap.removeLayer(leftBaseLayerRef.current);
      leftBaseLayerRef.current = L.tileLayer(bmCfg.url, {
        subdomains: bmCfg.subdomains || "abc",
        maxZoom: bmCfg.maxZoom || 19
      }).addTo(leftMap);

      if (rightBaseLayerRef.current) rightMap.removeLayer(rightBaseLayerRef.current);
      rightBaseLayerRef.current = L.tileLayer(bmCfg.url, {
        subdomains: bmCfg.subdomains || "abc",
        maxZoom: bmCfg.maxZoom || 19
      }).addTo(rightMap);

      // Synchronize pan and zoom between left and right maps
      let isSyncing = false;

      function syncLeftToRight() {
        if (isSyncing) return;
        isSyncing = true;
        rightMap.setView(leftMap.getCenter(), leftMap.getZoom(), { animate: false });
        isSyncing = false;
      }

      function syncRightToLeft() {
        if (isSyncing) return;
        isSyncing = true;
        leftMap.setView(rightMap.getCenter(), rightMap.getZoom(), { animate: false });
        isSyncing = false;
      }

      leftMap.on("move", syncLeftToRight);
      rightMap.on("move", syncRightToLeft);

      // Add heatmap overlay to right map if analysis data available
      if (analysisData && analysisData.tile_url) {
        let fullTileUrl = analysisData.tile_url;
        if (fullTileUrl.startsWith("/")) {
          const apiHost = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
            : "http://localhost:8000";
          fullTileUrl = `${apiHost}${fullTileUrl}`;
        }

        L.tileLayer(fullTileUrl, {
          opacity: heatmapOpacity,
          maxZoom: 19,
          zIndex: 100
        }).addTo(rightMap);
      }

      // Center both maps
      leftMap.setView(center, zoom, { animate: false });
      rightMap.setView(center, zoom, { animate: false });
    });

    return () => {
      // Cleanup
    };
  }, [center, zoom, analysisData, heatmapOpacity]);

  // Handle Dragging Curtain Slider
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = true;
    setIsAutoSweeping(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - rect.left;
    const percentage = Math.min(Math.max((offset / rect.width) * 100, 4), 96);
    setSplitPos(percentage);

    if (leftMapRef.current) leftMapRef.current.invalidateSize();
    if (rightMapRef.current) rightMapRef.current.invalidateSize();
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMouseMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Auto-Sweep Animation
  useEffect(() => {
    if (!isAutoSweeping) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    function sweep(time: number) {
      const delta = time - lastTime;
      lastTime = time;

      setSplitPos((prev) => {
        let next = prev + sweepDirectionRef.current * (delta * 0.035);
        if (next >= 92) {
          next = 92;
          sweepDirectionRef.current = -1;
        } else if (next <= 8) {
          next = 8;
          sweepDirectionRef.current = 1;
        }
        return next;
      });

      if (leftMapRef.current) leftMapRef.current.invalidateSize();
      if (rightMapRef.current) rightMapRef.current.invalidateSize();

      animFrameRef.current = requestAnimationFrame(sweep);
    }

    animFrameRef.current = requestAnimationFrame(sweep);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoSweeping]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden select-none"
    >
      {/* Left Map Viewport (T1 Baseline) */}
      <div
        className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-accent-cyan/90 z-10 shadow-2xl"
        style={{ width: `${splitPos}%` }}
      >
        <div ref={leftContainerRef} className="w-full h-full" />
        {/* T1 Year Badge */}
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-100">
            BEFORE: {yearStart} Baseline
          </span>
        </div>
      </div>

      {/* Right Map Viewport (T2 Target) */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div ref={rightContainerRef} className="w-full h-full" />
        {/* T2 Year Badge */}
        <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-accent-cyan/60 shadow-2xl backdrop-blur-md">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse shadow-sm shadow-cyan-400" />
          <span className="text-xs font-mono font-bold text-accent-cyan">
            AFTER: {yearEnd} Target (+ Differencing)
          </span>
        </div>
      </div>

      {/* Draggable Divider Handle */}
      <div
        className="absolute inset-y-0 z-30 flex items-center justify-center pointer-events-none"
        style={{ left: `${splitPos}%`, transform: "translateX(-50%)" }}
      >
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="pointer-events-auto cursor-ew-resize flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-accent-cyan to-emerald-400 text-slate-950 shadow-2xl ring-4 ring-cyan-500/40 hover:scale-115 active:scale-95 transition-transform"
        >
          <MoveHorizontal className="w-6 h-6 stroke-[2.5]" />
        </div>
      </div>

      {/* Bottom Floating Control Bar (Auto Sweep & Split Presets) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2 p-1.5 rounded-xl bg-surface/90 border border-border/80 shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsAutoSweeping(!isAutoSweeping)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isAutoSweeping
              ? "bg-accent-emerald text-slate-950 ring-2 ring-emerald-400/50 shadow"
              : "bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700"
          }`}
        >
          {isAutoSweeping ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-slate-950" />
              <span>Pause Sweep</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Auto Sweep</span>
            </>
          )}
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => {
            setIsAutoSweeping(false);
            setSplitPos(15);
          }}
          className="px-2 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          After
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAutoSweeping(false);
            setSplitPos(50);
          }}
          className="px-2 py-1 rounded text-[11px] font-mono text-slate-300 hover:text-white bg-slate-800/80 font-bold"
        >
          50/50 Split
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAutoSweeping(false);
            setSplitPos(85);
          }}
          className="px-2 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          Before
        </button>
      </div>
    </div>
  );
}
