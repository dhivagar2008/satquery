"use client";

import React from "react";
import { Sparkles, Flame, Navigation, CheckCircle2, ShieldCheck } from "lucide-react";
import { AttributionResponse } from "@/lib/types";

interface AttributionCardProps {
  attribution: AttributionResponse | null;
  isLoading: boolean;
}

export function AttributionCard({ attribution, isLoading }: AttributionCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/60 border border-border animate-pulse space-y-3">
        <div className="h-4 w-32 bg-slate-800 rounded" />
        <div className="h-6 w-full bg-slate-800 rounded" />
        <div className="h-16 w-full bg-slate-800 rounded" />
      </div>
    );
  }

  if (!attribution) return null;

  const confPct = Math.round(attribution.confidence_score * 100);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border border-accent-cyan/30 shadow-xl space-y-3">
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
            The Why Engine™ (AI Attribution)
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-accent-emerald bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{confPct}% Confidence</span>
        </div>
      </div>

      {/* Declarative Headline */}
      <div>
        <h3 className="text-sm font-bold text-slate-100 leading-snug">
          {attribution.headline}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Driver: {attribution.primary_driver}
          </span>
        </div>
      </div>

      {/* Causal Explanation */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
        {attribution.causal_summary}
      </p>

      {/* Secondary Empirical Key Indicators */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
          Ground-Truth Empirical Indicators
        </span>
        <div className="space-y-1.5">
          {attribution.key_indicators && attribution.key_indicators.map((ind, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-[11px] text-slate-300 bg-slate-800/40 px-2.5 py-1.5 rounded border border-slate-700/50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
              <span>{ind}</span>
            </div>
          ))}

          {attribution.firms_fire_count !== undefined && attribution.firms_fire_count > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1.5 rounded border border-amber-500/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>NASA FIRMS: {attribution.firms_fire_count} active thermal anomaly records detected</span>
            </div>
          )}

          {attribution.osm_road_km_added !== undefined && attribution.osm_road_km_added > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-cyan-300 bg-cyan-500/10 px-2.5 py-1.5 rounded border border-cyan-500/30">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>OSM Infrastructure: +{attribution.osm_road_km_added} km linear arterial corridors mapped</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
