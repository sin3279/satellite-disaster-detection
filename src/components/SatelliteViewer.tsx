import React, { useState, useRef } from "react";
import { DetectionResult, HazardZone } from "../types";
import {
  Maximize2,
  Minimize2,
  Layers,
  Eye,
  EyeOff,
  Crosshair,
  AlertTriangle,
  Flame,
  Droplet,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass
} from "lucide-react";
import { playTelemetryPing } from "../utils/audioEffects";

interface SatelliteViewerProps {
  imageUrl: string;
  result: DetectionResult | null;
  isScanning: boolean;
  onResetView?: () => void;
  onScan?: () => void;
}

export const SatelliteViewer: React.FC<SatelliteViewerProps> = ({
  imageUrl,
  result,
  isScanning,
  onResetView,
  onScan
}) => {
  const [showOverlays, setShowOverlays] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"normal" | "false-color" | "high-contrast" | "sar-radar" | "ndvi">("normal");
  const [hoveredZone, setHoveredZone] = useState<HazardZone | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const getFilterClass = () => {
    switch (activeFilter) {
      case "false-color":
        return "hue-rotate-90 saturate-200 contrast-125 brightness-105";
      case "high-contrast":
        return "contrast-150 brightness-110 saturate-150";
      case "sar-radar":
        return "invert contrast-200 grayscale brightness-90 saturate-50";
      case "ndvi":
        return "hue-rotate-180 saturate-200 contrast-150";
      default:
        return "";
    }
  };

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    playTelemetryPing(900);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 2.5);
      playTelemetryPing(700 + next * 200);
      return Math.round(next * 10) / 10;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !result) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setMouseCoords({ x: Math.round(xPct), y: Math.round(yPct) });
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
    <div id="satellite-viewport-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Viewport Toolbar */}
      <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold text-slate-200">Satellite Multi-Spectral Stage</span>
          {result && (
            <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {result.satelliteSensor}
            </span>
          )}
        </div>

        {/* Display Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleFilterChange("normal")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "normal" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              RGB
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("false-color")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "false-color" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="NIR/SWIR false-color infrared band (Burn scars & fire)"
            >
              NIR/SWIR
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("sar-radar")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "sar-radar" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Synthetic Aperture Radar (SAR water inundation)"
            >
              SAR Radar
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("ndvi")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "ndvi" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
              title="Normalized Difference Vegetation Index (Chlorophyll)"
            >
              NDVI
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange("high-contrast")}
              className={`px-2 py-1 rounded transition-colors ${
                activeFilter === "high-contrast" ? "bg-slate-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Contrast+
            </button>
          </div>

          {/* Zoom In / Out Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => handleZoom(-0.2)}
              disabled={zoomLevel <= 1}
              className="p-1 hover:text-cyan-400 disabled:opacity-40"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px]">{zoomLevel}x</span>
            <button
              type="button"
              onClick={() => handleZoom(0.2)}
              disabled={zoomLevel >= 2.5}
              className="p-1 hover:text-cyan-400 disabled:opacity-40"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-rose-400"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Overlay Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowOverlays(!showOverlays);
              playTelemetryPing(800);
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              showOverlays
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/60"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Telemetry Grid</span>
          </button>

          {/* Quick Scan AOI Button */}
          {onScan && (
            <button
              id="satellite-quick-scan-btn"
              type="button"
              onClick={onScan}
              disabled={isScanning}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Execute Automated Multi-Spectral Disaster Scan on this AOI"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Scanning..." : "Scan AOI"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMouseCoords(null)}
        className="relative w-full h-[380px] sm:h-[460px] md:h-[500px] bg-slate-950 overflow-hidden select-none flex items-center justify-center cursor-crosshair"
      >
        {imageUrl ? (
          <div
            className="w-full h-full transition-transform duration-200 flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              id="active-satellite-image"
              src={imageUrl}
              alt="Active satellite observation"
              className={`w-full h-full object-cover transition-all duration-300 ${getFilterClass()}`}
              referrerPolicy="no-referrer"
            />
          </div>
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
                  onMouseEnter={() => {
                    setHoveredZone(zone);
                    playTelemetryPing(1100);
                  }}
                  onMouseLeave={() => setHoveredZone(null)}
                  style={{ top, left, width, height }}
                  className={`absolute border-2 rounded-lg transition-all duration-150 cursor-pointer ${getZoneBorderColor(
                    zone.severity
                  )} ${isHovered ? "ring-2 ring-white scale-102 z-30" : "z-20"}`}
                >
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

        {/* Dynamic Coordinates Reticle HUD on mouse hover */}
        {mouseCoords && result && (
          <div className="absolute top-3 left-3 bg-slate-950/90 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 backdrop-blur-sm z-30 pointer-events-none flex items-center gap-2">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>
              AOI PIXEL: X:{mouseCoords.x}% Y:{mouseCoords.y}% | LAT: {(result.coordinates.lat + (50 - mouseCoords.y) * 0.002).toFixed(4)}° LNG: {(result.coordinates.lng + (mouseCoords.x - 50) * 0.002).toFixed(4)}°
            </span>
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
