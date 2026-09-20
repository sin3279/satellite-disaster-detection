import React, { useState } from "react";
import { DetectionResult, SatellitePreset } from "../types";
import { Globe, MapPin, Crosshair, Navigation, Layers, Flame, Droplet, Activity, Wind, Mountain, Eye, ExternalLink } from "lucide-react";

interface GeospatialMapProps {
  presets: SatellitePreset[];
  history: DetectionResult[];
  onSelectTarget: (preset: SatellitePreset) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  presets,
  history,
  onSelectTarget
}) => {
  const [selectedPreset, setSelectedPreset] = useState<SatellitePreset>(presets[0]);
  const [activeHazardFilter, setActiveHazardFilter] = useState<string>("all");

  const filteredPresets = presets.filter((p) => {
    if (activeHazardFilter === "all") return true;
    return p.disasterType.toLowerCase() === activeHazardFilter.toLowerCase();
  });

  // Calculate approximate SVG pin coordinates (Mercator-like normalized x, y between 5% and 95%)
  const getCoordinatesPos = (lat: number, lng: number) => {
    // longitude: -180 to 180 => 0% to 100%
    const x = ((lng + 180) / 360) * 100;
    // latitude: 85 to -85 => 0% to 100%
    const y = ((85 - lat) / 170) * 100;
    return {
      x: Math.min(Math.max(x, 5), 95),
      y: Math.min(Math.max(y, 10), 90)
    };
  };

  const getPinColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "wildfire":
        return "bg-amber-500 text-amber-950 border-amber-300 ring-amber-500/50";
      case "flood":
        return "bg-cyan-500 text-cyan-950 border-cyan-300 ring-cyan-500/50";
      case "earthquake":
        return "bg-orange-500 text-orange-950 border-orange-300 ring-orange-500/50";
      case "cyclone":
        return "bg-indigo-500 text-indigo-950 border-indigo-300 ring-indigo-500/50";
      default:
        return "bg-rose-500 text-rose-950 border-rose-300 ring-rose-500/50";
    }
  };

  return (
    <div id="geospatial-map-module" className="space-y-4">
      {/* Module Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Live Geospatial Hazard Map & Satellite Tracker</span>
            <span className="text-xs font-mono text-cyan-400">
              (Module 3 • Global AOI Grid)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time orbital coordinates, high-risk disaster perimeters, and active satellite coverage tracks
          </p>
        </div>

        {/* Hazard Quick Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["all", "wildfire", "flood", "earthquake", "cyclone"].map((haz) => (
            <button
              key={haz}
              type="button"
              onClick={() => setActiveHazardFilter(haz)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeHazardFilter === haz
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {haz}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Map Stage & Telemetry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* World Map Radar View (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* Map Top Telemetry Strip */}
          <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-200 font-sans font-semibold">Orbital Surface Projection</span>
            </div>
            <div className="flex items-center gap-4">
              <span>PROJ: WGS84 Mercator</span>
              <span className="text-cyan-400">TRACKING: {filteredPresets.length} ACTIVE AOIs</span>
            </div>
          </div>

          {/* Interactive World Map SVG Stage */}
          <div className="relative w-full h-[420px] bg-[#070b14] overflow-hidden select-none flex items-center justify-center">
            {/* Latitude / Longitude Coordinate Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-25 grid grid-cols-6 grid-rows-4 border border-cyan-500/20">
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-b border-cyan-500/20" />

              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-b border-cyan-500/20" />

              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-r border-b border-cyan-500/20" />
              <div className="border-b border-cyan-500/20" />

              <div className="border-r border-cyan-500/20" />
              <div className="border-r border-cyan-500/20" />
              <div className="border-r border-cyan-500/20" />
              <div className="border-r border-cyan-500/20" />
              <div className="border-r border-cyan-500/20" />
              <div />
            </div>

            {/* Stylized Vector World Continents SVG */}
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full object-cover opacity-20 pointer-events-none fill-slate-500"
            >
              {/* North America */}
              <path d="M120,80 Q180,60 250,90 Q300,120 280,180 Q230,220 200,260 Q170,240 140,180 Q100,140 120,80 Z" />
              {/* South America */}
              <path d="M230,270 Q280,260 320,310 Q310,380 280,440 Q250,470 230,420 Q210,350 230,270 Z" />
              {/* Europe */}
              <path d="M460,80 Q520,70 560,110 Q540,160 500,170 Q450,150 460,80 Z" />
              {/* Africa */}
              <path d="M460,180 Q540,170 580,240 Q570,340 520,410 Q470,390 450,300 Q430,220 460,180 Z" />
              {/* Asia */}
              <path d="M570,80 Q700,60 840,100 Q880,180 820,260 Q720,280 660,220 Q560,200 570,80 Z" />
              {/* Australia */}
              <path d="M780,320 Q860,310 880,370 Q840,420 790,410 Q760,360 780,320 Z" />
            </svg>

            {/* Orbital Satellite Ground Tracks (Simulated Dashed Orbit Line) */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-t-2 border-cyan-400/20 border-dashed transform -rotate-12 translate-y-12" />
              <div className="w-full h-full border-t-2 border-blue-400/20 border-dashed transform rotate-12 -translate-y-8" />
            </div>

            {/* Interactive Hazard Pins */}
            {filteredPresets.map((preset) => {
              const { x, y } = getCoordinatesPos(preset.coordinates.lat, preset.coordinates.lng);
              const isSelected = selectedPreset?.id === preset.id;

              return (
                <div
                  key={preset.id}
                  id={`map-pin-${preset.id}`}
                  style={{ top: `${y}%`, left: `${x}%` }}
                  onClick={() => setSelectedPreset(preset)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                >
                  {/* Ping Animation on Active/Selected */}
                  <span
                    className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                      isSelected ? "bg-cyan-400" : "bg-rose-500"
                    }`}
                  />

                  {/* Pin Node */}
                  <div
                    className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${getPinColor(
                      preset.disasterType
                    )} ${isSelected ? "ring-4 ring-cyan-400/60 scale-125" : ""}`}
                  >
                    <MapPin className="w-3.5 h-3.5 fill-current" />
                  </div>

                  {/* Hover Floating Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-950/95 border border-cyan-500/60 p-2.5 rounded-xl shadow-2xl z-30 pointer-events-none text-left backdrop-blur-md">
                    <div className="text-[11px] font-bold text-slate-100 truncate">{preset.title}</div>
                    <div className="text-[10px] text-cyan-300 mt-0.5">{preset.disasterType} • {preset.location}</div>
                    <div className="text-[9px] font-mono text-slate-400 mt-1">
                      {preset.coordinates.lat.toFixed(2)}°, {preset.coordinates.lng.toFixed(2)}°
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Left Coordinate Reticle HUD */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 backdrop-blur-md flex items-center gap-3">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>SENSOR CONSTELLATION: SUN-SYNCHRONOUS ORBIT (705 KM)</span>
            </div>
          </div>
        </div>

        {/* Selected Target AOI Detail Card (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Target AOI Telemetry
              </span>
              <span className="text-[11px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 font-bold">
                {selectedPreset.disasterType}
              </span>
            </div>

            <div className="relative h-36 rounded-lg overflow-hidden bg-slate-950 mb-3 border border-slate-800">
              <img
                src={selectedPreset.imageUrl}
                alt={selectedPreset.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1.5 left-2 text-[10px] font-mono text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-800">
                {selectedPreset.coordinates.lat.toFixed(4)}°, {selectedPreset.coordinates.lng.toFixed(4)}°
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-100 leading-snug">
              {selectedPreset.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {selectedPreset.location}, {selectedPreset.country}
            </p>

            <div className="mt-3 space-y-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Sensor:</span>
                <span className="font-mono text-cyan-300 truncate max-w-[170px]">{selectedPreset.sensor}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Resolution:</span>
                <span className="font-mono">{selectedPreset.resolution}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-500">Event Date:</span>
                <span className="font-mono">{selectedPreset.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              {selectedPreset.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectTarget(selectedPreset)}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Crosshair className="w-4 h-4" />
            <span>Load Into Satellite Scanner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
