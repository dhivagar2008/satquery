"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ChevronRight,
  TrendingDown,
  ShieldAlert,
  Flame,
  CornerDownLeft,
  RefreshCw,
  Award
} from "lucide-react";
import { AnalysisResponse, ReportQueryResponse } from "@/lib/types";

interface QueryReportPanelProps {
  analysisData: AnalysisResponse | null;
  isLoading: boolean;
  locationName: string;
  yearStart: number;
  yearEnd: number;
  indexType: string;
  geminiApiKey: string;
  onOpenKeyModal: () => void;
  onViewCertificate?: () => void;
}

const PRESET_QUERIES = [
  { label: "🌲 Deforestation Drivers", query: "What are the primary drivers and spatial patterns of deforestation and canopy loss?" },
  { label: "🏗️ Urban & Road Sprawl", query: "Analyze the expansion of roads, building footprints, and commercial infrastructure." },
  { label: "💧 Water Depletion Risk", query: "Assess surface water contraction, drought severity, and hydrological impact." },
  { label: "⚠️ 2035 Ecological Risk", query: "Provide a forward-looking risk assessment and environmental trajectory for 2035." },
  { label: "📋 Executive Policy Dossier", query: "Generate an executive environmental compliance report with key legal and policy findings." }
];

export function QueryReportPanel({
  analysisData,
  isLoading,
  locationName,
  yearStart,
  yearEnd,
  indexType,
  geminiApiKey,
  onOpenKeyModal,
  onViewCertificate
}: QueryReportPanelProps) {
  const [queryInput, setQueryInput] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryReport, setQueryReport] = useState<ReportQueryResponse | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleRunQuery = async (customQ?: string) => {
    const q = customQ || queryInput;
    if (!q.trim() || !analysisData) return;

    setIsQuerying(true);
    setQueryError(null);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (geminiApiKey) {
        headers["X-Gemini-API-Key"] = geminiApiKey;
      }

      const resp = await fetch(`${apiHost}/query-report`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: q.trim(),
          analysis_data: {
            ...analysisData,
            location_name: locationName,
            year_start: yearStart,
            year_end: yearEnd,
            index_type: indexType
          },
          gemini_api_key: geminiApiKey || undefined
        })
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Report generation failed (${resp.status}): ${errText}`);
      }

      const data: ReportQueryResponse = await resp.json();
      setQueryReport(data);
    } catch (err: any) {
      console.error("Query error:", err);
      setQueryError(err.message || "Failed to generate report from query.");
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDownloadCustomPdf = async () => {
    if (!analysisData || !queryReport) return;
    setIsDownloadingPdf(true);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const resp = await fetch(`${apiHost}/audit/download-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: locationName,
          year_start: yearStart,
          year_end: yearEnd,
          index_type: indexType,
          hash_signature: analysisData.hash_signature,
          snapshot_id: analysisData.snapshot_id,
          before_b64: analysisData.before_b64,
          after_b64: analysisData.after_b64,
          diff_b64: analysisData.diff_b64,
          analysis: analysisData,
          query_report: queryReport
        })
      });

      if (!resp.ok) throw new Error("Failed to compile PDF");

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `satquery-report-${locationName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`PDF download failed: ${err.message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!analysisData) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Sparkles className="w-8 h-8 text-slate-600 animate-pulse" />
        <span className="font-semibold text-slate-300">AI Report Engine Standby</span>
        <span className="text-[11px] max-w-xs">
          Select an Area of Interest or drag on the map to begin asking dynamic change queries.
        </span>
      </div>
    );
  }

  const riskBadgeCol =
    queryReport?.risk_level === "CRITICAL"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
      : queryReport?.risk_level === "HIGH"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20 border border-accent-cyan/30 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-accent-cyan border border-cyan-500/40">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Ask The Changes (AI Report Engine)
            </h3>
            <p className="text-[10px] text-slate-400">
              Query multi-temporal satellite alterations & synthesize custom reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onViewCertificate && (
            <button
              type="button"
              onClick={onViewCertificate}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all shrink-0"
              title="View Cryptographic Audit Certificate for this observation"
            >
              <Award className="w-3 h-3 text-amber-400" />
              <span>View Certificate</span>
            </button>
          )}

          {/* Gemini API Key status chip */}
          <button
            type="button"
            onClick={onOpenKeyModal}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all ${
              geminiApiKey
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${geminiApiKey ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`} />
            <span>{geminiApiKey ? "Gemini Key: Active" : "Connect Gemini"}</span>
          </button>
        </div>
      </div>

      {/* Query Search Input */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunQuery()}
            placeholder="Ask anything about the detected landscape changes..."
            className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan text-xs text-slate-100 placeholder:text-slate-500 shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <button
            type="button"
            disabled={isQuerying || !queryInput.trim()}
            onClick={() => handleRunQuery()}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-accent-cyan text-slate-950 hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {isQuerying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CornerDownLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryInput(preset.query);
                handleRunQuery(preset.query);
              }}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-accent-cyan border border-slate-700/60 transition-colors flex items-center gap-1"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {queryError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{queryError}</span>
        </div>
      )}

      {/* Active Generating Loader */}
      {isQuerying && (
        <div className="p-4 rounded-xl bg-slate-950/70 border border-accent-cyan/30 flex flex-col items-center justify-center gap-2.5 py-6">
          <Loader2 className="w-6 h-6 text-accent-cyan animate-spin" />
          <span className="text-xs font-mono text-cyan-300 font-bold">
            Synthesizing Multi-Temporal Intelligence...
          </span>
          <span className="text-[11px] text-slate-400 max-w-xs text-center">
            Corroborating spectral delta bands, Before/After landscape frames, and secondary sensor records.
          </span>
        </div>
      )}

      {/* Structured Query Report Output */}
      {queryReport && !isQuerying && (
        <div className="space-y-3 pt-1 border-t border-slate-800 animate-fade-in">
          {/* Title & Metadata Header */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-100 leading-snug">
                {queryReport.report_title}
              </h4>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${riskBadgeCol}`}>
                {queryReport.risk_level} RISK
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                Engine: {queryReport.ai_engine_used}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">
                {Math.round(queryReport.confidence_score * 100)}% Confidence
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Executive Finding & Summary
            </span>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {queryReport.executive_summary}
            </p>
          </div>

          {/* Key Findings */}
          {queryReport.key_findings && queryReport.key_findings.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Quantified Observations
              </span>
              <div className="space-y-1">
                {queryReport.key_findings.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-slate-300 bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Landscape Assessment (Before vs After) */}
          {queryReport.landscape_assessment && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                Visual Landscape Transformation Assessment
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-cyan-950/20 p-3 rounded-lg border border-cyan-800/30">
                {queryReport.landscape_assessment}
              </p>
            </div>
          )}

          {/* Actionable Recommendations */}
          {queryReport.actionable_recommendations && queryReport.actionable_recommendations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Actionable Recommendations
              </span>
              <div className="space-y-1">
                {queryReport.actionable_recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-emerald-300 bg-emerald-950/20 px-2.5 py-1.5 rounded border border-emerald-800/30"
                  >
                    <span className="font-mono font-bold text-accent-emerald shrink-0">{i + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: Download Report & View Audit Certificate */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={handleDownloadCustomPdf}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-accent-cyan via-emerald-400 to-accent-cyan bg-size-200 hover:bg-right text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Compiling PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Report (PDF)</span>
                </>
              )}
            </button>

            {onViewCertificate && (
              <button
                type="button"
                onClick={onViewCertificate}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-amber-500/40 hover:border-amber-400 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>View Audit Certificate</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
