"use client";

import React from "react";
import { TrendingDown, TrendingUp, Minus, Activity, ShieldAlert, Compass } from "lucide-react";
import { AnalysisResponse } from "@/lib/types";

interface MetricsDossierProps {
  analysisData: AnalysisResponse | null;
  isLoading: boolean;
}

export function MetricsDossier({ analysisData, isLoading }: MetricsDossierProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-24 bg-slate-800/60 rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 bg-slate-800/60 rounded-xl" />
          <div className="h-20 bg-slate-800/60 rounded-xl" />
        </div>
        <div className="h-32 bg-slate-800/60 rounded-xl" />
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="p-6 text-center rounded-xl bg-slate-900/60 border border-border text-slate-400 text-sm">
        Select an area of interest and click "Execute Analysis" to view spectral delta metrics.
      </div>
    );
  }

  const { metrics, trajectory } = analysisData;
  const net = metrics.net_change_pct;
  const isLoss = net < 0;
  const isSignificant = Math.abs(net) > 10;

  const totalArea = metrics.total_area_km2 || 1;
  const lossPct = Math.min((metrics.loss_area_km2 / totalArea) * 100, 100);
  const gainPct = Math.min((metrics.gain_area_km2 / totalArea) * 100, 100);
  const stablePct = Math.max(100 - lossPct - gainPct, 0);

  return (
    <div className="space-y-4">
      {/* Primary KPI: Net Spectral Shift */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/90 border border-border shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-accent-cyan" /> Net Spectral Shift
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
              isLoss
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
            }`}
          >
            {isSignificant ? (isLoss ? "Severe Degradation" : "Significant Expansion") : "Nominal Variance"}
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span
            className={`text-3xl font-extrabold font-mono tracking-tight ${
              isLoss ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {net > 0 ? `+${net}%` : `${net}%`}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {isLoss ? (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            )}
            <span>over observation epoch</span>
          </div>
        </div>

        {/* Distribution Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${lossPct}%` }}
              className="bg-rose-500 transition-all duration-500"
              title={`Loss: ${metrics.loss_area_km2} km²`}
            />
            <div
              style={{ width: `${stablePct}%` }}
              className="bg-slate-700 transition-all duration-500"
              title={`Stable: ${metrics.stable_area_km2} km²`}
            />
            <div
              style={{ width: `${gainPct}%` }}
              className="bg-emerald-500 transition-all duration-500"
              title={`Gain: ${metrics.gain_area_km2} km²`}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-0.5">
            <span className="text-rose-400">Loss: {metrics.loss_area_km2} km²</span>
            <span className="text-slate-400">Stable: {metrics.stable_area_km2} km²</span>
            <span className="text-emerald-400">Gain: {metrics.gain_area_km2} km²</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-surface/80 border border-border">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Area Analyzed</span>
          <span className="text-lg font-bold font-mono text-slate-100 mt-1 block">
            {metrics.total_area_km2} <span className="text-xs font-normal text-slate-400">km²</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface/80 border border-border">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Altered Surface</span>
          <span className="text-lg font-bold font-mono text-accent-cyan mt-1 block">
            {roundNum(metrics.loss_area_km2 + metrics.gain_area_km2)}{" "}
            <span className="text-xs font-normal text-slate-400">km²</span>
          </span>
        </div>
      </div>

      {/* Predictive 2035 Trajectory Card */}
      {trajectory && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-border/90 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent-purple" />
              <span className="text-xs font-semibold text-slate-200">
                Predictive 2035 Trajectory
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              {trajectory.risk_classification.replace("_", " ")}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            {trajectory.narrative}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
            {trajectory.projections.map((p) => (
              <div key={p.year} className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] font-mono text-slate-400 block">{p.year}</span>
                <span
                  className={`text-xs font-mono font-bold mt-0.5 block ${
                    p.projected_net_change_pct < 0 ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {p.projected_net_change_pct > 0 ? `+${p.projected_net_change_pct}%` : `${p.projected_net_change_pct}%`}
                </span>
                <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                  {p.projected_loss_km2} km²
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function roundNum(n: number): number {
  return Math.round(n * 10) / 10;
}
