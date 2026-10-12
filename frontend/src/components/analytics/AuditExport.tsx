"use client";

import React, { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Download,
  Printer,
  ExternalLink,
  X,
  Lock
} from "lucide-react";
import { AnalysisResponse, AuditVerificationResponse } from "@/lib/types";
import { CertificateModal } from "./CertificateModal";

interface AuditExportProps {
  analysisData: AnalysisResponse | null;
  verificationResult: AuditVerificationResponse | null;
  isVerifying: boolean;
  onVerify: () => void;
  locationName: string;
  yearStart: number;
  yearEnd: number;
  indexType: string;
}

export function AuditExport({
  analysisData,
  verificationResult,
  isVerifying,
  onVerify,
  locationName,
  yearStart,
  yearEnd,
  indexType,
}: AuditExportProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!analysisData) return null;

  const hash = analysisData.hash_signature;
  const shortHash = `${hash.slice(0, 10)}...${hash.slice(-8)}`;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!analysisData) return;
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

      if (!resp.ok) {
        throw new Error(`Failed to generate PDF: ${resp.status}`);
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `satquery-audit-report-${analysisData.hash_signature.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("PDF download error, opening print preview:", err);
      setShowModal(true);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(analysisData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `satquery-audit-${analysisData.hash_signature.slice(0, 8)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 rounded-xl bg-surface/90 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Lock className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Cryptographic Audit Dossier</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">SHA-256</span>
      </div>

      {/* Hash Signature Box */}
      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-slate-500 block">HASH SIGNATURE</span>
          <span className="text-xs font-mono text-slate-200 truncate block select-all">
            {shortHash}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyHash}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors shrink-0"
          title="Copy SHA-256 Hash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Verification Status */}
      {verificationResult && (
        <div
          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
            verificationResult.valid
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">{verificationResult.status_message}</div>
            <div className="text-[10px] font-mono opacity-80 mt-0.5">
              Verified by {verificationResult.authority}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {/* Primary Direct Download Button */}
        <button
          type="button"
          disabled={isDownloadingPdf}
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-accent-cyan to-emerald-400 hover:brightness-110 text-slate-950 transition-all shadow-md active:scale-98 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloadingPdf ? "Generating Official PDF..." : "Download PDF Audit Report"}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isVerifying}
            onClick={onVerify}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
            <span>{isVerifying ? "Verifying..." : "Verify Hash"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-accent-cyan" />
            <span>View Certificate</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Audit Certificate Modal */}
      <CertificateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        analysisData={analysisData}
        locationName={locationName}
        yearStart={yearStart}
        yearEnd={yearEnd}
        indexType={indexType}
      />
    </div>
  );
}
