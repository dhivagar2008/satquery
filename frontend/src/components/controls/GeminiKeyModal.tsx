"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Key, CheckCircle2, AlertCircle, X, Shield, ExternalLink, Loader2 } from "lucide-react";
import { GeminiKeyTestResponse } from "@/lib/types";

interface GeminiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
}

export function GeminiKeyModal({ isOpen, onClose, apiKey, onSaveKey }: GeminiKeyModalProps) {
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [persistToBackend, setPersistToBackend] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<GeminiKeyTestResponse | null>(null);
  const [savedToEnvMsg, setSavedToEnvMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!inputKey.trim()) {
      onSaveKey("");
      setTestResult({
        valid: false,
        model: "gemini-2.5-flash",
        message: "Gemini API key cleared. SatQuery will use the high-fidelity empirical attribution engine."
      });
      setSavedToEnvMsg(null);
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    setSavedToEnvMsg(null);

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const resp = await fetch(`${apiHost}/test-gemini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: inputKey.trim(),
          preferred_model: selectedModel !== "auto" ? selectedModel : undefined
        })
      });

      const data: GeminiKeyTestResponse = await resp.json();
      setTestResult(data);
      if (data.valid) {
        onSaveKey(inputKey.trim());

        if (persistToBackend) {
          try {
            const saveResp = await fetch(`${apiHost}/save-gemini-key`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ api_key: inputKey.trim() })
            });
            const saveData = await saveResp.json();
            if (saveData.success) {
              setSavedToEnvMsg("✓ Key permanently saved to backend server .env file.");
            }
          } catch (e) {
            console.warn("Could not save to backend env:", e);
          }
        }
      }
    } catch (err: any) {
      setTestResult({
        valid: false,
        model: "gemini-2.0-flash",
        message: "Network error connecting to backend.",
        error: err.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-accent-cyan/40 shadow-2xl p-6 space-y-5 text-slate-100 relative z-[100000]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Connect Google Gemini AI
            </h2>
            <p className="text-xs text-slate-400">
              Power deep multi-modal attribution, custom query reports, and landscape Q&A
            </p>
          </div>
        </div>

        {/* Info Callout */}
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-accent-cyan font-semibold">
            <Shield className="w-4 h-4" />
            <span>Latest Generation Gemini Engine</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-300">
            Supports Google's latest <span className="text-cyan-300 font-mono font-bold">Gemini 2.5 Flash</span> and <span className="text-emerald-300 font-mono font-bold">Gemini 2.0 Flash</span> (with automatic multi-model failover to <span className="text-purple-300 font-mono">1.5 Pro</span> and <span className="text-blue-300 font-mono">1.5 Flash</span>) for comprehensive Earth observation causal reasoning.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
              Gemini Model Version
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Latest Models Active</span>
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan text-xs text-slate-100 font-medium"
          >
            <option value="gemini-2.5-flash">🚀 Gemini 2.5 Flash (Latest Frontier — Recommended)</option>
            <option value="gemini-2.0-flash">⚡ Gemini 2.0 Flash (High Throughput & Vision)</option>
            <option value="gemini-2.0-flash-lite">💡 Gemini 2.0 Flash Lite (Low-Latency Speed)</option>
            <option value="gemini-1.5-pro">🧠 Gemini 1.5 Pro (Deep Complex Reasoning)</option>
            <option value="gemini-1.5-flash">⚡ Gemini 1.5 Flash (Standard Multimodal)</option>
            <option value="auto">🌐 Auto-Cascade (Tries 2.5 Flash → 2.0 Flash → 1.5 Fallback)</option>
          </select>
        </div>

        {/* Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-accent-cyan" />
              Gemini API Key
            </span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-accent-cyan hover:underline flex items-center gap-1"
            >
              Get Free Key from Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </label>

          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan text-xs font-mono text-slate-100 placeholder:text-slate-500"
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="persistToBackend"
              checked={persistToBackend}
              onChange={(e) => setPersistToBackend(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-accent-cyan focus:ring-accent-cyan cursor-pointer"
            />
            <label htmlFor="persistToBackend" className="text-[11px] text-slate-300 cursor-pointer select-none">
              Save permanently to backend configuration (<span className="font-mono text-cyan-300">.env</span>)
            </label>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              testResult.valid
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/40 border-rose-500/40 text-rose-200"
            }`}
          >
            {testResult.valid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <span className="font-bold block">
                {testResult.valid ? `Key Verified & Active (${testResult.model})!` : "Verification Notice"}
              </span>
              <span className="text-[11px] opacity-90 block mt-0.5">
                {testResult.message}
              </span>
              {savedToEnvMsg && (
                <span className="text-[11px] text-emerald-300 font-semibold block mt-1">
                  {savedToEnvMsg}
                </span>
              )}
              {testResult.error && (
                <span className="text-[10px] font-mono text-rose-300 block mt-1">
                  {testResult.error}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          {inputKey && (
            <button
              type="button"
              onClick={() => {
                setInputKey("");
                onSaveKey("");
                setSavedToEnvMsg(null);
                setTestResult({
                  valid: false,
                  model: "gemini-2.0-flash",
                  message: "API Key cleared. Empirical mode active."
                });
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors"
            >
              Clear Key
            </button>
          )}

          <button
            type="button"
            disabled={isTesting}
            onClick={handleTestAndSave}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-accent-cyan to-emerald-400 hover:opacity-90 transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Key...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Connect Key</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
