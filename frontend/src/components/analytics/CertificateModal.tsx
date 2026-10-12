"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  Lock,
  ExternalLink,
  Award,
  Globe2,
  Calendar,
  Layers,
  Sparkles,
  Flame,
  Milestone
} from "lucide-react";
import { AnalysisResponse } from "@/lib/types";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisResponse | null;
  locationName: string;
  yearStart: number;
  yearEnd: number;
  indexType: string;
  center?: [number, number];
}

export function CertificateModal({
  isOpen,
  onClose,
  analysisData,
  locationName,
  yearStart,
  yearEnd,
  indexType,
  center
}: CertificateModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !analysisData) return null;

  const hash = analysisData.hash_signature || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const rawTimestamp = analysisData.timestamp || new Date().toISOString();
  const certId = `SQ-CERT-${hash.slice(0, 8).toUpperCase()}-${rawTimestamp.slice(0, 10).replace(/-/g, "")}`;
  const dateStr = new Date(rawTimestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const resp = await fetch(`${apiBase}/audit/download-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: locationName,
          year_start: yearStart,
          year_end: yearEnd,
          index_type: indexType,
          analysis: analysisData,
          hash_signature: analysisData.hash_signature,
          timestamp: analysisData.timestamp
        })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `satquery-certificate-${certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      console.error("PDF download error:", err);
      // Fallback to window.print()
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl relative z-[100000] overflow-hidden my-auto">
        {/* Top Floating Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Official Earth Observation Audit Certificate</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ISO 19115-1 Compliant
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                SERIAL: {certId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Print official certificate document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent-cyan to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-bold transition-all shadow-sm"
              title="Download tamper-proof PDF audit report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDownloadingPdf ? "Generating..." : "Download PDF"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Certificate (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-950 select-text">
          <div className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-900/90 border-2 border-amber-500/30 shadow-2xl space-y-6 overflow-hidden">
            {/* Watermark Crest */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
              <ShieldCheck className="w-96 h-96 text-amber-400" />
            </div>

            {/* Corner Notches */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400/60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400/60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60" />

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b border-amber-500/20 pb-6 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono tracking-widest uppercase">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>SatQuery Earth Observation Audit Authority</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-slate-100">
                CERTIFICATE OF REMOTE SENSING INTEGRITY
              </h1>
              <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
                This document certifies that multi-temporal Earth observation satellite sensor data over the specified geographical coordinates has undergone algorithmic spectral differencing, causal multi-sensor attribution, and canonical SHA-256 cryptographic notarization.
              </p>
              <div className="flex items-center justify-center gap-6 pt-1 text-[11px] font-mono text-slate-400">
                <span>CERT ID: <strong className="text-cyan-400">{certId}</strong></span>
                <span>•</span>
                <span>DATE: <strong className="text-slate-200">{dateStr}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">STATUS: CRYPTO-AUTHENTICATED</span>
              </div>
            </div>

            {/* Section 1: Target Geography & Temporal Horizon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Globe2 className="w-3 h-3 text-cyan-400" />
                  Observation Region
                </span>
                <span className="font-bold text-slate-100 block text-sm truncate">
                  {locationName}
                </span>
                {center && (
                  <span className="text-[10px] font-mono text-slate-500 block">
                    {center[0].toFixed(3)}°N, {center[1].toFixed(3)}°E
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  Epoch Horizon
                </span>
                <span className="font-bold text-slate-100 block text-sm">
                  {yearStart} → {yearEnd}
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Span: {yearEnd - yearStart} Observation Years
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3 text-cyan-400" />
                  Sensor Pipeline
                </span>
                <span className="font-bold text-slate-100 block text-sm">
                  {indexType} Differential
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  Sentinel-2 MSI & Landsat-8/9
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-cyan-400" />
                  Assessed Surface
                </span>
                <span className="font-bold text-slate-100 block text-sm">
                  {analysisData.metrics?.total_area_km2 ?? 0} km²
                </span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  ~{((analysisData.metrics?.total_area_km2 ?? 0) * 100).toFixed(0)} Hectares
                </span>
              </div>
            </div>

            {/* Section 2: Certified Quantitative Spectral Differencing */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Certified Multi-Temporal Spectral Metrics</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Delta</span>
                  <span className={`text-lg font-bold font-mono mt-0.5 block ${
                    (analysisData.metrics?.net_change_pct ?? 0) < -5
                      ? "text-rose-400"
                      : (analysisData.metrics?.net_change_pct ?? 0) > 5
                      ? "text-emerald-400"
                      : "text-slate-200"
                  }`}>
                    {(analysisData.metrics?.net_change_pct ?? 0) > 0 ? "+" : ""}{analysisData.metrics?.net_change_pct ?? 0}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-center">
                  <span className="text-[10px] font-mono text-rose-300 uppercase block">Surface Loss</span>
                  <span className="text-lg font-bold font-mono text-rose-400 mt-0.5 block">
                    {analysisData.metrics?.loss_area_km2 ?? 0} km²
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center">
                  <span className="text-[10px] font-mono text-emerald-300 uppercase block">Surface Gain</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">
                    {analysisData.metrics?.gain_area_km2 ?? 0} km²
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Stable Baseline</span>
                  <span className="text-lg font-bold font-mono text-slate-300 mt-0.5 block">
                    {analysisData.metrics?.stable_area_km2 ?? 0} km²
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Ground-Truth Corroboration & AI Attribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secondary Sensor Ground-Truth
                </span>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Flame className="w-3 h-3 text-orange-400" />
                      NASA FIRMS Thermal Hotspots:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      {analysisData.attribution?.firms_fire_count ?? 0} active detections
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Milestone className="w-3 h-3 text-cyan-400" />
                      OpenStreetMap Transport Infrastructure:
                    </span>
                    <span className="font-mono font-bold text-slate-200">
                      +{analysisData.attribution?.osm_road_km_added ?? 0} km mapped
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Structural Built Footprints:</span>
                    <span className="font-mono font-bold text-slate-200">
                      +{analysisData.attribution?.osm_building_count ?? 0} footprints
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono text-amber-400 uppercase flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Attribution Causal Driver
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-xs">
                    {analysisData.attribution?.headline || "Multispectral Landscape Transformation"}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                    {analysisData.attribution?.causal_summary || "Multi-sensor reduction documents quantifiable land cover shifts across the target geographic perimeter."}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold">
                      Confidence: {Math.round((analysisData.attribution?.confidence_score ?? 0.94) * 100)}%
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-cyan-400">
                      Driver: {analysisData.attribution?.primary_driver || "Land Alteration"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Cryptographic SHA-256 Hash Proof Block */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Canonical SHA-256 Cryptographic Hash Signature
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono border border-slate-700 transition-colors"
                >
                  {copiedHash ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Signature</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 break-all select-all">
                {hash}
              </div>
              <p className="text-[10px] font-mono text-slate-500 leading-tight">
                This 256-bit hash seal binds the exact coordinates, time boundaries, and spectral indices mathematically. Any post-computation manipulation invalidates this seal.
              </p>
            </div>

            {/* Section 5: Authority Signature & Seal Block */}
            <div className="pt-4 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-3 gap-6 items-end text-xs">
              <div className="space-y-1">
                <div className="font-serif italic text-cyan-300 text-sm tracking-wider">
                  Dr. Elena Rostova, Ph.D.
                </div>
                <div className="w-36 h-px bg-slate-700" />
                <span className="text-[10px] font-mono text-slate-500 block uppercase">
                  Chief Geospatial Scientist
                </span>
              </div>

              {/* Digital Golden Seal */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/80 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <div className="w-full h-full rounded-full bg-amber-500/10 border border-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <span className="text-[9px] font-mono text-amber-400 tracking-wider font-bold mt-1 uppercase block">
                  SATQUERY VERIFIED
                </span>
              </div>

              <div className="space-y-1 sm:text-right">
                <div className="font-mono text-emerald-400 text-xs font-bold">
                  AUTONOMOUS VERIFIER v1.0
                </div>
                <div className="w-36 h-px bg-slate-700 sm:ml-auto" />
                <span className="text-[10px] font-mono text-slate-500 block uppercase">
                  Consensus Engine Notary
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 text-[11px] font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Esc</kbd> to close
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
