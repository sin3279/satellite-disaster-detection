import React from "react";
import { Globe, AlertTriangle, Layers, Flame, Droplet, Activity, Wind } from "lucide-react";
import { AnalysisStats } from "../types";

interface StatsBarProps {
  stats: AnalysisStats | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const totalScans = stats?.totalScans ?? 0;
  const criticalAlerts = stats?.criticalAlerts ?? 0;
  const totalArea = stats?.totalAreaMonitoredKm2 ?? 0;
  const breakdown = stats?.hazardBreakdown ?? {};

  return (
    <div id="stats-overview-bar" className="bg-slate-900/60 border-y border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Core numbers */}
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Analyzed Passes
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {totalScans} Missions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Critical Hazards
              </span>
              <span className="text-sm font-bold text-rose-400 font-mono">
                {criticalAlerts} High Alert
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-800/40">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">
                Area Assessed
              </span>
              <span className="text-sm font-bold text-slate-100 font-mono">
                {totalArea.toLocaleString()} km²
              </span>
            </div>
          </div>
        </div>

        {/* Hazard Breakdown Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Active Classes:</span>
          {breakdown.Wildfire && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/50 text-[11px]">
              <Flame className="w-3 h-3 text-amber-400" />
              Wildfire: {breakdown.Wildfire}
            </span>
          )}
          {breakdown.Flood && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-300 border border-blue-800/50 text-[11px]">
              <Droplet className="w-3 h-3 text-cyan-400" />
              Flood: {breakdown.Flood}
            </span>
          )}
          {breakdown.Earthquake && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-950/40 text-orange-300 border border-orange-800/50 text-[11px]">
              <Activity className="w-3 h-3 text-orange-400" />
              Earthquake: {breakdown.Earthquake}
            </span>
          )}
          {breakdown.Cyclone && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/50 text-[11px]">
              <Wind className="w-3 h-3 text-indigo-400" />
              Storm: {breakdown.Cyclone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
