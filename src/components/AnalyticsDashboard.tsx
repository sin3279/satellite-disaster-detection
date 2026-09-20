import React from "react";
import { AnalysisStats, DetectionResult } from "../types";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldAlert,
  Flame,
  Droplets,
  Activity,
  Printer,
  FileText,
  AlertOctagon,
  Building,
  CheckCircle
} from "lucide-react";

interface AnalyticsDashboardProps {
  stats: AnalysisStats | null;
  history: DetectionResult[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  stats,
  history
}) => {
  const handlePrintReport = () => {
    window.print();
  };

  const totalStructures = history.reduce((acc, h) => acc + (h.affectedStructuresCount || 0), 0);
  const totalArea = history.reduce((acc, h) => acc + (h.estimatedDamageAreaKm2 || 0), 0);
  const criticalCount = history.filter((h) => h.severityLevel === "Catastrophic" || h.severityLevel === "Severe").length;

  // Hazard distribution calculations
  const hazardCounts: Record<string, number> = {};
  history.forEach((h) => {
    hazardCounts[h.primaryHazard] = (hazardCounts[h.primaryHazard] || 0) + 1;
  });

  return (
    <div id="analytics-dashboard-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>Disaster Analytics & Environmental Impact Telemetry</span>
            <span className="text-xs font-mono text-cyan-400">
              (Module 7 • Impact Reporting)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Multi-spectral damage quantification, critical structure compromise indices, and report generator
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrintReport}
          className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export Printable Briefing</span>
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Monitored Surface
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {totalArea.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-400">km²</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Satellite orthomosaic coverage</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Compromised Structures
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {totalStructures.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Urban & rural buildings affected</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Catastrophic Alerts
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {criticalCount}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Immediate evacuation required</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Detection Accuracy
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            96.4%
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Gemini 3.8 + Multi-spectral SAR</span>
        </div>
      </div>

      {/* Visual Charts: Hazard Distribution & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Hazard Breakdown Bar visualizer (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Hazard Classification Proportion</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{history.length} Missions Cataloged</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(hazardCounts).map(([hazard, count]) => {
              const percentage = Math.round((count / (history.length || 1)) * 100);
              return (
                <div key={hazard} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{hazard}</span>
                    <span className="font-mono text-slate-400">
                      {count} incidents ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        hazard === "Wildfire"
                          ? "bg-amber-500"
                          : hazard === "Flood"
                          ? "bg-cyan-500"
                          : hazard === "Earthquake"
                          ? "bg-orange-500"
                          : hazard === "Cyclone"
                          ? "bg-indigo-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Scale Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Severity Tiers Matrix</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2.5 pt-1">
            {[
              { level: "Catastrophic (Level 5)", count: history.filter((h) => h.severityScore === 5).length, color: "text-rose-400 border-rose-800 bg-rose-950/40" },
              { level: "Severe (Level 4)", count: history.filter((h) => h.severityScore === 4).length, color: "text-orange-400 border-orange-800 bg-orange-950/40" },
              { level: "Significant (Level 3)", count: history.filter((h) => h.severityScore === 3).length, color: "text-amber-400 border-amber-800 bg-amber-950/40" },
              { level: "Moderate (Level 2)", count: history.filter((h) => h.severityScore === 2).length, color: "text-blue-400 border-blue-800 bg-blue-950/40" },
              { level: "Minimal (Level 1)", count: history.filter((h) => h.severityScore === 1).length, color: "text-emerald-400 border-emerald-800 bg-emerald-950/40" }
            ].map((tier) => (
              <div
                key={tier.level}
                className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${tier.color}`}
              >
                <span className="font-semibold">{tier.level}</span>
                <span className="font-mono font-bold">{tier.count} Missions</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Impact Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Incident Damage Assessment Ledger</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Location / Theater</th>
                <th className="py-2.5 px-3">Hazard</th>
                <th className="py-2.5 px-3">Damage Area</th>
                <th className="py-2.5 px-3">Structures</th>
                <th className="py-2.5 px-3">Evacuation</th>
                <th className="py-2.5 px-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-950/50">
                  <td className="py-2.5 px-3 font-medium text-slate-100">{h.locationName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px]">
                      {h.primaryHazard}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">
                    {h.estimatedDamageAreaKm2?.toLocaleString()} km²
                  </td>
                  <td className="py-2.5 px-3 font-mono text-amber-300">
                    {h.affectedStructuresCount?.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    {h.immediateEvacuationNeed ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> Level 3
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Advisory
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {Math.round(h.confidenceScore * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
