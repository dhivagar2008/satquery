"use client";

import React from "react";
import { Layers, Trees, Building2, Waves, Radio, Eye } from "lucide-react";
import { IndexType, BasemapType } from "@/lib/types";

interface LayerSelectorProps {
  selectedIndex: IndexType;
  onIndexChange: (index: IndexType) => void;
  selectedBasemap: BasemapType;
  onBasemapChange: (basemap: BasemapType) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  isLoading: boolean;
}

const INDEX_CONFIG: Array<{
  id: IndexType;
  name: string;
  formula: string;
  desc: string;
  icon: any;
  color: string;
}> = [
  {
    id: "NDVI",
    name: "NDVI Vegetation",
    formula: "(NIR - RED) / (NIR + RED)",
    desc: "Forest loss, canopy health, agriculture",
    icon: Trees,
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  },
  {
    id: "NDBI",
    name: "NDBI Built-Up",
    formula: "(SWIR - NIR) / (SWIR + NIR)",
    desc: "Urban sprawl, industrial extrusion, roads",
    icon: Building2,
    color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  },
  {
    id: "NDWI",
    name: "NDWI Hydrology",
    formula: "(GREEN - NIR) / (GREEN + NIR)",
    desc: "Lake shrinkage, flooding, reservoir level",
    icon: Waves,
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
  {
    id: "SAR",
    name: "Sentinel-1 SAR",
    formula: "VV / VH Backscatter Differential",
    desc: "Cloud-penetrating radar, surface texture",
    icon: Radio,
    color: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  },
];

export function LayerSelector({
  selectedIndex,
  onIndexChange,
  selectedBasemap,
  onBasemapChange,
  opacity,
  onOpacityChange,
  isLoading,
}: LayerSelectorProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-surface/80 border border-border rounded-xl backdrop-blur-md">
      {/* Spectral Index Pipeline */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Layers className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Spectral Index Pipeline
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {INDEX_CONFIG.map((cfg) => {
            const Icon = cfg.icon;
            const isSelected = selectedIndex === cfg.id;
            return (
              <button
                key={cfg.id}
                type="button"
                disabled={isLoading}
                onClick={() => onIndexChange(cfg.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? `${cfg.color} ring-1 ring-accent-cyan shadow-md`
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold truncate">
                    {cfg.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono opacity-80 truncate">
                  {cfg.formula}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Basemap Selection */}
      <div className="pt-2 border-t border-border/50">
        <label className="text-[11px] font-medium text-slate-400 mb-1.5 block">
          Cartographic Base Layer
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-[11px]">
          {([
            { id: "osm" as BasemapType, label: "🗺️ OSM" },
            { id: "satellite" as BasemapType, label: "🛰️ Satellite" },
            { id: "terrain" as BasemapType, label: "⛰️ Terrain" },
            { id: "dark" as BasemapType, label: "🌙 Dark" }
          ]).map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onBasemapChange(b.id)}
              className={`py-1.5 px-1 rounded font-medium text-center truncate transition-all ${
                selectedBasemap === b.id
                  ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Opacity */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Heatmap Layer Opacity</span>
          </div>
          <span className="font-mono text-slate-200">{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-full accent-accent-cyan h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
}
