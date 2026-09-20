import React from "react";
import { SatellitePreset, DisasterType } from "../types";
import { Flame, Droplet, Activity, Wind, Mountain, Eye, Crosshair } from "lucide-react";

interface PresetSelectorProps {
  presets: SatellitePreset[];
  selectedPresetId: string | null;
  onSelectPreset: (preset: SatellitePreset) => void;
  onAnalyzeDirectly?: (preset: SatellitePreset) => void;
  isLoading: boolean;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  presets,
  selectedPresetId,
  onSelectPreset,
  onAnalyzeDirectly,
  isLoading
}) => {
  const getHazardIcon = (type: DisasterType) => {
    switch (type) {
      case "Wildfire":
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case "Flood":
        return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
      case "Earthquake":
        return <Activity className="w-3.5 h-3.5 text-orange-400" />;
      case "Cyclone":
        return <Wind className="w-3.5 h-3.5 text-indigo-400" />;
      case "Volcanic Eruption":
      case "Landslide":
        return <Mountain className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Eye className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div id="mission-library-grid" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span>Verified Earth Observation Mission Library</span>
            <span className="text-xs font-normal text-cyan-400 font-mono">
              ({presets.length} Presets)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Select high-resolution multi-spectral imagery passes from major natural disaster events
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <div
              key={preset.id}
              id={`preset-card-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`group relative rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40"
                  : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Image Preview Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={preset.thumbnailUrl || preset.imageUrl}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                {/* Top Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-xs font-medium text-slate-200 border border-slate-700/60 shadow-sm">
                    {getHazardIcon(preset.disasterType)}
                    <span>{preset.disasterType}</span>
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-slate-400 border border-slate-800">
                    {preset.date}
                  </span>
                </div>

                {/* Coordinates pill */}
                <div className="absolute bottom-2 left-2.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950/90 text-cyan-300 border border-cyan-800/40 flex items-center gap-1">
                    <Crosshair className="w-2.5 h-2.5" />
                    {preset.coordinates.lat.toFixed(2)}°, {preset.coordinates.lng.toFixed(2)}°
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {preset.location}, {preset.country}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                {/* Technical Sensor Spec */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[190px] font-mono text-slate-400" title={preset.sensor}>
                    {preset.sensor}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {preset.resolution}
                  </span>
                </div>

                {/* Action Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPreset(preset);
                      if (onAnalyzeDirectly) {
                        onAnalyzeDirectly(preset);
                      }
                    }}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                        : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                    }`}
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>{isSelected ? "Execute AI Analysis" : "Load Mission Scan"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
