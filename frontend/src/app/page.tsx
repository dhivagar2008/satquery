"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Globe,
  Columns,
  Layers,
  Play,
  RotateCw,
  Sparkles,
  Shield,
  MapPin,
  AlertCircle,
  FileText,
  BarChart3,
  Key,
  Crosshair,
  Award
} from "lucide-react";
import { useSatQuery } from "@/hooks/useSatQuery";
import { SearchBar } from "@/components/controls/SearchBar";
import { TimelineBar } from "@/components/controls/TimelineBar";
import { LayerSelector } from "@/components/controls/LayerSelector";
import { MetricsDossier } from "@/components/analytics/MetricsDossier";
import { AttributionCard } from "@/components/analytics/AttributionCard";
import { AuditExport } from "@/components/analytics/AuditExport";
import { LandscapeImagesCard } from "@/components/analytics/LandscapeImagesCard";
import { QueryReportPanel } from "@/components/analytics/QueryReportPanel";
import { GeminiKeyModal } from "@/components/controls/GeminiKeyModal";
import { CertificateModal } from "@/components/analytics/CertificateModal";

// Dynamic import for Leaflet-dependent components to prevent SSR window reference errors
const MapViewport = dynamic(
  () => import("@/components/map/MapViewport").then((mod) => mod.MapViewport),
  { ssr: false, loading: () => <MapLoadingPlaceholder label="Loading 2D Leaflet Engine..." /> }
);

const SplitCurtain = dynamic(
  () => import("@/components/map/SplitCurtain").then((mod) => mod.SplitCurtain),
  { ssr: false, loading: () => <MapLoadingPlaceholder label="Loading Split-Curtain Swiper..." /> }
);

const Globe3D = dynamic(
  () => import("@/components/map/Globe3D").then((mod) => mod.Globe3D),
  { ssr: false, loading: () => <MapLoadingPlaceholder label="Loading Three.js 3D Mesh Engine..." /> }
);

function MapLoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="w-full h-full min-h-[460px] bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
      <RotateCw className="w-8 h-8 text-accent-cyan animate-spin" />
      <span className="text-xs font-mono">{label}</span>
    </div>
  );
}

export default function DashboardPage() {
  const {
    locationName,
    center,
    zoom,
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
    selectedGeometry,
    setSelectedGeometry,
    analysisData,
    isLoading,
    error,
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
  } = useSatQuery();

  const [drawerTab, setDrawerTab] = useState<"all" | "ai-report" | "metrics">("all");
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 1. TOP HEADER BAR */}
      <header className="h-16 shrink-0 border-b border-border/80 bg-surface/90 backdrop-blur-xl px-4 flex items-center justify-between gap-4 z-30 shadow-md">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-500/20">
            <Globe className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-100">
                SatQuery
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-accent-cyan border border-cyan-500/30">
                EO-3D v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Multi-Temporal Satellite Change & 3D Topographic Engine
            </p>
          </div>
        </div>

        {/* Global Reverse Search Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <SearchBar
            searchQuery={searchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={performSearch}
            onSelectHotspot={selectHotspot}
          />
        </div>

        {/* Right Action Group: Gemini Key Status & View Mode Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Gemini AI Connect Button */}
          <button
            type="button"
            onClick={() => setIsGeminiModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              geminiApiKey
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25 shadow-sm"
                : "bg-slate-900 border-slate-700 text-cyan-300 hover:border-accent-cyan/50 hover:bg-slate-800"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${geminiApiKey ? "text-emerald-400" : "text-accent-cyan animate-pulse"}`} />
            <span className="hidden sm:inline">
              {geminiApiKey ? "Gemini AI: Connected" : "Connect Gemini"}
            </span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "2d"
                  ? "bg-accent-cyan text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">2D Map</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("curtain")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "curtain"
                  ? "bg-accent-cyan text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split Curtain</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "3d"
                  ? "bg-accent-cyan text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">3D Mesh</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT DRAWER: Pipeline & Controls */}
        <aside className="w-80 shrink-0 border-r border-border/80 bg-surface/80 backdrop-blur-xl flex flex-col justify-between overflow-y-auto p-4 gap-4 z-20">
          <div className="space-y-4">
            {/* Active Region Header */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-accent-cyan shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">
                    Target Region
                  </span>
                  <span className="text-xs font-bold text-slate-100 truncate block">
                    {locationName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                    {center[0].toFixed(2)}°N, {center[1].toFixed(2)}°E
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => requestCurrentLocation(true)}
                disabled={isLocating}
                title="Locate my position and analyze"
                className={`p-2 rounded-lg border text-xs transition-all flex items-center justify-center shrink-0 ${
                  userLocation
                    ? "bg-cyan-500/10 border-cyan-500/30 text-accent-cyan hover:bg-cyan-500/20"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>

            {locationError && (
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-2">{locationError}</span>
              </div>
            )}

            {/* Spectral Index Pipeline */}
            <LayerSelector
              selectedIndex={indexType}
              onIndexChange={setIndexType}
              selectedBasemap={basemap}
              onBasemapChange={setBasemap}
              opacity={heatmapOpacity}
              onOpacityChange={setHeatmapOpacity}
              isLoading={isLoading}
            />

            {/* Observation Epoch Timeline */}
            <TimelineBar
              yearStart={yearStart}
              yearEnd={yearEnd}
              onYearStartChange={setYearStart}
              onYearEndChange={setYearEnd}
              isLoading={isLoading}
            />
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            {error && (
              <div className="mb-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="line-clamp-2">{error}</span>
              </div>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => executeAnalysis()}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-accent-cyan via-emerald-400 to-accent-cyan bg-size-200 hover:bg-right transition-all duration-300 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Computing Satellite Delta...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Execute Analysis</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* CENTER CANVAS */}
        <main className="flex-1 relative h-full bg-slate-950 overflow-hidden">
          {viewMode === "2d" && (
            <MapViewport
              center={center}
              zoom={zoom}
              geometry={selectedGeometry}
              onGeometryChange={(geom) => {
                setSelectedGeometry(geom);
                executeAnalysis(geom);
              }}
              basemap={basemap}
              onBasemapChange={setBasemap}
              analysisData={analysisData}
              heatmapOpacity={heatmapOpacity}
              locationName={locationName}
              userLocation={userLocation}
              isLocating={isLocating}
              onRequestLocation={() => requestCurrentLocation(true)}
            />
          )}

          {viewMode === "curtain" && (
            <SplitCurtain
              center={center}
              zoom={zoom}
              yearStart={yearStart}
              yearEnd={yearEnd}
              analysisData={analysisData}
              heatmapOpacity={heatmapOpacity}
              basemap={basemap}
            />
          )}

          {viewMode === "3d" && (
            <Globe3D
              center={center}
              analysisData={analysisData}
              heightExaggeration={heightExaggeration}
              onHeightExaggerationChange={setHeightExaggeration}
              sunAzimuth={sunAzimuth}
              onSunAzimuthChange={setSunAzimuth}
              showWireframe={showWireframe}
              onShowWireframeChange={setShowWireframe}
            />
          )}
        </main>

        {/* RIGHT DRAWER: AI Reports, Q&A, Before/After Imagery, Metrics & Audit */}
        <aside className="w-[430px] shrink-0 border-l border-border/80 bg-surface/85 backdrop-blur-xl flex flex-col overflow-y-auto p-4 gap-4 z-20">
          {/* Drawer Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setDrawerTab("all")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                drawerTab === "all"
                  ? "bg-accent-cyan text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>All Details</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerTab("ai-report")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                drawerTab === "ai-report"
                  ? "bg-accent-cyan text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Report</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerTab("metrics")}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                drawerTab === "metrics"
                  ? "bg-accent-cyan text-slate-950 font-bold shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Metrics</span>
            </button>
          </div>

          {/* TAB: ALL DETAILS (Both Quantitative Metrics & Qualitative AI Reports) */}
          {drawerTab === "all" && (
            <div className="space-y-4">
              {/* Metrics Dossier & Change Percentage */}
              <MetricsDossier
                analysisData={analysisData}
                isLoading={isLoading}
              />

              {/* Before & After Landscape Imagery Card */}
              <LandscapeImagesCard
                analysisData={analysisData}
                isLoading={isLoading}
                yearStart={yearStart}
                yearEnd={yearEnd}
                locationName={locationName}
              />

              {/* Interactive Query Q&A & Report Engine */}
              <QueryReportPanel
                analysisData={analysisData}
                isLoading={isLoading}
                locationName={locationName}
                yearStart={yearStart}
                yearEnd={yearEnd}
                indexType={indexType}
                geminiApiKey={geminiApiKey}
                onOpenKeyModal={() => setIsGeminiModalOpen(true)}
                onViewCertificate={() => setIsCertModalOpen(true)}
              />

              {/* The Why Engine AI Attribution Card */}
              <AttributionCard
                attribution={analysisData ? analysisData.attribution : null}
                isLoading={isLoading}
              />

              {/* Cryptographic SHA-256 Audit Verification & PDF Export */}
              <AuditExport
                analysisData={analysisData}
                verificationResult={verificationResult}
                isVerifying={isVerifying}
                onVerify={verifyCurrentAnalysis}
                locationName={locationName}
                yearStart={yearStart}
                yearEnd={yearEnd}
                indexType={indexType}
              />
            </div>
          )}

          {/* TAB: AI Report, Q&A & Landscape Imagery */}
          {drawerTab === "ai-report" && (
            <div className="space-y-4">
              {/* Before & After Landscape Imagery Card */}
              <LandscapeImagesCard
                analysisData={analysisData}
                isLoading={isLoading}
                yearStart={yearStart}
                yearEnd={yearEnd}
                locationName={locationName}
              />

              {/* Interactive Query Q&A & Report Engine */}
              <QueryReportPanel
                analysisData={analysisData}
                isLoading={isLoading}
                locationName={locationName}
                yearStart={yearStart}
                yearEnd={yearEnd}
                indexType={indexType}
                geminiApiKey={geminiApiKey}
                onOpenKeyModal={() => setIsGeminiModalOpen(true)}
                onViewCertificate={() => setIsCertModalOpen(true)}
              />

              {/* The Why Engine AI Attribution Card */}
              <AttributionCard
                attribution={analysisData ? analysisData.attribution : null}
                isLoading={isLoading}
              />

              {/* Cryptographic Audit Certificate Access in AI Report Tab */}
              {analysisData && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-100 block truncate">
                        Cryptographic Audit Certificate
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        ISO 19115-1 • SHA-256 Verified Dossier
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCertModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shrink-0 active:scale-98"
                  >
                    View Certificate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: Metrics Dossier & Cryptographic Audit */}
          {drawerTab === "metrics" && (
            <div className="space-y-4">
              <MetricsDossier
                analysisData={analysisData}
                isLoading={isLoading}
              />

              <AuditExport
                analysisData={analysisData}
                verificationResult={verificationResult}
                isVerifying={isVerifying}
                onVerify={verifyCurrentAnalysis}
                locationName={locationName}
                yearStart={yearStart}
                yearEnd={yearEnd}
                indexType={indexType}
              />
            </div>
          )}
        </aside>
      </div>

      {/* Gemini AI Key Modal */}
      <GeminiKeyModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        apiKey={geminiApiKey}
        onSaveKey={setGeminiApiKey}
      />

      {/* Cryptographic Audit Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        analysisData={analysisData}
        locationName={locationName}
        yearStart={yearStart}
        yearEnd={yearEnd}
        indexType={indexType}
        center={center}
      />
    </div>
  );
}
