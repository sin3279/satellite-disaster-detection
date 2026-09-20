import React, { useState } from "react";
import { DetectionResult, HazardZone } from "../types";
import { Maximize2, Layers, Eye, EyeOff, Crosshair, AlertTriangle, ShieldCheck, Flame, Droplet, RefreshCw } from "lucide-react";

interface SatelliteViewerProps {
  imageUrl: string;
  result: DetectionResult | null;
  isScanning: boolean;
  onResetView?: () => void;
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({
  imageUrl,
  result,
  isScanning,
  onResetView
}) => {
  const [showOverlays, setShowOverlays] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"normal" | "false-color" | "high-contrast">("normal");
  const [hoveredZone, setHoveredZone] = useState<HazardZone | null>(null);

  const getFilterClass = () => {
    switch (activeFilter) {
      case "false-color":
        return "hue-rotate-90 saturate-200 contrast-125";
      case "high-contrast":
        return "contrast-150 brightness-110 saturate-150";
      default:
        return "";
    }
  };

  const getZoneBorderColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-rose-500 bg-rose-500/20 text-rose-300";
      case "warning":
        return "border-amber-500 bg-amber-500/20 text-amber-300";
      case "advisory":
        return "border-cyan-500 bg-cyan-500/20 text-cyan-300";
      default:
        return "border-blue-500 bg-blue-500/20 text-blue-300";
    }
  };

  return (
    <div id="satellite-viewport-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* Viewport Toolbar */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-slate-200">Satellite Orthomosaic Stage</span>
          {result && (
            <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {result.satelliteSensor}
            </span>
          )}
        </div>

        {/* Display Controls */}
        <div className="flex items-center gap-2">
          {/* Filter selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveFilter("normal")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "normal" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              RGB True
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("false-color")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "false-color" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Simulates NIR/SWIR false-color infrared band"
            >
              NIR/SWIR
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("high-contrast")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "high-contrast" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              High Contrast
            </button>
          </div>

          {/* Overlay Toggle */}
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              showOverlays
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/60"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Telemetry Grid</span>
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] bg-slate-950 overflow-hidden select-none flex items-center justify-center">
        {imageUrl ? (
          <img
            id="active-satellite-image"
            src={imageUrl}
            alt="Active satellite observation"
            className={`w-full h-full object-cover transition-all duration-300 ${getFilterClass()}`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-center text-slate-500 p-6 space-y-2">
            <Crosshair className="w-8 h-8 mx-auto text-slate-600 animate-spin" />
            <p className="text-xs">No satellite imagery loaded in buffer</p>
          </div>
        )}

        {/* Subtle Orbital Reticle Grid Overlay */}
        {showOverlays && (
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 grid grid-cols-4 grid-rows-4">
            <div className="border-r border-b border-cyan-500/10 flex items-start p-1.5">
              <span className="text-[9px] font-mono text-cyan-400/50">SEC A1</span>
            </div>
            <div className="border-r border-b border-cyan-500/10 flex items-start p-1.5">
              <span className="text-[9px] font-mono text-cyan-400/50">SEC A2</span>
            </div>
            <div className="border-r border-b border-cyan-500/10 flex items-start p-1.5">
              <span className="text-[9px] font-mono text-cyan-400/50">SEC A3</span>
            </div>
            <div className="border-b border-cyan-500/10 flex items-start p-1.5">
              <span className="text-[9px] font-mono text-cyan-400/50">SEC A4</span>
            </div>

            <div className="border-r border-b border-cyan-500/10" />
            <div className="border-r border-b border-cyan-500/10" />
            <div className="border-r border-b border-cyan-500/10" />
            <div className="border-b border-cyan-500/10" />

            <div className="border-r border-b border-cyan-500/10" />
            <div className="border-r border-b border-cyan-500/10" />
            <div className="border-r border-b border-cyan-500/10" />
            <div className="border-b border-cyan-500/10" />

            <div className="border-r border-cyan-500/10" />
            <div className="border-r border-cyan-500/10" />
            <div className="border-r border-cyan-500/10" />
            <div />
          </div>
        )}

        {/* Hazard Bounding Boxes Overlay */}
        {showOverlays && result && result.identifiedZones && result.identifiedZones.length > 0 && (
          <div className="absolute inset-0 pointer-events-auto">
            {result.identifiedZones.map((zone) => {
              const [ymin, xmin, ymax, xmax] = zone.bbox;
              const top = `${ymin}%`;
              const left = `${xmin}%`;
              const width = `${Math.max(xmax - xmin, 8)}%`;
              const height = `${Math.max(ymax - ymin, 8)}%`;
              const isHovered = hoveredZone?.id === zone.id;

              return (
                <div
                  key={zone.id}
                  id={`hazard-box-${zone.id}`}
                  onMouseEnter={() => setHoveredZone(zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  style={{ top, left, width, height }}
                  className={`absolute border-2 rounded-lg transition-all duration-150 cursor-pointer ${getZoneBorderColor(
                    zone.severity
                  )} ${isHovered ? "ring-2 ring-white scale-102 z-30" : "z-20"}`}
                >
                  {/* Zone Label Badge */}
                  <div className="absolute -top-6 left-0 flex items-center gap-1 bg-slate-950/90 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow border border-slate-700 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{zone.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Laser Reticle Scanning Animation */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-40 bg-cyan-950/20">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="px-4 py-2 rounded-xl bg-slate-950/90 border border-cyan-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3">
                <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono font-semibold text-cyan-300">
                  AI MULTI-SPECTRAL INFERENCE IN PROGRESS...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hovered Zone Details Floating Box */}
        {hoveredZone && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/95 border border-cyan-500/60 p-3 rounded-xl shadow-2xl z-30 backdrop-blur-md animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                {hoveredZone.label}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                {hoveredZone.severity}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {hoveredZone.description}
            </p>
          </div>
        )}

        {/* Coordinate HUD Watermark */}
        {result && (
          <div className="absolute bottom-3 right-3 bg-slate-950/90 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-300 backdrop-blur-sm z-20 flex items-center gap-2">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>
              LAT: {result.coordinates.lat.toFixed(4)}° | LNG: {result.coordinates.lng.toFixed(4)}°
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
