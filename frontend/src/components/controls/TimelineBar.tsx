"use client";

import React from "react";
import { Calendar, Clock, FastForward } from "lucide-react";

interface TimelineBarProps {
  yearStart: number;
  yearEnd: number;
  onYearStartChange: (year: number) => void;
  onYearEndChange: (year: number) => void;
  isLoading: boolean;
}

const AVAILABLE_YEARS = [2014, 2016, 2018, 2020, 2022, 2024, 2026];

export function TimelineBar({
  yearStart,
  yearEnd,
  onYearStartChange,
  onYearEndChange,
  isLoading,
}: TimelineBarProps) {
  const timespanYears = Math.max(yearEnd - yearStart, 1);

  const applyPreset = (span: number) => {
    const end = 2026;
    const start = Math.max(end - span, 2014);
    onYearStartChange(start);
    onYearEndChange(end);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface/80 border border-border rounded-xl backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Observation Epoch
          </span>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
          Δ {timespanYears} {timespanYears === 1 ? "Year" : "Years"}
        </span>
      </div>

      {/* Dual Selector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Baseline T1 */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Baseline (T₁)</span>
            <span className="font-mono text-slate-200">{yearStart}</span>
          </label>
          <select
            value={yearStart}
            disabled={isLoading}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < yearEnd) onYearStartChange(val);
            }}
            className="w-full bg-slate-900/90 border border-border rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-accent-cyan focus:outline-none"
          >
            {AVAILABLE_YEARS.filter((y) => y < yearEnd).map((y) => (
              <option key={`start-${y}`} value={y}>
                {y} (Sentinel-2 / L8)
              </option>
            ))}
          </select>
        </div>

        {/* Target T2 */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
            <span>Target (T₂)</span>
            <span className="font-mono text-slate-200">{yearEnd}</span>
          </label>
          <select
            value={yearEnd}
            disabled={isLoading}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > yearStart) onYearEndChange(val);
            }}
            className="w-full bg-slate-900/90 border border-border rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-accent-cyan focus:outline-none"
          >
            {AVAILABLE_YEARS.filter((y) => y > yearStart).map((y) => (
              <option key={`end-${y}`} value={y}>
                {y} (Contemporary)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Interval Presets */}
      <div className="flex items-center gap-1.5 pt-1">
        <span className="text-[10px] text-slate-400 shrink-0">Intervals:</span>
        <button
          type="button"
          onClick={() => applyPreset(5)}
          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          5-Year
        </button>
        <button
          type="button"
          onClick={() => applyPreset(10)}
          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          10-Year
        </button>
        <button
          type="button"
          onClick={() => applyPreset(12)}
          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          Full Horizon
        </button>
      </div>
    </div>
  );
}
