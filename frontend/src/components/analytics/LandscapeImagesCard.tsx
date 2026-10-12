"use client";

import React, { useState } from "react";
import {
  Layers,
  Maximize2,
  Minimize2,
  Calendar,
  ArrowRight,
  Sparkles,
  Download,
  Eye,
  Info
} from "lucide-react";
import { AnalysisResponse } from "@/lib/types";

interface LandscapeImagesCardProps {
  analysisData: AnalysisResponse | null;
  isLoading: boolean;
  yearStart: number;
  yearEnd: number;
  locationName: string;
}

export function LandscapeImagesCard({
  analysisData,
  isLoading,
  yearStart,
  yearEnd,
  locationName
}: LandscapeImagesCardProps) {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; subtitle: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"grid" | "compare">("grid");
  const [comparePos, setComparePos] = useState<number>(50);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse space-y-3">
        <div className="h-4 w-40 bg-slate-800 rounded" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-28 bg-slate-800 rounded-lg" />
          <div className="h-28 bg-slate-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!analysisData) return null;

  const apiHost = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
    : "http://localhost:8000";

  // Resolve image source: base64 preferred for instant display, or full URL
  const beforeSrc = analysisData.before_b64 || (analysisData.before_image_url ? `${apiHost}${analysisData.before_image_url}` : "");
  const afterSrc = analysisData.after_b64 || (analysisData.after_image_url ? `${apiHost}${analysisData.after_image_url}` : "");
  const diffSrc = analysisData.diff_b64 || (analysisData.diff_image_url ? `${apiHost}${analysisData.diff_image_url}` : "");

  if (!beforeSrc && !afterSrc) return null;

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border border-accent-cyan/30 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
            Landscape Imagery (Before & After)
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-accent-cyan border border-cyan-500/30">
          Δ {yearEnd - yearStart} Yrs Snapshot
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Synchronized high-resolution optical satellite captures showing landscape transformation across the target envelope.
      </p>

      {/* View Selector (Grid vs Swipe Compare) */}
      <div className="flex items-center justify-between text-xs pt-1">
        <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("grid")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === "grid"
                ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Gallery View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === "compare"
                ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Side-by-Side Slider
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          Click any image to zoom
        </span>
      </div>

      {/* Mode A: Gallery Grid View */}
      {activeTab === "grid" && (
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Before Card */}
          <div
            onClick={() =>
              setSelectedImage({
                url: beforeSrc,
                title: `T₁ Baseline State (${yearStart})`,
                subtitle: `${locationName} • Historical Optical Sensor Snapshot`
              })
            }
            className="group relative rounded-lg overflow-hidden border border-emerald-500/30 bg-slate-950 cursor-pointer shadow-md hover:border-emerald-400 transition-all"
          >
            <div className="relative aspect-[4/3] w-full bg-slate-900">
              <img
                src={beforeSrc}
                alt={`Before - ${yearStart}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-mono font-bold text-[10px] shadow">
                BEFORE ({yearStart})
              </div>
              <div className="absolute bottom-2 right-2 p-1 rounded bg-slate-900/80 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-2 text-[10px] font-mono text-slate-300 flex items-center justify-between bg-slate-900/70">
              <span>T₁ Historical Baseline</span>
              <span className="text-emerald-400 font-bold">Unaltered</span>
            </div>
          </div>

          {/* After Card */}
          <div
            onClick={() =>
              setSelectedImage({
                url: afterSrc,
                title: `T₂ Target State (${yearEnd})`,
                subtitle: `${locationName} • Contemporary Alteration Snapshot`
              })
            }
            className="group relative rounded-lg overflow-hidden border border-rose-500/30 bg-slate-950 cursor-pointer shadow-md hover:border-rose-400 transition-all"
          >
            <div className="relative aspect-[4/3] w-full bg-slate-900">
              <img
                src={afterSrc}
                alt={`After - ${yearEnd}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-500/90 text-slate-950 font-mono font-bold text-[10px] shadow">
                AFTER ({yearEnd})
              </div>
              <div className="absolute bottom-2 right-2 p-1 rounded bg-slate-900/80 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="p-2 text-[10px] font-mono text-slate-300 flex items-center justify-between bg-slate-900/70">
              <span>T₂ Contemporary State</span>
              <span className="text-rose-400 font-bold">Altered</span>
            </div>
          </div>

          {/* Spectral Difference Composite (Full Width) */}
          {diffSrc && (
            <div
              onClick={() =>
                setSelectedImage({
                  url: diffSrc,
                  title: `Spectral Differencing (Δ Index)`,
                  subtitle: `${locationName} • Divergent Loss (Red) & Gain (Green)`
                })
              }
              className="col-span-2 group relative rounded-lg overflow-hidden border border-amber-500/30 bg-slate-950 cursor-pointer shadow-md hover:border-amber-400 transition-all"
            >
              <div className="relative aspect-[16/7] w-full bg-slate-900">
                <img
                  src={diffSrc}
                  alt="Spectral Differencing Heatmap"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-slate-950 font-mono font-bold text-[10px] shadow">
                  SPECTRAL DIFFERENCING Δ COMPOSITE
                </div>
                <div className="absolute bottom-2 right-2 p-1 rounded bg-slate-900/80 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="p-2 text-[10px] font-mono text-slate-300 flex items-center justify-between bg-slate-900/70">
                <span>Loss (&lt; -0.2) in Red • Gain (&gt; +0.2) in Green</span>
                <span className="text-amber-400 font-bold">
                  Net: {analysisData.metrics.net_change_pct > 0 ? "+" : ""}{analysisData.metrics.net_change_pct.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Mini Swipe Slider */}
      {activeTab === "compare" && (
        <div className="space-y-2 pt-1">
          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-accent-cyan/40 bg-slate-950 shadow-inner select-none">
            {/* Background Image: After (T2) */}
            <img
              src={afterSrc}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Foreground Image: Before (T1) Clipped */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-accent-cyan shadow-2xl"
              style={{ width: `${comparePos}%` }}
            >
              <img
                src={beforeSrc}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "none"
                }}
              />
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-500/90 text-slate-950 font-mono font-bold text-[9px] shadow">
                BEFORE ({yearStart})
              </span>
            </div>

            <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-500/90 text-slate-950 font-mono font-bold text-[9px] shadow">
              AFTER ({yearEnd})
            </span>
          </div>

          {/* Slider controller */}
          <div className="flex items-center gap-3 px-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {yearStart}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={comparePos}
              onChange={(e) => setComparePos(Number(e.target.value))}
              className="flex-1 accent-accent-cyan cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <span className="text-[10px] font-mono text-rose-400 font-bold">
              {yearEnd}
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Modal View */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-3xl w-full rounded-2xl bg-surface border border-accent-cyan/40 shadow-2xl overflow-hidden p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {selectedImage.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedImage.subtitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={selectedImage.url}
                alt="Enlarged satellite snapshot"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>ISO 19115 Standardized Multi-Temporal Surface Capture</span>
              <a
                href={selectedImage.url}
                download="satellite-landscape-snapshot.png"
                className="px-3 py-1.5 rounded-lg bg-accent-cyan text-slate-950 font-bold flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save High-Res PNG</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
