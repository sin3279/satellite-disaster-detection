import React, { useState } from "react";
import { DetectionResult } from "../types";
import {
  ShieldAlert,
  Flame,
  Droplet,
  Activity,
  Wind,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  Copy,
  Check,
  Building,
  Maximize2,
  FileText,
  Printer,
  Radio,
  Siren,
  ExternalLink
} from "lucide-react";
import { playTelemetryPing, playCriticalAlert } from "../utils/audioEffects";

interface AnalysisReportProps {
  result: DetectionResult | null;
  onRefresh?: () => void;
  onEscalateToDispatch?: (result: DetectionResult) => void;
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({
  result,
  onEscalateToDispatch
}) => {
  const [copied, setCopied] = useState(false);
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  if (!result) {
    return (
      <div id="no-report-placeholder" className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-500 space-y-3">
        <FileText className="w-10 h-10 mx-auto text-slate-700" />
        <p className="text-sm font-medium text-slate-400">No Mission Assessment Generated</p>
        <p className="text-xs max-w-sm mx-auto text-slate-500">
          Select a satellite imagery pass from the Mission Library or upload reconnaissance photography to execute automated disaster detection.
        </p>
      </div>
    );
  }

  const getSeverityBadge = () => {
    switch (result.severityLevel) {
      case "Catastrophic":
        return {
          bg: "bg-rose-950/80 text-rose-300 border-rose-800",
          barColor: "bg-rose-500",
          text: "Catastrophic (Level 5)"
        };
      case "Severe":
        return {
          bg: "bg-orange-950/80 text-orange-300 border-orange-800",
          barColor: "bg-orange-500",
          text: "Severe (Level 4)"
        };
      case "Significant":
        return {
          bg: "bg-amber-950/80 text-amber-300 border-amber-800",
          barColor: "bg-amber-500",
          text: "Significant (Level 3)"
        };
      case "Moderate":
        return {
          bg: "bg-blue-950/80 text-blue-300 border-blue-800",
          barColor: "bg-blue-500",
          text: "Moderate (Level 2)"
        };
      default:
        return {
          bg: "bg-emerald-950/80 text-emerald-300 border-emerald-800",
          barColor: "bg-emerald-500",
          text: "Minimal (Level 1)"
        };
    }
  };

  const badge = getSeverityBadge();

  const handleCopyReport = () => {
    playTelemetryPing(880);
    const reportText = `[SATELLITE DISASTER ASSESSMENT REPORT]
Title: ${result.title}
Primary Hazard: ${result.primaryHazard} (${result.disasterType})
Severity: ${result.severityLevel} (Score: ${result.severityScore}/5)
Confidence: ${(result.confidenceScore * 100).toFixed(1)}%
Location: ${result.locationName} (${result.coordinates.lat}, ${result.coordinates.lng})
Damaged Area: ${result.estimatedDamageAreaKm2} km²
Affected Structures: ${result.affectedStructuresCount}
Evacuation Alert: ${result.immediateEvacuationNeed ? "CRITICAL IMMEDIATE EVACUATION" : "Advisory Stage"}
Summary: ${result.detectionSummary}
Environmental Impact: ${result.environmentalImpact}
Emergency Recommendations:
${result.emergencyResponseRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    playTelemetryPing(1000);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `disaster-report-${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrintDossier = () => {
    playTelemetryPing(750);
    window.print();
  };

  const toggleAction = (idx: number) => {
    playTelemetryPing(1200);
    setCheckedActions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div id="disaster-assessment-report" className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.text}
            </span>
            {result.immediateEvacuationNeed && (
              <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 animate-pulse flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                EVACUATION PROTOCOL ACTIVE
              </span>
            )}
            <span className="text-[11px] font-mono text-slate-400">
              Confidence: {(result.confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">
            {result.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            AOI: <span className="text-slate-300 font-semibold">{result.locationName}</span> | Sensor:{" "}
            <span className="text-cyan-400 font-mono">{result.satelliteSensor}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            id="copy-report-btn"
            type="button"
            onClick={handleCopyReport}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy formatted summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
          </button>

          <button
            id="download-json-btn"
            type="button"
            onClick={handleDownloadJson}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-xs font-medium text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export full GeoJSON / telemetry record"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={handlePrintDossier}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print or Save PDF Dossier"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {onEscalateToDispatch && (
            <button
              type="button"
              onClick={() => {
                playCriticalAlert();
                onEscalateToDispatch(result);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-xs font-bold text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Escalate to Incident Dispatch module"
            >
              <Siren className="w-3.5 h-3.5 text-rose-400" />
              <span>Dispatch</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Metric Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Impacted Area
          </span>
          <span className="text-lg font-bold font-mono text-cyan-300 mt-0.5 block">
            {result.estimatedDamageAreaKm2.toLocaleString()} km²
          </span>
          <span className="text-[10px] text-slate-500">Spectral footprint</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Damaged Structures
          </span>
          <span className="text-lg font-bold font-mono text-amber-300 mt-0.5 block">
            {result.affectedStructuresCount.toLocaleString()} units
          </span>
          <span className="text-[10px] text-slate-500">Urban/rural footprints</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Severity Meter
          </span>
          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`h-2 flex-1 rounded-sm ${
                  lvl <= result.severityScore ? badge.barColor : "bg-slate-800"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Level {result.severityScore} of 5
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Detection Method
          </span>
          <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
            {result.isAiGenerated ? "Gemini Multimodal" : "Spectral Heuristic"}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {result.primaryHazard} Signature
          </span>
        </div>
      </div>

      {/* Technical Summary & Environmental Impact */}
      <div className="space-y-4">
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Remote Sensing Detection Findings</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {result.detectionSummary}
          </p>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-amber-400" />
            <span>Environmental & Biome Degradation Assessment</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {result.environmentalImpact}
          </p>
        </div>
      </div>

      {/* Actionable First-Responder Recommendations */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Emergency Response & Civil Defense Protocols</span>
        </h3>
        <div className="space-y-2">
          {result.emergencyResponseRecommendations.map((rec, index) => {
            const isDone = !!checkedActions[index];
            return (
              <div
                key={index}
                onClick={() => toggleAction(index)}
                className={`p-3 rounded-lg border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                  isDone
                    ? "bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through"
                    : "bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span className="flex-1 leading-relaxed">{rec}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
